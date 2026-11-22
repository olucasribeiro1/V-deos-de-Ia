import sys, math, time; sys.path.insert(0, '/home/user/V-deos-de-Ia/kids-animation-studio/scripts')
import bpy
bpy.ops.wm.read_factory_settings(use_empty=True)
import chars3d as C
L=C.build_kid("lulu", -0.32); T=C.build_kid("theo", 0.32)
def setarm(k, side, pose):
    qu,qf=C.arm_quats(k["arm"], pose, side)
    for bn,q in (("upperarm."+side,qu),("forearm."+side,qf)):
        pb=k["arm"].pose.bones[bn]; pb.rotation_mode="QUATERNION"; pb.rotation_quaternion=q
setarm(L,"R","wave"); setarm(L,"L","down"); setarm(T,"R","point"); setarm(T,"L","hip")
C.key_pose(L,1,{"head":(0,0,8),"mouth":0.8,"brow":0.5,"look":(0.3,0)}); C.key_pose(T,1,{"mouth":0.0,"look":(-0.3,0.2)})
s=bpy.context.scene; s.frame_set(1)
s.render.engine="CYCLES"; s.cycles.samples=24; s.cycles.use_denoising=True
s.view_settings.view_transform="Standard"; s.view_settings.look="Medium High Contrast"
s.render.resolution_x, s.render.resolution_y = 960, 540
w=bpy.data.worlds.new("w"); s.world=w; w.use_nodes=True; w.node_tree.nodes["Background"].inputs[0].default_value=(0.45,0.7,1,1); w.node_tree.nodes["Background"].inputs[1].default_value=0.45
bpy.ops.mesh.primitive_plane_add(size=20); g=bpy.context.object; g.data.materials.append(C.mat("ground",(0.25,0.65,0.15),0.8))
bpy.ops.object.light_add(type="SUN", rotation=(math.radians(50),0,math.radians(-35))); bpy.context.object.data.energy=2.2; bpy.context.object.data.angle=math.radians(12)
bpy.ops.object.light_add(type="AREA", location=(0,-3,2)); a=bpy.context.object; a.data.energy=60; a.data.size=3; a.rotation_euler=(math.radians(60),0,0)
bpy.ops.object.camera_add(location=(0,-2.6,0.75), rotation=(math.radians(88),0,0)); s.camera=bpy.context.object; s.camera.data.lens=40
s.render.filepath="/tmp/claude-0/char3d.png"; bpy.ops.render.render(write_still=True)
