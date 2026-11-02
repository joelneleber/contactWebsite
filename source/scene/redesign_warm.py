"""Derive the approved warm architectural workshop from browser-v13.
Run with Blender --background <browser-v13.blend> --python this_file.
CNC, printer and computer anchors are retained; lab instrument placements are shared with the runtime.
"""
import bpy, math, json
import numpy as np
from pathlib import Path
from mathutils import Matrix, Vector
ROOT=Path(__file__).resolve().parent
LAYOUT=json.loads((ROOT.parent/'lab-layout.json').read_text())

def material(name,color,metal=0,rough=.7):
 m=bpy.data.materials.new(name);m.use_nodes=True
 b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*color,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough
 return m
OLIVE=material('Warm workshop olive cabinetry',(.19,.22,.135))
PLASTER=material('Warm workshop cream plaster',(.37,.34,.28),rough=.92)
BRASS=material('Warm workshop satin brass',(.45,.30,.12),.65,.4)
SAGE=material('Warm workshop sage silicone',(.22,.31,.23),rough=.9)
OAK=material('Warm workshop natural oak',(.6,.39,.19))
# Subtle, seamless directional grain. Exporter recognizes the _diff image.
rng=np.random.default_rng(31);size=512;y,x=np.mgrid[0:size,0:size]/size
phase=x*2*np.pi*27+.65*np.sin(y*2*np.pi)+.24*np.sin(y*6*np.pi)
grain=.004*np.sin(phase)+.002*np.sin(phase*3)+rng.normal(0,.003,(size,size))
pixels=np.ones((size,size,4),dtype=np.float32)
for c,base in enumerate([.69,.51,.31]):pixels[:,:,c]=base+grain
im=bpy.data.images.new('warm_oak_diff',width=size,height=size);im.pixels.foreach_set(pixels.ravel());im.pack()
t=OAK.node_tree.nodes.new('ShaderNodeTexImage');t.image=im;OAK.node_tree.links.new(t.outputs['Color'],OAK.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

def assign(o,m):
 o.data.materials.clear();o.data.materials.append(m)
 if m==OAK and o.type=='MESH':
  uv=o.data.uv_layers.active or o.data.uv_layers.new()
  for p in o.data.polygons:
   n=p.normal;axis=max(range(3),key=lambda i:abs(n[i]));axes=[i for i in range(3) if i!=axis]
   for li in p.loop_indices:
    v=o.matrix_world@o.data.vertices[o.data.loops[li].vertex_index].co
    uv.data[li].uv=(v[axes[0]]*.7,v[axes[1]]*.35)

def box(name,loc,dim,m,bevel=.015):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name='Warm '+name;o.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);assign(o,m)
 if bevel:
  mod=o.modifiers.new('Soft cabinet edges','BEVEL');mod.width=bevel;mod.segments=3;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o

remove=('Left portrait display','Side wall','Overhead ceiling','Lower rear bulkhead','Window pane','Window structural mullion','Window horizontal frame','Solid oak side worktop','Central walnut desktop','Cabinet carcass','Desk edge metal strip','Forward cabinet toe','Monitor articulated arm','Workshop stool','Headphone hook','Central desk pedestal','Code lab monitor','Aircraft','Jamb rivet','Cockpit sloped','Overhead strip','Ceiling fastener','Skylight','Upper task light','Overbench shelf','Shelf storage','Technical notebook spine','Speaker','Woodshop pegboard','Pegboard hole','Chisel turned','Chisel steel','Tool hook','Clamp bar','Clamp upper','Clamp movable','Parts organizer','Parts bin','Right wall component','Side parts drawer','Side drawer','Inner drawer','Drawer pull','Drawer label','Drawer paper','Extended inner drawer','Extended drawer','Extended pull','Walnut drawer','Brass drawer handle','Footwell','Rubber hex','Curled wood shaving','Individual wood chip','Bent oak ribbon','Leaning timber','Seasoned timber','Plant pot','Pothos','Trailing pothos','Under-console cable','Workbench countersunk','Extended worktop screw','Bench dog socket','Extended bench dog','Right portrait display','Monitor arm','Long upper wood shelf','Side shelf practical','Window mullion')
removed=[]
for o in list(bpy.context.scene.objects):
 if not o.hide_render and o.name.startswith(remove):o.hide_render=True;removed.append(o.name)
 if o.hide_render or not hasattr(o.data,'materials'):continue
 n=o.name
 if n.startswith(('Side wall','Overhead ceiling','Lower rear bulkhead')):assign(o,PLASTER)
 if n.startswith(('Solid oak side worktop','Central walnut desktop','Oak floor plank','Walnut monitor riser','Walnut waveform shelf','Left wall timber toolboard','Wall tool mounting rail','Lamp wooden','Lamp walnut','Lumber offcut')):assign(o,OAK)
 if n.startswith(('Cabinet carcass','Central desk pedestal','Forward cabinet toe','Rear service access')):assign(o,OLIVE)
 if n.startswith(('Blue electronics work mat','Soldering iron grip')):assign(o,SAGE)
 if n.startswith(('Window structural mullion','Window horizontal frame')):assign(o,OAK)
