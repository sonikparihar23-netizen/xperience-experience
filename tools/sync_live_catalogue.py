"""Check published project facts; use --write to update the shared catalogue.

Reads only the ten XRealty property URLs already recorded in xr-catalogue.js.
A missing field stops the update and leaves the existing catalogue intact.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
import argparse,concurrent.futures,datetime,json,re,subprocess
ROOT=Path(__file__).resolve().parents[1]
class Text(HTMLParser):
    def __init__(self):super().__init__();self.skip=0;self.items=[]
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'):self.skip+=1
    def handle_endtag(self,tag):
        if tag in ('script','style'):self.skip=max(0,self.skip-1)
    def handle_data(self,value):
        if not self.skip and value.strip():self.items.append(value.strip())
def facts(page):
    parser=Text();parser.feed(page);t=parser.items
    def after(label):return t[t.index(label)+1]
    unit=' '.join(t[t.index('Unit Type')+1:t.index('Handover Date')]);beds=[int(x) for x in re.findall(r'\d+',unit)]
    types=[v.title() for v in ['APARTMENT','VILLA','TOWNHOUSE','PENTHOUSE'] if v in unit.upper()]
    price=int(re.sub(r'\D','',after('Starting Price')));plan=[int(x) for x in after('Payment Plan').split('/')]
    if not beds or not types or price<=0 or len(plan)!=2 or sum(plan)!=100:raise ValueError('Unrecognized project facts')
    size='Confirm size with advisor'
    for paragraph in t:
        match=re.search(r'(\d[\d,]*)\s*(?:sq\.?\s*ft\.?|square feet)?\s*(?:to|[-–])\s*(\d[\d,]*)\s*(?:sq\.?\s*ft\.?|square feet)',paragraph,re.I)
        if match:size=match[1]+' – '+match[2]+' sq ft';break
    return dict(price=price,unitType=unit,type=' / '.join(types),types=types,bedsMin=min(beds),bedsMax=max(beds),handover=after('Handover Date'),plan=plan,size=size)
def main():
    args=argparse.ArgumentParser(description=__doc__);args.add_argument('--write',action='store_true');options=args.parse_args()
    path=ROOT/'xr-catalogue.js';current=json.loads(path.read_text().split('window.XR_CATALOGUE = ',1)[1].rstrip(';\n'))
    def check(pair):
        slug,record=pair;url=record['source']
        if urlparse(url).hostname!='www.xrealty.ae':raise ValueError('Unexpected source host')
        response=subprocess.run(['curl','--fail','--silent','--show-error','--location','--max-time','25',url],check=True,capture_output=True,text=True)
        return slug,facts(response.stdout)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:updates=dict(pool.map(check,current.items()))
    changes=[]
    for slug,record in current.items():
        for key,value in updates[slug].items():
            if record.get(key)!=value:changes.append(slug+': '+key)
        record.update(updates[slug]);record['updated']=datetime.date.today().isoformat()
    print(str(len(current))+' projects checked; '+str(len(changes))+' changed fields')
    for change in changes:print(change)
    if options.write:
        text='/* Project facts checked against the recorded XRealty source URLs. */\nwindow.XR_CATALOGUE = '+json.dumps(current,ensure_ascii=False,indent=2)+';\n'
        staging=path.with_suffix('.tmp');staging.write_text(text);staging.replace(path)
        print('Shared catalogue updated. Rebuild metadata and verify snapshots before deployment.')
if __name__=='__main__':main()
