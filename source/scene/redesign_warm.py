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
OLIVE=material('Warm workshop charcoal cabinetry',(.075,.09,.095))
FLOOR=material('Warm workshop pale ash floor',(.43,.36,.26),rough=.88)
PLASTER=material('Warm workshop cream plaster',(.37,.34,.28),rough=.92)
BRASS=material('Warm workshop satin brass',(.45,.30,.12),.65,.4)
SAGE=material('Warm workshop sage silicone',(.22,.31,.23),rough=.9)
# Reuse the live room's scanned timber, tinted toward warm walnut.
OAK=bpy.data.materials['Scanned worn wood · Poly Haven'].copy()
OAK.name='Warm workshop walnut grain'
OAK.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.67,.49,.35,1)
for node in OAK.node_tree.nodes:
 if node.type=='TEX_IMAGE' and node.image and '_diff' in node.image.name:
  node.image.filepath_raw=str(ROOT.parent.parent/'assets'/'cockpit'/'walnut-grain.jpg')
  node.image.file_format='JPEG';node.image.save()

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

remove=('Console mini','Left portrait display','Side wall','Overhead ceiling','Lower rear bulkhead','Window pane','Window structural mullion','Window horizontal frame','Solid oak side worktop','Central walnut desktop','Cabinet carcass','Desk edge metal strip','Forward cabinet toe','Monitor articulated arm','Workshop stool','Headphone hook','Central desk pedestal','Code lab monitor','Aircraft','Jamb rivet','Cockpit sloped','Overhead strip','Ceiling fastener','Skylight','Upper task light','Overbench shelf','Shelf storage','Technical notebook spine','Speaker','Woodshop pegboard','Pegboard hole','Chisel turned','Chisel steel','Tool hook','Clamp bar','Clamp upper','Clamp movable','Parts organizer','Parts bin','Right wall component','Side parts drawer','Side drawer','Inner drawer','Drawer pull','Drawer label','Drawer paper','Extended inner drawer','Extended drawer','Extended pull','Walnut drawer','Brass drawer handle','Footwell','Rubber hex','Curled wood shaving','Individual wood chip','Bent oak ribbon','Leaning timber','Seasoned timber','Plant pot','Pothos','Trailing pothos','Under-console cable','Workbench countersunk','Extended worktop screw','Bench dog socket','Extended bench dog','Right portrait display','Monitor arm','Long upper wood shelf','Side shelf practical','Window mullion')
removed=[]
for o in list(bpy.context.scene.objects):
 if not o.hide_render and o.name.startswith(remove):o.hide_render=True;removed.append(o.name)
 if o.hide_render or not hasattr(o.data,'materials'):continue
 n=o.name
 if n.startswith(('Side wall','Overhead ceiling','Lower rear bulkhead')):assign(o,PLASTER)
 if n.startswith(('Solid oak side worktop','Central walnut desktop','Walnut monitor riser','Walnut waveform shelf','Left wall timber toolboard','Wall tool mounting rail','Lamp wooden','Lamp walnut','Lumber offcut')):assign(o,OAK)
 if n.startswith('Oak floor plank'):assign(o,FLOOR)
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
box('lab parts cabinet',(3.135,.17,1.2825),(.63,1.5,.415),OLIVE)
for yy in [-.39,.17,.73]:
 box('parts drawer face',(2.803,yy,1.2825),(.035,.52,.365),OLIVE)
 box('parts drawer pull',(2.773,yy,1.2825),(.025,.13,.012),BRASS,.004)
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
# Move the entire CNC as one station, including its workpiece and hold-downs.
shift(('CNC ','Spindle carriage','Gantry face rail','Gantry hex fastener','Hold-down bolt','Walnut workpiece'),LAYOUT['cnc']['offset'])
# Keep stored bits out of the relocated machine footprint; raise its nearest hanging clamp.
shift(('Drill bit',),(0,0,1.45))
# Tool wall: aligned chisel rack, separate saw/hammer/square, compact lower clamp bank.
chisel_slots={0:-1.45,1:-1.25,2:-1.05,3:-.85,7:-.65,8:-.45}
for o in bpy.context.scene.objects:
 n=o.name
 if n.startswith(('Wall chisel tang','Wall chisel wooden handle','Toolboard pin')):
  idx=int(n.rsplit('.',1)[1]) if '.' in n else 0
  if idx not in chisel_slots:o.hide_render=True;continue
  old_z=1.42-idx*.245;old_handle_y=2.28+(idx%3)*.11
  o.matrix_world=Matrix.Translation(web_to_blender((0,2.52-old_handle_y,chisel_slots[idx]-old_z))) @ o.matrix_world
 if n.startswith(('Long woodworking clamp','Clamp fixed head','Clamp sliding head','Clamp threaded wooden grip')):
  idx=int(n.rsplit('.',1)[1]) if '.' in n else 0
  old_z=1.35-idx*.43;new_z=-.50+idx*.20
  o.matrix_world=Matrix.Translation(web_to_blender((-.12,.05,new_z-old_z))) @ o.matrix_world
 if n.startswith('Wall tool mounting rail'):o.hide_render=True
