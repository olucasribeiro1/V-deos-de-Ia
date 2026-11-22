"""Teste de direcao artistica: personagem completo em cenario colorido; corpo inteiro + close do rosto."""
import sys, os, math, random, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
import chars3d as C, kid_v2 as K
WHO = sys.argv[sys.argv.index("--who") + 1] if "--who" in sys.argv else "lulu"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports")
sc = bpy.context.scene
t0 = time.time(); kid = K.build(WHO, 0.0); print("build", round(time.time() - t0, 1), flush=True)
# pose de teste: acenando, sorrindo
def setarm(side, pose):
    qu, qf = C.arm_quats(kid["arm"], pose, side)
    for bn, q in (("upperarm." + side, qu), ("forearm." + side, qf)):
        pb = kid["arm"].pose.bones[bn]; pb.rotation_mode = "QUATERNION"; pb.rotation_quaternion = q
setarm("R", "wave"); setarm("L", "down")
hb = kid["arm"].pose.bones["head"]; hb.rotation_mode = "XYZ"; hb.rotation_euler = (math.radians(-4), math.radians(0), math.radians(6))
K.key_face(kid, 1, mouth=0.6, brow=0.3, look=(0.0, 0.05))
# ---------------- cenario
def M(n, c, r=0.5, **k): return C.mat(n, c, r, **k)
ground = bpy.data.meshes.new("g"); import bmesh
bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=60, y_segments=60, size=12)
for v in bm.verts: v.co.z = 0.03 * math.sin(v.co.x * 1.3) * math.sin(v.co.y * 1.1) + max(0, v.co.y - 3) ** 2 * 0.01
bm.to_mesh(ground); bm.free()
g = bpy.data.objects.new("ground", ground); sc.collection.objects.link(g); C.smooth(g)
gm = bpy.data.materials.new("grassm"); gm.use_nodes = True; nt = gm.node_tree; b = nt.nodes["Principled BSDF"]
nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 4; rp = nt.nodes.new("ShaderNodeValToRGB")
rp.color_ramp.elements[0].color = (0.12, 0.42, 0.05, 1); rp.color_ramp.elements[1].color = (0.32, 0.65, 0.08, 1)
nt.links.new(nz.outputs["Fac"], rp.inputs[0]); nt.links.new(rp.outputs[0], b.inputs["Base Color"]); b.inputs["Roughness"].default_value = 0.9
g.data.materials.append(gm)
# grama 3D (fios) perto da camera
ps = g.modifiers.new("grass", "PARTICLE_SYSTEM").particle_system; pst = ps.settings
pst.type = "HAIR"; pst.count = 60000; pst.hair_length = 0.07; pst.use_advanced_hair = True
pst.render_type = "PATH"; pst.root_radius = 0.004; pst.tip_radius = 0.0005 if hasattr(pst, "tip_radius") else 0; pst.material_slot = "grassm"
pst.child_type = "INTERPOLATED"; pst.rendered_child_count = 6; pst.child_length = 0.9; pst.roughness_2 = 0.3; pst.kink = "NO"
pst.use_rotations = False
# casinha
def box(n, loc, dim, m):
    bpy.ops.mesh.primitive_cube_add(location=loc); o = bpy.context.object; o.name = n; o.scale = (dim[0] / 2, dim[1] / 2, dim[2] / 2)
    bv = o.modifiers.new("b", "BEVEL"); bv.width = 0.03; bv.segments = 3; o.data.materials.append(m); return o
