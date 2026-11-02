"""Derive the approved warm architectural workshop from browser-v13.
Run with Blender --background <browser-v13.blend> --python this_file.
Original equipment coordinates and exporter motion groups are retained.
"""
import bpy, math, json
import numpy as np
from pathlib import Path
ROOT=Path(__file__).resolve().parent

def material(name,color,metal=0,rough=.7):
 m=bpy.data.materials.new(name);m.use_nodes=True
 b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*color,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough
 return m
OLIVE=material('Warm workshop olive cabinetry',(.19,.22,.135))
PLASTER=material('Warm workshop cream plaster',(.72,.67,.55),rough=.92)
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

remove=('Monitor articulated arm','Workshop stool','Headphone hook','Central desk pedestal','Code lab monitor','Aircraft','Jamb rivet','Cockpit sloped','Overhead strip','Ceiling fastener','Skylight','Upper task light','Overbench shelf','Shelf storage','Technical notebook spine','Speaker','Woodshop pegboard','Pegboard hole','Chisel turned','Chisel steel','Tool hook','Clamp bar','Clamp upper','Clamp movable','Parts organizer','Parts bin','Right wall component','Side parts drawer','Side drawer','Inner drawer','Drawer pull','Drawer label','Drawer paper','Extended inner drawer','Extended drawer','Extended pull','Walnut drawer','Brass drawer handle','Footwell','Rubber hex','Curled wood shaving','Individual wood chip','Bent oak ribbon','Leaning timber','Seasoned timber','Plant pot','Pothos','Trailing pothos','Under-console cable','Workbench countersunk','Extended worktop screw','Bench dog socket','Extended bench dog','Right portrait display','Monitor arm','Long upper wood shelf','Side shelf practical','Window mullion')
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
# Continuous worktop to the rear wall, with aligned back infill and a window sill.
box('rear oak counter',(0,2.25,1.01),(6.88,1.40,.12),OAK)
box('window sill',(0,2.88,1.61),(7.12,.38,.075),OAK)
# Broad doors and two drawers per bay; flush furniture rather than a wall of parts bins.
for side in [-1,1]:
 for k in range(6):
  yy=2.55-k*1.02
  box('olive door',(side*1.775,yy,.405),(.065,.982,.55),OLIVE)
  box('olive drawer',(side*1.775,yy,.81),(.065,.982,.22),OLIVE)
  box('brass drawer pull',(side*1.724,yy,.81),(.032,.28,.018),BRASS,.007)
  box('brass door pull',(side*1.724,yy+.32,.54),(.032,.018,.17),BRASS,.007)
 # one calm shelf on each side wall; rear window is unobstructed
 box('side floating shelf',(side*3.39,.05,2.95),(.58,4.8,.065),OAK)
 # Upper storage belongs only on the lab wall; the wood wall is a tool rack.
 if side==1:
  box('upper cabinet',(3.52,.3,2.42),(.32,1.35,.78),OLIVE)
  for yy in [-.04,.64]:
   box('upper door',(3.342,yy,2.42),(.035,.65,.75),OLIVE)
   box('upper pull',(3.31,yy,2.22),(.025,.18,.015),BRASS,.005)
# Rear desk pedestals visually tie the whole U together without filling the knee space.
for xx in [-1.47,1.47]:
 box('desk cabinet',(xx,1.89,.49),(.52,1.35,.91),OLIVE)
 for zz in [.34,.73]:
  box('desk drawer',(xx,1.198,zz),(.48,.035,.35),OLIVE)
  box('desk pull',(xx,1.166,zz),(.22,.025,.015),BRASS,.005)
# A restrained fabric rug replaces the mechanical floor grille.
LINEN=material('Warm workshop woven flax',(.38,.31,.22),rough=1)
box('woven rug',(0,-1.23,.045),(2.65,3.6,.025),LINEN,.025)
# Keep one portrait display, clear the second arm and shorten the chunky monitor riser.
for o in bpy.data.objects:
 if o.name.startswith('Walnut monitor riser top'):o.dimensions.z=.045
# no existing interactive anchors move
assert not bpy.data.objects['Main workspace monitor active screen'].hide_render
assert not bpy.data.objects['CNC spindle motor'].hide_render
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'warm-workshop.blend'))
(ROOT/'redesign-report.json').write_text(json.dumps({'removed_visual_clutter':len(removed),'new_objects':len([o for o in bpy.context.scene.objects if o.name.startswith('Warm ')]),'interactive_positions':'retained'},indent=2))
print('WARM REDESIGN READY',len(removed),flush=True)
