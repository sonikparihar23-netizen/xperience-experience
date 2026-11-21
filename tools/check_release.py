"""Check required dependencies, current saved content and internal release invariants."""
from pathlib import Path
import re,sys,json
r=Path(__file__).resolve().parents[1]
files=[p for p in r.glob('*.html') if p.name not in ['home-v1.html','home-v2.html','404.html','dubai-map.html']]+list((r/'s').glob('*.html'))
errors=[]
for p in files:
 s=p.read_text()
 for token in ['[ORN no.]','[licence no.]','[Truncated]']:
  if token in s:errors.append(f'{p.name}: {token}')
 for script in ['xr-config.js','xr-currency.js','xr-catalogue.js','xr-forms.js','xr-data.js','xr-enhancements.js']:
  if f'/{script}' not in s:errors.append(f'{p.name}: missing {script}')
 if 'id="xr-prerender"' not in s:errors.append(f'{p.name}: no saved content')
 if not re.search(r'<link rel="canonical"',s) and not re.search(r'<meta name="robots" content="[^"]*noindex',s):errors.append(f'{p.name}: no canonical')
 if '<script src="/xr-forms.js"></script>' in s and s.index('/xr-forms.js')>s.index('./support.js'):errors.append(f'{p.name}: form dependency order')
print(f'{len(files)} content pages checked; {len(errors)} problems')
for e in errors:print(e)
if errors:sys.exit(1)
