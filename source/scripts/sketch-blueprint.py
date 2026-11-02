"""Bake a curated room sketch, omitting hidden edges and bevel rings."""
from pathlib import Path
import base64,re,math
strokes=[]
def line(*points):strokes.append(points)
def front(x0,x1,y0,y1,z):line((x0,y0,z),(x0,y1,z),(x1,y1,z),(x1,y0,z),(x0,y0,z))
def side(x,y0,y1,z0,z1):line((x,y0,z0),(x,y1,z0),(x,y1,z1),(x,y0,z1),(x,y0,z0))
# Room outline and window, with one frame contour and a pair of mullions.
line((-3.6,1.05,-3),(-3.6,3.6,-3),(3.6,3.6,-3),(3.6,1.05,-3))
front(-3.15,3.15,1.52,3.38,-2.97)
for x in [-1.05,1.05]:line((x,1.52,-2.97),(x,3.38,-2.97))
for x in [-3.6,3.6]:line((x,3.6,-3),(x,3.6,5));line((x,1.08,-2.8),(x,1.08,5))
# Continuous counters and front edges. No rear or underside edges seen through cabinets.
for sign in [-1,1]:
 outer,inner=sign*3.55,sign*1.50
 line((outer,1.08,-2.7),(inner,1.08,-2.7),(inner,1.08,5))
 line((inner,1.08,5),(inner,1.02,5),(inner,1.02,-.02))
 side(inner,.13,1.0,.15,4.9)
 for z in [.3,1.75,3.2,4.8]:line((inner,.16,z),(inner,.98,z))
 for y in [.68,.84]:line((inner,y,.2),(inner,y,4.8))
 # Upper shelf, wall cabinets / tool board.
 line((sign*3.55,3.08,-2.4),(sign*3.12,3.08,-2.4),(sign*3.12,3.08,4.2))
side(3.43,2.22,2.98,-1.45,1.25)
for z in [-.78,-.1,.57]:line((3.42,2.23,z),(3.42,2.97,z))
side(-3.48,1.40,2.88,-1.65,1.6)
for z in [-1.3,-.95,-.6,-.25,.1]:line((-3.40,2.58,z),(-3.40,2.08,z))
# Central desk, monitor, riser and speakers.
line((-1.5,1.08,-.08),(1.5,1.08,-.08),(1.5,1.02,-.08),(-1.5,1.02,-.08),(-1.5,1.08,-.08))
front(-1.10,1.10,1.40,2.64,-1.55) # Monitor contour for side views; loader suppresses it in room view.
front(-1.36,1.36,1.12,1.36,-1.20)
for x in [-1.25,1.25]:front(x-.13,x+.13,1.38,1.83,-1.35)
line((-.58,1.095,-.25),(.55,1.095,-.25),(.55,1.095,-.61),(-.58,1.095,-.61),(-.58,1.095,-.25))
for x in [-1.2,1.2]:line((x,.99,-.1),(x,.18,-.1))
# CNC frame and the dust hose as a single curved pencil stroke.
front(-3.24,-2.0,1.12,1.26,-.38)
line((-3.15,1.27,-.58),(-3.15,2.05,-.58),(-2.12,2.05,-.58),(-2.12,1.27,-.58))
line((-2.71,2.04,-.56),(-2.71,1.60,-.56),(-2.54,1.60,-.56),(-2.54,2.04,-.56))
line(*[(-2.65+.30*math.sin(i*math.pi/16),2.03+.63*math.sin(i*math.pi/16),-.7-.38*i/16) for i in range(17)])
# Scope and power supply outlines on their riser, microscope and circuit board.
side(2.81,1.55,2.09,-1.13,-.51);side(2.91,1.55,1.98,-.1,.31)
line((2.70,1.50,-1.3),(2.70,1.50,1.15),(3.4,1.50,1.15))
line((2.45,1.18,.55),(2.45,1.95,.55),(2.19,1.95,.55),(2.19,1.70,.55))
line((2.08,1.12,.52),(2.60,1.12,.52),(2.60,1.12,1.1),(2.08,1.12,1.1),(2.08,1.12,.52))
# A few identifying details, lighter than the outer silhouettes.
side(2.80,1.65,1.98,-1.05,-.70)
line(*[(2.79,1.81+.07*math.sin(i*math.pi/4),-1.03+.31*i/24) for i in range(25)])
for z in [-.62,-.55]:
 line(*[(2.79,1.77+.025*math.cos(i*math.pi/6),z+.025*math.sin(i*math.pi/6)) for i in range(13)])
side(3.48,1.9,2.82,1.6,2.6)
# Individual destination objects: sign, lamp, project book, printer and upper books.
side(-3.53,1.92,2.8,3.8,5.1)
side(-3.13,1.12,1.72,.12,.58)
line((-2.95,1.12,2.5),(-2.35,1.12,2.5),(-2.35,1.12,3.05),(-2.95,1.12,3.05),(-2.95,1.12,2.5))
side(2.7,1.12,2.22,2.7,3.5)
line((2.7,2.22,2.7),(3.4,2.22,2.7),(3.4,2.22,3.5),(2.7,2.22,3.5))
for z in [-.3,-.1,.1,.3,.5,.7]:side(3.12,3.10,3.48,z,z+.13)
# Round stool and a few organic plant shapes.
line(*[(-.86+.28*math.cos(i*math.pi/12),.62,1.05+.28*math.sin(i*math.pi/12)) for i in range(25)])
for x,z in [(-1.05,.95),(-.66,.95),(-.86,1.28)]:line((x,.60,z),(x,.04,z))
for x,y,z in [(-3.25,3.10,-1.8),(3.25,3.10,-1.8),(2.7,1.08,-1.65)]:
 line((x-.09,y,z),(x-.13,y+.19,z),(x+.13,y+.19,z),(x+.09,y,z),(x-.09,y,z))
 for i in range(5):
  dx=(i-2)*.085;line((x,y+.18,z),(x+dx*.4,y+.37,z),(x+dx,y+.48-abs(dx)*.3,z))
# Floorboard seams, subordinate to the furniture.
for x in [-1.25,-.62,0,.62,1.25]:line((x,.01,-.1),(x,.01,5.5))
raw=bytearray()
def put(n):
 v=-n*2-1 if n<0 else n*2
 while v>127:raw.append((v&127)|128);v>>=7
 raw.append(v)
for points in strokes:
 put(len(points));prev=[0,0,0]
 for point in points:
  q=[round(v*50) for v in point]
  for a,b in zip(q,prev):put(a-b)
  prev=q
p=Path(__file__).resolve().parents[2]/'entry.js';s=p.read_text();s,n=re.subn(r"const BLUEPRINT='[^']*'", "const BLUEPRINT='"+base64.b64encode(raw).decode()+"'",s);assert n==1;p.write_text(s)
print(f'{len(strokes)} curated strokes, {len(raw)} packed bytes')
