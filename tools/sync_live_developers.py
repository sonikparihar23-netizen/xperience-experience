"""Copy each developer's published content from xrealty.ae into xr-dev-live.js.

Reads https://www.xrealty.ae/developer/<slug>/ for every slug in SLUGS and keeps the
logo, intro, long-form sections, project cards, community cards and FAQs.
A page that is missing its title or projects stops the update and leaves the file intact.
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlparse, parse_qs
import concurrent.futures,datetime,json,re,subprocess
ROOT=Path(__file__).resolve().parents[1]
SITE='https://www.xrealty.ae'
SLUGS=['emaar-properties','nakheel','damac-properties','beyond-developments','dubai-properties','ellington-properties','meraas','omniyat','ardee-developments','sobha','nshama','arada-developments','aldar-properties','modon-properties']
BLOCK={'h1','h2','h3','h4','p','li','td','th'}
class Blocks(HTMLParser):
    """Flattens a page into (kind, text, extra) tuples in reading order."""
    def __init__(self):super().__init__();self.skip=0;self.out=[];self.buf=None;self.tag=None
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag in ('script','style','noscript'):self.skip+=1;return
        if tag=='tr':self.out.append(('tr','',''))
        if tag in BLOCK and self.buf is None:self.buf=[];self.tag=tag
        if tag=='img':
            src=a.get('src') or ''
            if src.startswith('/_next/image'):src=unquote(parse_qs(urlparse(src).query).get('url',[''])[0])
            self.out.append(('img',a.get('alt') or '',src))
        if tag=='a' and a.get('href'):self.out.append(('a',a['href'],''))
    def handle_endtag(self,tag):
        if tag in ('script','style','noscript'):self.skip=max(0,self.skip-1);return
        if tag==self.tag and self.buf is not None:
            text=re.sub(r'\s+',' ',''.join(self.buf)).strip()
            if text:self.out.append((tag,text,''))
            self.buf=None;self.tag=None
    def handle_data(self,value):
        if self.skip:return
        if self.buf is not None:self.buf.append(value)
        elif value.strip():self.out.append(('text',re.sub(r'\s+',' ',value).strip(),''))
def full_size(src,w=1200):return re.sub(r'/upload/(?:[^/]+/)?(?=v\d+/)','/upload/w_'+str(w)+',f_auto,q_auto/',src)
def clip(text,n=260):
    if len(text)<=n:return text
    cut=text[:n];end=max(cut.rfind('. '),cut.rfind('! '),cut.rfind('? '))
    return cut[:end+1] if end>80 else cut.rsplit(' ',1)[0]+'…'
def parse(page):
    p=Blocks();p.feed(page);b=p.out
    h1=next(i for i,x in enumerate(b) if x[0]=='h1')
    logo=next((x[2] for x in reversed(b[max(0,h1-4):h1]) if x[0]=='img'),'')
    heads=[i for i,x in enumerate(b) if x[0]=='h2' and i>h1]
    def h2(title):return next((i for i in heads if b[i][1]==title),None)
    proj=next(i for i in heads if re.fullmatch(r'(All|Abu Dhabi|Dubai) Projects',b[i][1]))
    comm=h2('Communities');faq=h2('Frequently Asked Questions')
    # Slideshow above the title: picture, label (e.g. NEWLY LAUNCHED), project heading, line, link
    slides=[];sl=None
    for kind,text,extra in b[:h1]:
        if kind=='img':sl={'img':full_size(extra,2000),'title':text,'n':0};slides.append(sl);continue
        if sl is None:continue
        sl['n']+=1
        if kind=='text' and sl['n']==1:sl['label']=text
        elif kind=='p' and 'subtitle' not in sl:sl['subtitle']=text
        elif kind=='a' and re.match(r'/([a-z-]+/)?property/',text) and 'href' not in sl:sl['href']=SITE+text
    slides=[{k:v for k,v in x.items() if k!='n'} for x in slides if x.get('label') and x.get('href') and x.get('title') and '/xr_media/' in x['img']]
    # Intro and long-form sections sit between the title and the project list
    intro=[];sections=[];cur=None;rows=None
    for kind,text,_ in b[h1+1:proj]:
        if kind=='h2':cur={'title':text,'blocks':[]};sections.append(cur);rows=None;continue
        if cur is None:
            if kind=='p':intro.append(text)
            continue
        bl=cur['blocks']
        if kind=='tr':rows=[];bl.append({'t':'row','v':rows,'th':True});continue
        if kind in ('td','th') and rows is not None:
            rows.append(text)
            if kind=='td':bl[-1]['th']=False
            continue
        rows=None
        if kind=='li':
            if bl and bl[-1]['t']=='ul':bl[-1]['v'].append(text)
            else:bl.append({'t':'ul','v':[text]})
        elif kind in ('p','h3','h4'):bl.append({'t':'p' if kind=='p' else 'h3','v':text})
    for s in sections:
        out=[]
        for blk in s['blocks']:
            if blk['t']=='row':
                if out and out[-1]['t']=='table':out[-1]['rows'].append(blk['v'])
                elif blk['th']:out.append({'t':'table','head':blk['v'],'rows':[]})
                else:out.append({'t':'table','head':[],'rows':[blk['v']]})
            else:out.append(blk)
        s['blocks']=out
    # Project spotlights are published as one heading per project: nest them under their parent
    nested=[];parent=None
    for s in sections:
        if parent is not None and not s['title'].startswith('Why'):parent['blocks']+=[{'t':'h3','v':s['title']}]+s['blocks'];continue
        parent=s if 'Spotlight' in s['title'] else None;nested.append(s)
    sections=nested
    if not intro and sections and not sections[0]['title'].endswith('?'):
        intro=[x['v'] for x in sections[0]['blocks'] if x['t']=='p'];sections=sections[1:]
    # Project cards: link, picture, developer, price, name, community
    projects=[];card=None
    for kind,text,extra in b[proj+1:comm or faq]:
        if kind=='a' and re.match(r'/([a-z-]+/)?property/',text):card={'href':SITE+text};projects.append(card)
        elif card is None:continue
        elif kind=='img' and 'img' not in card:card['img']=full_size(extra)
        elif kind=='p' and re.fullmatch(r'(AED\s*)?[\d,]+',text):card['price']=int(re.sub(r'\D','',text))
        elif kind=='h3':card['name']=text
        elif kind=='text' and 'name' in card and 'community' not in card:card['community']=re.sub(r'\s+Guide$','',text).title() if text.isupper() else re.sub(r'\s+Guide$','',text)
    communities=[];c=None
    for kind,text,extra in (b[comm+1:faq] if comm else []):
        if kind=='img':c={'img':full_size(extra)};communities.append(c)
        elif c is None:continue
        elif kind=='h3':c['name']=re.sub(r'\s+Guide$','',text)
        elif kind=='p' and 'text' not in c:c['text']=clip(text)
        elif kind=='a' and text.startswith('/area/'):c['href']=SITE+text
    faqs=[];q=None
    for kind,text,_ in (b[faq+1:] if faq else []):
        if kind=='text' and text.endswith('?'):q=text
        elif kind=='p' and q:faqs.append([q,text]);q=None
        elif kind in ('h2','h3') :break
    projects=[x for x in projects if x.get('name') and x.get('img')]
    if not projects:raise ValueError('No project cards found')
    return dict(name=b[h1][1],logo=logo,slides=slides,intro=intro,sections=sections,projects=projects,communities=[x for x in communities if x.get('name')],faqs=faqs)
def main():
    def fetch(slug):
        url=SITE+'/developer/'+slug+'/'
        page=subprocess.run(['curl','--fail','--silent','--show-error','--location','--max-time','40',url],check=True,capture_output=True,text=True).stdout
        return slug,parse(page)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:data=dict(pool.map(fetch,SLUGS))
    for slug,d in data.items():print(f"{slug}: {len(d['slides'])} slides, {len(d['projects'])} projects, {len(d['sections'])} sections, {len(d['communities'])} communities, {len(d['faqs'])} FAQs")
    text='/* Developer content copied from xrealty.ae/developer/ on '+datetime.date.today().isoformat()+' by tools/sync_live_developers.py. */\nwindow.XR_DEV_LIVE = '+json.dumps(data,ensure_ascii=False,indent=1)+';\n'
    path=ROOT/'xr-dev-live.js';staging=path.with_suffix('.tmp');staging.write_text(text);staging.replace(path)
if __name__=='__main__':main()