wall = M("wall", (0.55, 0.82, 1.0), 0.7); trimm = M("trimw", (1, 1, 1), 0.5); roofm = M("roof", (0.95, 0.2, 0.15), 0.5, coat=0.3)
box("house", (-1.0, 3.2, 1.0), (2.6, 1.8, 2.0), wall)
bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=2.1, radius2=0, depth=1.2, location=(-1.0, 3.2, 2.6), rotation=(0, 0, math.radians(45)))
r_ = bpy.context.object; r_.scale = (1.0, 0.72, 1); r_.data.materials.append(roofm)
box("door", (-1.0, 2.29, 0.62), (0.6, 0.06, 1.2), M("door", (1.0, 0.8, 0.1), 0.4, coat=0.4))
C.sphere("knob", (-0.82, 2.25, 0.62), 0.035, M("gold", (1, 0.75, 0.2), 0.2, coat=0.8))
for wx in (-1.8, -0.2):
    box("wframe", (wx, 2.29, 1.25), (0.62, 0.06, 0.62), trimm); box("glass", (wx, 2.27, 1.25), (0.5, 0.04, 0.5), M("glassw", (0.6, 0.85, 1.0), 0.05, coat=1.0))
    box("sill", (wx, 2.24, 0.92), (0.7, 0.12, 0.06), trimm)
    for i in range(3): C.sphere("pot_fl", (wx - 0.2 + i * 0.2, 2.2, 1.0), 0.06, M("flw%d" % i, [(1, 0.3, 0.5), (1, 0.85, 0.1), (0.7, 0.4, 1)][i], 0.5))