box('chisel rack',(-3.51,1.0,2.45),(.075,1.35,.075),OAK)
box('clamp rack',(-3.55,-.10,1.93),(.075,1.50,.075),OAK)
shift(('Claw hammer','Hammer curved claw'),(0,.15,.22))
shift(('Combination square',),(0,.30,1.03))
shift(('Hanging hand saw','Saw wooden loop'),(0,0,.735))
for zz,hh in [(.10,2.55),(.55,2.60),(1.18,2.72)]:
 box('dedicated tool peg',(-3.46,-zz,hh),(.17,.025,.025),BRASS,.004)
# Inspection lives toward the back edge; a broad front portion of the mat stays empty.
shift(('Microscope','PCB ','IC solder','Board capacitor','SMT ','Jumper wire'),(-.12,0,.10))
shift(('Soldering station','Temperature encoder'),(1.17,0,1.61))
shift(('Iron rest','Soldering iron grip','Soldering iron tip'),(.36,0,1.72))
shift(('Probe /','Probe grip','Probe holder base'),(.10,0,1.88))
shift(('PROP ROOT · pliers',),(-.50,0,.55))
# Put occasional-use supplies away; replace the sprawled old leads with routed cables.
for o in bpy.context.scene.objects:
 if o.name.startswith(('Printer filament','Printer spool','Solder reel','Soldering iron cable','Oscilloscope test lead','Mat small part compartment','Lumber offcut','Steel square','Ruler fine marking','PROP ROOT · flathead_screwdriver')):
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
# Two scope channels connect to the PCB front-edge test pads under the microscope.
# Leads travel outside the parts drawers, then rise before crossing the microscope base.
for channel,(socket_z,pad_z) in enumerate([(-1.11,.78),(-.96,.94)]):
 box('scope channel plug '+str(channel),(2.844,-socket_z,1.56),(.055,.025,.025),BRASS,.004)
 cable('Lab connected scope channel '+str(channel),[(2.82,1.56,socket_z),(2.70,1.47,socket_z),(2.67,1.13,-.72+channel*.12),(2.25,1.112,-.38+channel*.10),(1.99-channel*.035,1.112,.30),(1.99-channel*.035,1.16,pad_z),(2.03,1.19,pad_z)],.006)
 cable('scope insulated probe '+str(channel),[(2.03,1.19,pad_z),(2.09,1.202,pad_z)],.014)
 cable('scope metal probe tip '+str(channel),[(2.09,1.202,pad_z),(2.15,1.202,pad_z)],.004)
 bpy.data.objects['scope metal probe tip '+str(channel)].data.materials.clear()
 bpy.data.objects['scope metal probe tip '+str(channel)].data.materials.append(BRASS)
 box('PCB scope test pad '+str(channel),(2.15,-pad_z,1.198),(.025,.025,.008),BRASS,.002)
