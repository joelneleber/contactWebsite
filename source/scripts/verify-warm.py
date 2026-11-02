"""Check packaged links, interactive glTF groups and loader byte accounting."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,struct,re
root=Path(__file__).resolve().parents[2];missing=[]
class Links(HTMLParser):
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k not in ('src','href') or not v or v.startswith(('#','data:','mailto:','tel:')):continue
   u=urlsplit(v)
   if u.scheme or u.netloc:continue
   target=(self.file.parent/unquote(u.path)).resolve()
   if u.path and not target.exists():missing.append((str(self.file.relative_to(root)),v))
for p in [*root.glob('*.html'),*root.glob('read/*.html')]:
 parser=Links();parser.file=p;parser.feed(p.read_text())
b=(root/'assets/cockpit/command-center-warm.glb').read_bytes();size=struct.unpack_from('<I',b,12)[0];data=json.loads(b[20:20+size]);zones={n.get('extras',{}).get('zone') for n in data['nodes']}
assert {'cnc_motion','cnc_gantry','printer_motion','computer','wood','lab'}<=zones,zones
assert any(n.get('extras',{}).get('desktopScreen') for n in data['nodes'])
assert int(re.search(r'ROOM_MODEL_BYTES=(\d+)',(root/'source/cockpit.js').read_text())[1])==len(b)
assert not missing,missing
print(json.dumps({'missing_html_assets':missing,'model_bytes':len(b),'mesh_nodes':len(data['nodes']),'interactive_zones':sorted(z for z in zones if z),'desktop_screen':True},indent=2))
