"""Local-only preview: reload open tabs when visual assets change."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os,json
ROOT=Path(__file__).resolve().parent.parent
os.chdir(ROOT)
WATCH=['cockpit.bundle.js','cockpit.css','assets/cockpit/command-center-warm.glb']
SCRIPT=b'''<script>(()=>{let version=__INITIAL_VERSION__;setInterval(async()=>{try{const next=await(await fetch('/__preview_version',{cache:'no-store'})).text();if(version&&next!==version)location.reload();version=next;}catch{}},1500)})();</script>'''
class Preview(SimpleHTTPRequestHandler):
 def end_headers(self):
  self.send_header('Cache-Control','no-store');super().end_headers()
 def do_GET(self):
  if self.path.split('?')[0]=='/__preview_version':
   data=json.dumps([Path(p).stat().st_mtime_ns if Path(p).exists() else 0 for p in WATCH]).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(data);return
  if self.path.split('?')[0] in ['/','/index.html']:
   version=json.dumps([Path(p).stat().st_mtime_ns if Path(p).exists() else 0 for p in WATCH]);script=SCRIPT.replace(b'__INITIAL_VERSION__',json.dumps(version).encode());data=(ROOT/'index.html').read_bytes().replace(b'</body>',script+b'</body>');self.send_response(200);self.send_header('Content-Type','text/html');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(data);return
  return super().do_GET()
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',49312),Preview).serve_forever()