# A dedicated tool tray makes the left bench read as a workstation instead of scattered props.
box('woodshop tool tray',(-2.89,-1.18,1.092),(.76,.62,.025),OLIVE,.014)
shift(('PROP ROOT · hand_plane_no4',),(-.43,.025,.12))
shift(('Wooden mallet',),(-.22,.02,.67))
# Work in progress lives in small groups, outside the main cutting and inspection areas.
PAPER=material('Warm project paper',(.73,.68,.54))
DARK=material('Warm project graphite',(.055,.065,.065))
RAW=material('Warm unfinished timber',(.56,.38,.20))
PCB=material('Warm spare circuit boards',(.055,.19,.13))
# A dry-fit timber frame and two offcuts beside it.
for xx in [-2.45,-2.07]:box('dry fit frame rail',(xx,-.65,1.10),(.045,.42,.05),RAW,.003)
for yy in [-.46,-.84]:box('dry fit frame crossbar',(-2.26,yy,1.10),(.34,.045,.05),RAW,.003)
for i in range(3):
 o=box('stacked timber sample',(-3.25,-2.04,1.09+i*.028),(.24,.48,.027),RAW,.003);o.rotation_euler.z=(i-1)*.08
# A marked-up sketch pad and pencil near the dry fit.
box('woodshop sketch pad',(-2.35,-1.30,1.082),(.32,.27,.014),PAPER,.004)
for yy in [-1.23,-1.30,-1.37]:box('pencil layout mark',(-2.35,yy,1.090),(.22,.002,.001),DARK,0)
box('carpenter pencil',(-2.13,-1.30,1.086),(.012,.25,.018),RAW,.002)
# Parts tray, a loose board and a prototype enclosure at the lab's front right.
box('project parts tray',(2.13,-2.55,1.089),(.40,.48,.028),OLIVE,.009)
for xx in [1.94,2.32]:box('parts tray edge',(xx,-2.55,1.112),(.014,.48,.035),OLIVE,.003)
for yy in [-2.32,-2.78]:box('parts tray edge',(2.13,yy,1.112),(.40,.014,.035),OLIVE,.003)
box('spare PCB',(2.06,-2.46,1.108),(.15,.19,.012),PCB,.002)
for i in range(4):box('spare board chip',(2.02+(i%2)*.06,-2.42-(i//2)*.07,1.122),(.03,.04,.015),DARK,.002)
for i in range(5):box('sorted small connector',(2.05+i*.045,-2.69,1.117),(.026,.045,.027),BRASS,.002)
box('prototype enclosure',(2.58,-2.73,1.13),(.23,.28,.11),PAPER,.008)
box('prototype lid',(2.60,-3.08,1.085),(.23,.28,.02),PAPER,.004)
# A few desk notes beside the keyboard, away from Mango.
for i in range(3):
 o=box('desk memo',(1.26,.62,1.078+i*.002),(.22,.19,.002),PAPER,0);o.rotation_euler.z=i*.07
# Ceramic mug on a coaster, behind the mouse area.
box('mug coaster',(1.20,1.03,1.084),(.22,.22,.018),OLIVE,.015)
bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=.075,depth=.15,location=(1.20,1.03,1.167));mug=bpy.context.object;mug.name='Warm ceramic mug';assign(mug,PAPER)
bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=.062,depth=.002,location=(1.20,1.03,1.243));assign(bpy.context.object,DARK);bpy.context.object.name='Warm coffee surface'
bpy.ops.mesh.primitive_torus_add(major_radius=.047,minor_radius=.012,major_segments=20,minor_segments=8,location=(1.29,1.03,1.17),rotation=(1.5708,0,0));assign(bpy.context.object,PAPER);bpy.context.object.name='Warm mug handle'

# Existing interactive anchors for the computer, CNC and printer remain fixed.

assert not bpy.data.objects['Main workspace monitor active screen'].hide_render
assert not bpy.data.objects['CNC spindle motor'].hide_render
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'warm-workshop.blend'))
(ROOT/'redesign-report.json').write_text(json.dumps({'removed_visual_clutter':len(removed),'new_objects':len([o for o in bpy.context.scene.objects if o.name.startswith('Warm ')]),'interactive_positions':'CNC, printer, computer retained; lab in lab-layout.json'},indent=2))
print('WARM REDESIGN READY',len(removed),flush=True)
