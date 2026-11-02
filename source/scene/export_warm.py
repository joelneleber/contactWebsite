import bpy,json,time
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent
OUT=ROOT.parent.parent/'assets'/'cockpit'
sc=bpy.context.scene;deps=bpy.context.evaluated_depsgraph_get();start=time.time()
source=[o for o in sc.objects if o.type in {'MESH','CURVE','FONT','SURFACE'} and not o.hide_render]
groups={};materials={};triangles=0

def material(src):
 if src.name in materials:return materials[src.name]
 m=bpy.data.materials.new('WEB · '+src.name);m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF');n=m.node_tree.nodes;l=m.node_tree.links
 nodes=src.node_tree.nodes if src.use_nodes else []
 orig=next((n for n in nodes if n.type=='BSDF_PRINCIPLED'),None)
 if orig:
  for key in ['Base Color','Metallic','Roughness','Emission Color','Emission Strength','Alpha']:
   b.inputs[key].default_value=orig.inputs[key].default_value
 else:b.inputs['Base Color'].default_value=src.diffuse_color
 images=[n.image for n in nodes if n.type=='TEX_IMAGE' and n.image]
 def use(im,socket,normal=False):
  t=n.new('ShaderNodeTexImage');t.image=im
  if normal:
   norm=n.new('ShaderNodeNormalMap');norm.inputs['Strength'].default_value=.5;l.new(t.outputs['Color'],norm.inputs['Color']);l.new(norm.outputs[0],b.inputs[socket])
  else:l.new(t.outputs['Color'],b.inputs[socket])
 for im in images:
  name=im.name.lower()
  if '_diff' in name:use(im,'Base Color')
  elif '_rough' in name:use(im,'Roughness')
  elif '_metal' in name:use(im,'Metallic')
  elif '_nor_gl' in name:use(im,'Normal',True)
 if src.name.startswith('Display '):
  b.inputs['Base Color'].default_value=(0,0,0,1);b.inputs['Emission Strength'].default_value=1
  if images:use(images[0],'Emission Color')
 if src.name=='Translucent lithophane shade':
  b.inputs['Base Color'].default_value=(.8,.6,.32,1);b.inputs['Emission Color'].default_value=(1,.58,.16,1);b.inputs['Emission Strength'].default_value=.65
 if 'window' in src.name.lower() or 'optical cockpit window' in src.name.lower():
  b.inputs['Base Color'].default_value=(.12,.21,.23,1);b.inputs['Metallic'].default_value=.15;b.inputs['Roughness'].default_value=.35;b.inputs['Alpha'].default_value=.3;m.surface_render_method='DITHERED'
 materials[src.name]=m;return m

def zone(o):
 name=o.name
 if name.startswith(('CNC spindle motor','CNC collet','CNC end mill','Spindle carriage')):return 'cnc_motion'
 if name.startswith(('CNC gantry','CNC stepper motor','CNC extrusion fine groove','Gantry face rail','Gantry hex fastener')):return 'cnc_gantry'
 if name.startswith(('Printer toolhead','Printer nozzle')):return 'printer_motion'
 if name=='Main workspace monitor active screen':return 'screen'
 if name.startswith(('Lamp ','Lithophane')):return 'lamp'
 if 'Printer' in name or 'Printed ribbed' in name or 'Visible printed' in name:return 'printer'
 if name.startswith(('Main workspace monitor','Left portrait display','Right portrait display','Keyboard','Mechanical keyboard','Trackball','Polished trackball','Console','Lower instrument','Small rotary','Small fluted','Dial fluting','Rocker','Cockpit rocker')):return 'computer'
 p=o.matrix_world.translation
 if p.x<-1.7 and p.z>.95:return 'wood'
 if p.x>1.7 and p.z>.95:return 'lab'
 return 'room'

for count,o in enumerate(source):
 try:mesh=bpy.data.meshes.new_from_object(o.evaluated_get(deps),preserve_all_data_layers=True,depsgraph=deps)
 except Exception as ex:print('SKIP',o.name,ex,flush=True);continue
 if not mesh.polygons:bpy.data.meshes.remove(mesh);continue
 matrix=o.matrix_world;normalmatrix=matrix.to_3x3().inverted().transposed();uv=mesh.uv_layers.active
 bymat={}
 for p in mesh.polygons:bymat.setdefault(p.material_index,[]).append(p)
 for mi,polys in bymat.items():
  src=mesh.materials[mi] if mi<len(mesh.materials) and mesh.materials[mi] else bpy.data.materials['Graphite powder coat'];key=(zone(o),src.name)
  g=groups.setdefault(key,{'verts':[],'faces':[],'uv':[],'normals':[],'material':material(src)})
  offset=len(g['verts']);g['verts'].extend([tuple(matrix@v.co) for v in mesh.vertices])
  for p in polys:
   g['faces'].append(tuple(offset+vi for vi in p.vertices));triangles+=len(p.vertices)-2
   for li in p.loop_indices:
    g['uv'].append(tuple(uv.data[li].uv) if uv else (0,0));g['normals'].append(tuple((normalmatrix@mesh.corner_normals[li].vector).normalized()))
 bpy.data.meshes.remove(mesh)
 if count%400==0:print('CONVERTED',count,'of',len(source),flush=True)
# Place export geometry in a separate scene; the editable source file is never saved over.
export_sc=bpy.data.scenes.new('Browser optimized export');bpy.context.window.scene=export_sc
for (station,name),g in groups.items():
 mesh=bpy.data.meshes.new(station+'__'+name);mesh.from_pydata(g['verts'],[],g['faces']);mesh.update();mesh.materials.append(g['material']);layer=mesh.uv_layers.new(name='UVMap')
 for li,uv in enumerate(g['uv']):layer.data[li].uv=uv
 for p in mesh.polygons:p.use_smooth=True
 mesh.normals_split_custom_set(g['normals'])
 o=bpy.data.objects.new('Screen_Computer' if station=='screen' else station+'__'+name,mesh);export_sc.collection.objects.link(o);o['zone']='computer' if station=='screen' else station
 if station=='screen':o['desktopScreen']=True
print('EXPORT',len(groups),'draw groups',triangles,'triangles',flush=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'command-center-warm-raw.glb'),export_format='GLB',use_active_scene=True,export_cameras=False,export_lights=False,export_extras=True,export_yup=True,export_apply=False,export_animations=False,export_materials='EXPORT',export_image_format='AUTO')
report={'source_objects':len(source),'mesh_groups':len(groups),'triangles':triangles,'bytes':(OUT/'command-center-warm-raw.glb').stat().st_size,'elapsed_seconds':round(time.time()-start),'zones':sorted(set(k[0] for k in groups))}
(OUT/'export-report.json').write_text(json.dumps(report,indent=2));print('EXPORT COMPLETE',report,flush=True)