# Matched counter and carcass bounds: 25 mm front overhang, supported front ends.
box('central oak counter',(0,1.60,1.025),(3.44,2.70,.10),OAK,.012)
for side in [-1,1]:
 box('side oak counter',(side*2.685,-.75,1.025),(1.93,7.40,.10),OAK,.012)
 box('continuous cabinet carcass',(side*2.73,-.725,.56),(1.86,7.35,.83),OLIVE,.008)
 box('recessed toe plinth',(side*2.79,-.725,.08),(1.70,7.35,.16),OLIVE,.008)
 box('front cabinet end panel',(side*2.70,-4.41,.55),(1.90,.04,.85),OLIVE,.008)
 for k in range(7):
  yy=2.425-k*1.05
  box('olive door',(side*1.775,yy,.425),(.065,1.018,.55),OLIVE)
  box('olive drawer',(side*1.775,yy,.835),(.065,1.018,.22),OLIVE)
  box('brass drawer pull',(side*1.724,yy,.835),(.032,.28,.018),BRASS,.007)
  box('brass door pull',(side*1.724,yy+.34,.54),(.032,.018,.17),BRASS,.007)
 box('side floating shelf',(side*3.39,.40 if side<0 else .10,3.05),(.58,3.9 if side<0 else 4.0,.065),OAK)
 # Quiet backsplash against the walls rather than unsupported trim on the inner edge.
 box('oak backsplash',(side*3.635,-.75,1.135),(.035,7.40,.12),OAK,.005)
# A continuous bank of four upper cabinets over the lab, clear of the rear window.
for yy in [1.28,.39,-.50,-1.39]:
 box('lab upper cabinet',(3.48,yy,2.64),(.46,.86,.72),OLIVE)
 box('lab upper door',(3.232,yy,2.64),(.035,.828,.69),OLIVE)
 box('lab upper pull',(3.195,yy,2.40),(.025,.24,.016),BRASS,.005)
# Separate instrument shelf: controls face the user across the aisle, not the camera.
box('lab instrument shelf',(3.13,.10,1.52),(.66,2.80,.06),OAK)
for yy in [-1.12,1.32]:
 box('instrument shelf wall bracket',(3.44,yy,1.33),(.055,.035,.38),BRASS)
 box('instrument shelf support',(3.14,yy,1.485),(.62,.035,.035),BRASS)
# Small enclosed parts cabinet under the instrument shelf, away from the active mat.
box('lab parts cabinet',(3.30,.17,1.28),(.35,1.5,.34),OLIVE)
for yy in [-.39,.17,.73]:
 box('parts drawer face',(3.11,yy,1.28),(.035,.52,.29),OLIVE)
 box('parts drawer pull',(3.082,yy,1.28),(.025,.13,.012),BRASS,.004)
# Rear desk pedestals visually tie the whole U together without filling the knee space.
for xx in [-1.47,1.47]:
 box('desk cabinet',(xx,1.89,.505),(.52,1.35,.94),OLIVE)
 for zz in [.34,.73]:
  box('desk drawer',(xx,1.198,zz),(.48,.035,.35),OLIVE)
  box('desk pull',(xx,1.166,zz),(.22,.025,.015),BRASS,.005)
# A restrained fabric rug replaces the mechanical floor grille.
LINEN=material('Warm workshop woven flax',(.38,.31,.22),rough=1)
box('woven rug',(0,-1.23,.045),(2.65,3.6,.025),LINEN,.025)
# Keep one portrait display, clear the second arm and shorten the chunky monitor riser.
for o in bpy.data.objects:
 if o.name.startswith('Walnut monitor riser top'):o.dimensions.z=.045
# Arrange equipment as assemblies so no controls, feet or labels are left behind.
def web_to_blender(p):return Vector((p[0],-p[2],p[1]))
def place_assembly(prefixes,placement,predicate=lambda o:True):
 transform=Matrix.Translation(web_to_blender(placement['position'])) @ Matrix.Rotation(placement['rotationY'],4,'Z') @ Matrix.Translation(-web_to_blender(placement['source']))
 for o in bpy.context.scene.objects:
  if not o.hide_render and o.name.startswith(prefixes) and predicate(o):o.matrix_world=transform @ o.matrix_world
