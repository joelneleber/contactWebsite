"""Save captured per-view contours, joining curved segments into continuous pencil strokes.
Usage: python3 source/scripts/bake-blueprints.py PATH_TO_CAPTURE_JSON
"""
import base64,json,sys
from pathlib import Path
from collections import defaultdict
text=Path(sys.argv[1]).read_text();data,_=json.JSONDecoder().raw_decode(text[text.index('{'):])
root=Path(__file__).resolve().parents[2]/'assets/cockpit/sketches';root.mkdir(exist_ok=True)
for view,item in data.items():
 raw=base64.b64decode(item['packed']);numbers=[];value=shift=0
 for b in raw:
  value|=(b&127)<<shift
  if b&128:shift+=7
  else:numbers.append(-(value+1)//2 if value&1 else value//2);value=shift=0
 it=iter(numbers);edges=[];adj=defaultdict(list)
 for count in it:
  assert count==2
  a=tuple(next(it) for _ in range(3));b=tuple(a[i]+next(it) for i in range(3))
  if a==b:continue
  n=len(edges);edges.append((a,b));adj[a].append(n);adj[b].append(n)
 used=set();strokes=[]
 def walk(start,n):
  points=[start];v=start
  while n not in used:
   used.add(n);a,b=edges[n];v=b if a==v else a;points.append(v)
   if len(adj[v])!=2:break
   n=next((e for e in adj[v] if e not in used),n)
  strokes.append(points)
 for vertex,neighbors in adj.items():
  if len(neighbors)!=2:
   for n in neighbors:
    if n not in used:walk(vertex,n)
 for n,(a,b) in enumerate(edges):
  if n not in used:walk(a,n)
 packed=bytearray()
 def put(n):
  v=-n*2-1 if n<0 else n*2
  while v>127:packed.append((v&127)|128);v>>=7
  packed.append(v)
 for points in strokes:
  put(len(points));previous=(0,0,0)
  for point in points:
   for a,b in zip(point,previous):put(a-b)
   previous=point
 (root/(view+'.json')).write_text(json.dumps({'strokes':len(strokes),'packed':base64.b64encode(packed).decode()},separators=(',',':')))
 print(view,len(strokes),len(packed))