# cerca
fm = M("fence", (1, 1, 1), 0.5)
for i in range(16):
    x = 0.6 + i * 0.22
    box("picket", (x, 2.4, 0.32), (0.12, 0.04, 0.64), fm)
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.085, depth=0.1, location=(x, 2.4, 0.69), rotation=(0, 0, math.radians(45))); bpy.context.object.data.materials.append(fm)
for z in (0.2, 0.48): box("rail", (2.25, 2.43, z), (3.5, 0.03, 0.07), fm)
# arvores com folhagem (aglomerados com relevo)
leaf = bpy.data.materials.new("leafm"); leaf.use_nodes = True; nt = leaf.node_tree; b = nt.nodes["Principled BSDF"]
nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 12; rp = nt.nodes.new("ShaderNodeValToRGB")
rp.color_ramp.elements[0].color = (0.08, 0.38, 0.06, 1); rp.color_ramp.elements[1].color = (0.35, 0.72, 0.12, 1)
nt.links.new(nz.outputs["Fac"], rp.inputs[0]); nt.links.new(rp.outputs[0], b.inputs["Base Color"])
bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.4; nt.links.new(nz.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
def tree(x, y, s):
    C.sphere("trunk", (x, y, 0.55 * s), (0.1 * s, 0.1 * s, 0.6 * s), M("bark", (0.42, 0.25, 0.12), 0.8))
    rr = random.Random(int(x * 7 + y))
    for i in range(9):
        o = K.icosphere("leafc", (x + rr.uniform(-0.45, 0.45) * s, y + rr.uniform(-0.3, 0.3) * s, (1.2 + rr.uniform(-0.25, 0.4)) * s), rr.uniform(0.3, 0.42) * s, leaf, sub=3)
        d = o.modifiers.new("d", "DISPLACE"); tx = bpy.data.textures.new("cl", "CLOUDS"); tx.noise_scale = 0.15; d.texture = tx; d.strength = 0.08 * s
    for i in range(6):
        a = rr.uniform(0, 6.28); C.sphere("fruit", (x + math.cos(a) * 0.4 * s, y - 0.35 * s, (1.1 + rr.uniform(0, 0.4)) * s), 0.05 * s, M("orangef", (1.0, 0.45, 0.05), 0.3, coat=0.5))
tree(1.6, 3.6, 1.2); tree(-3.2, 4.0, 1.4); tree(3.5, 5.0, 1.6)
for x, y in ((0.7, 1.6), (-2.3, 2.1), (2.4, 1.9)):  # arbustos
    for i in range(4): K.icosphere("bush", (x + i * 0.15 - 0.2, y, 0.18), 0.2, leaf, sub=3)
rr = random.Random(2)
for i in range(60):  # flores
    x, y = rr.uniform(-2.5, 2.5), rr.uniform(-1.2, 1.8)
    if abs(x) < 0.35 and y < 0.4: continue
    col = [(1, 0.25, 0.5), (1, 0.85, 0.1), (0.6, 0.35, 1.0), (1, 1, 1), (1, 0.5, 0.1)][i % 5]
    cu = K.capsule("stem", (x, y, 0), (x, y, 0.1), 0.004, 0.004, M("stem", (0.2, 0.6, 0.1), 0.6), seg=6)
    for k in range(6):
        a = k / 6 * 6.283; K.icosphere("pet", (x + math.cos(a) * 0.022, y + math.sin(a) * 0.022, 0.1), 1.0, M("pet%d" % (i % 5), col, 0.45), sub=2, scale=(0.02, 0.02, 0.006))
    K.icosphere("fc", (x, y, 0.103), 0.012, M("fcen", (1, 0.7, 0.1), 0.4), sub=2)
# brinquedos
ball = K.icosphere("ball", (0.55, -0.35, 0.09), 0.09, K.mat_fabric("ballm", (1.0, 0.15, 0.15), "stripes", (1, 0.9, 0.1), 60), sub=4)
for i, (c, p) in enumerate((((0.2, 0.5, 1.0), (-0.6, -0.2, 0.05)), ((1, 0.8, 0.1), (-0.48, -0.25, 0.05)), ((0.3, 0.8, 0.3), (-0.54, -0.22, 0.15)))):
    box("block", p, (0.1, 0.1, 0.1), M("blk%d" % i, c, 0.4, coat=0.4))
# ceu fisico + luzes
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; nt = w.node_tree
try:
    sky = nt.nodes.new("ShaderNodeTexSky"); sky.sky_type = "NISHITA"; sky.sun_elevation = math.radians(40); sky.sun_rotation = math.radians(200)
    nt.links.new(sky.outputs[0], nt.nodes["Background"].inputs[0]); nt.nodes["Background"].inputs[1].default_value = 0.35
except Exception as e:
    print("sky fallback", e); nt.nodes["Background"].inputs[0].default_value = (0.35, 0.6, 1, 1)
bpy.ops.object.light_add(type="SUN", rotation=(math.radians(50), 0, math.radians(-35))); sun = bpy.context.object; sun.data.energy = 3.2; sun.data.angle = math.radians(6); sun.data.color = (1, 0.95, 0.86)
bpy.ops.object.light_add(type="AREA", location=(1.2, -2.2, 1.4)); f = bpy.context.object; f.data.energy = 40; f.data.size = 2.5
f.rotation_euler = (Vector((0, 0, 0.6)) - f.location).to_track_quat("-Z", "Y").to_euler()
bpy.ops.object.light_add(type="AREA", location=(-0.8, 1.2, 1.5)); rl = bpy.context.object; rl.data.energy = 35; rl.data.size = 1.5; rl.data.color = (1, 0.9, 0.8)
rl.rotation_euler = (Vector((0, 0, 0.7)) - rl.location).to_track_quat("-Z", "Y").to_euler()
# render
sc.render.engine = "CYCLES"; cy = sc.cycles; cy.samples = 48; cy.use_denoising = True; cy.max_bounces = 6; cy.transmission_bounces = 4; cy.glossy_bounces = 3
sc.view_settings.view_transform = "AgX"; sc.view_settings.look = "AgX - Punchy"
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam; cam.data.dof.use_dof = True
def shot(fname, loc, target, lens, fstop):
    cam.location = loc; cam.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler(); cam.data.lens = lens
    cam.data.dof.focus_distance = (Vector(target) - Vector(loc)).length; cam.data.dof.aperture_fstop = fstop
    sc.render.filepath = os.path.join(OUT, fname); t = time.time(); bpy.ops.render.render(write_still=True); print(fname, round(time.time() - t, 1), flush=True)
sc.frame_set(1)
shot("teste_arte_%s_corpo.png" % WHO, (0.35, -2.3, 0.62), (0, 0, 0.52), 38, 4.0)
shot("teste_arte_%s_rosto.png" % WHO, (0.12, -0.75, 0.86), (0, -0.1, 0.84), 60, 2.8)