# The original builder shares fastener names across the scope and PSU.
# Classify their owners before either transform changes their world coordinates.
fasteners=('Instrument front screw','Instrument cooling slot')
scope_fasteners={o.name for o in bpy.context.scene.objects if o.name.startswith(fasteners) and o.matrix_world.translation.x<2.75}
place_assembly(fasteners,LAYOUT['scope'],lambda o:o.name in scope_fasteners)
place_assembly(fasteners,LAYOUT['powerSupply'],lambda o:o.name not in scope_fasteners)
place_assembly(('Oscilloscope body','Oscilloscope LCD','Oscilloscope control','BNC input'),LAYOUT['scope'])
place_assembly(('Bench power supply','PSU ','Label · 12.00','Label · 0.125'),LAYOUT['powerSupply'])
place_assembly(('Bench multimeter','Multimeter ','Label · 12.04'),LAYOUT['multimeter'])
def shift(prefixes,delta):
 delta=web_to_blender(delta)
 for o in bpy.context.scene.objects:
  if not o.hide_render and o.name.startswith(prefixes):o.matrix_world=Matrix.Translation(delta) @ o.matrix_world
# Inspection lives toward the back edge; a broad front portion of the mat stays empty.
shift(('Microscope','PCB ','IC solder','Board capacitor','SMT ','Jumper wire'),(.22,0,.32))
shift(('Soldering station','Temperature encoder'),(1.17,0,1.61))
shift(('Iron rest','Soldering iron grip','Soldering iron tip'),(.36,0,1.72))
shift(('Probe /','Probe grip','Probe holder base'),(.10,0,1.07))
shift(('PROP ROOT · pliers',),(-.50,0,.55))
# Put occasional-use supplies away; replace the sprawled old leads with routed cables.
for o in bpy.context.scene.objects:
 if o.name.startswith(('Solder reel','Soldering iron cable','Oscilloscope test lead','Mat small part compartment','Lumber offcut','Steel square','Ruler fine marking','PROP ROOT · flathead_screwdriver')):
  o.hide_render=True
  for child in o.children_recursive:child.hide_render=True
# Keep the iron and scope leads tight to the rear edge of their stations.
CABLE=material('Warm lab cable',(.035,.045,.04),rough=.75)
def cable(name,points,r=.008):
 curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.bevel_depth=r;curve.bevel_resolution=3
 path=curve.splines.new('BEZIER');path.bezier_points.add(len(points)-1)
 for p,v in zip(path.bezier_points,points):p.co=web_to_blender(v);p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(o);o.data.materials.append(CABLE)
# Plugged into the station's front socket and the actual rear end of the iron grip.
box('solder cable socket',(3.08,-1.632,1.18),(.045,.025,.045),BRASS,.005)
cable('Lab routed solder lead',[(3.08,1.18,1.645),(3.04,1.15,1.77),(2.90,1.13,1.80),(2.77,1.15,1.78),(2.74,1.184,1.685)])
# Exit the BNC toward the aisle BEFORE dropping past the shelf and parts drawers.
box('scope probe plug',(2.844,1.11,1.56),(.055,.025,.025),BRASS,.004)
cable('Lab routed scope probe',[(2.82,1.56,-1.11),(2.70,1.52,-1.11),(2.67,1.20,-1.03),(2.65,1.092,-.80),(2.62,1.12,-.25),(2.58,1.12,.20)],.006)
# Park the connected insulated probe on the clear part of the mat, with exposed tip.
box('parked scope probe grip',(2.58,-.29,1.12),(.035,.18,.026),CABLE,.008)
box('parked scope probe tip',(2.58,-.415,1.12),(.009,.07,.009),BRASS,.002)
# A dedicated tool tray makes the left bench read as a workstation instead of scattered props.
box('woodshop tool tray',(-2.89,-1.18,1.092),(.76,.62,.025),OLIVE,.014)
shift(('PROP ROOT · hand_plane_no4',),(-.43,.025,.12))
shift(('Wooden mallet',),(-.22,.02,.67))
# Existing interactive anchors for the computer, CNC and printer remain fixed.

assert not bpy.data.objects['Main workspace monitor active screen'].hide_render
assert not bpy.data.objects['CNC spindle motor'].hide_render
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'warm-workshop.blend'))
(ROOT/'redesign-report.json').write_text(json.dumps({'removed_visual_clutter':len(removed),'new_objects':len([o for o in bpy.context.scene.objects if o.name.startswith('Warm ')]),'interactive_positions':'CNC, printer, computer retained; lab in lab-layout.json'},indent=2))
print('WARM REDESIGN READY',len(removed),flush=True)
