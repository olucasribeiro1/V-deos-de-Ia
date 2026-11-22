"""Piloto 3D (0-30s de 'Quem Fez? Foi Deus!'): cenario 3D, dois personagens com rig, animacao pela letra,
sincronizacao labial pelas palavras, cameras. Renderiza PNGs com retomada (pula quadros prontos).
Uso: /opt/kidsvenv/bin/python pilot3d.py [--test] [--res 1280x720] [--start S --end E]"""
import sys, os, math, json, random, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector, Quaternion, Matrix
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
TEST = "--test" in args
RES = tuple(int(v) for v in (args[args.index("--res") + 1] if "--res" in args else "1280x720").split("x"))
T_START = float(args[args.index("--start") + 1]) if "--start" in args else 0.0
T_END = float(args[args.index("--end") + 1]) if "--end" in args else 30.0
FPS = 30
OUT = os.path.join(ROOT, "renders", "pilot")
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
import chars3d as C
C.ARM_POSES["wave2"] = ((1.0, 0.0, 0.55), (0.7, -0.15, 0.75))
C.ARM_POSES["one"] = ((0.85, -0.3, 0.55), (0.35, -0.3, 1.0))

# ------------------------------------------------------------------ musica / palavras / batida
words = json.load(open(os.path.join(ROOT, "music", "words.json")))
plan = json.load(open(os.path.join(ROOT, "music", "composition_plan.json")))["composition_plan"]["sections"]
BPM = 112.3; BEAT0 = 0.27
def beat_phase(t): return ((t - BEAT0) * BPM / 60.0) % 1.0
def mouth_open(t, amp=1.0):
    for w in words:
        if w["s"] - 0.03 <= t <= w["e"] + 0.02:
            return amp * (0.3 + 0.7 * abs(math.sin((t - w["s"]) * math.pi / 0.17)))
        if w["s"] > t: break
    return 0.0

# ------------------------------------------------------------------ cenario 3D
scene = bpy.context.scene
def M(name, col, rough=0.6, emit=0.0, sss=0.0): return C.mat(name, col, rough, sss=sss, emit=emit)

def ground():
    import bmesh
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=120, y_segments=120, size=30)
    r = random.Random(1)
    for v in bm.verts:
        x, y = v.co.x, v.co.y
        d = max(0.0, y - 2.0)
        v.co.z = (0.05 * math.sin(x * 0.7) + 0.04 * math.sin(y * 0.9)) + d * d * 0.004 * (1 + 0.5 * math.sin(x * 0.25 + 1.3))
    me = bpy.data.meshes.new("ground"); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new("ground", me); scene.collection.objects.link(o); C.smooth(o)
    m = bpy.data.materials.new("grass"); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    noise = nt.nodes.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 6.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.1, 0.45, 0.06, 1); ramp.color_ramp.elements[1].color = (0.3, 0.68, 0.1, 1)
    nt.links.new(noise.outputs["Fac"], ramp.inputs[0]); nt.links.new(ramp.outputs[0], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.85
    o.data.materials.append(m)
    # morros de fundo
    for x, y, sx, sz, c in ((-14, 34, 14, 3.5, (0.25, 0.6, 0.2)), (12, 38, 16, 4.5, (0.3, 0.62, 0.25)), (0, 46, 24, 6, (0.4, 0.66, 0.45))):
        h = C.sphere("hill", (x, y, -1), (sx, 6, sz), M("hill%d" % x, c, 0.9)); C.smooth(h)

def tree(x, y, s):
    t = C.sphere("trunk", (x, y, 0.5 * s), (0.12 * s, 0.12 * s, 0.55 * s), M("trunk", (0.45, 0.28, 0.15), 0.8))
    crown = C.metaball("crown", [(x, y, 1.25 * s, 0.6 * s, 1, 1, 0.9), (x - 0.4 * s, y, 1.05 * s, 0.45 * s, 1, 1, 1), (x + 0.4 * s, y, 1.05 * s, 0.45 * s, 1, 1, 1),
                                 (x, y, 1.65 * s, 0.4 * s, 1, 1, 1)], M("leaves", (0.2, 0.62, 0.15), 0.7), res=0.05 * s)
    r = random.Random(int(x * 10 + y))
    for i in range(5):
        a = r.uniform(0, 6.28)
        C.sphere("apple", (x + math.cos(a) * 0.5 * s, y - 0.45 * s, (1.1 + r.uniform(0, 0.6)) * s), 0.06 * s, M("apple", (0.95, 0.15, 0.1), 0.3), seg=16)

def flower(x, y, col, s=1.0):
    C.sphere("fc", (x, y, 0.09 * s), 0.025 * s, M("fcenter", (1, 0.82, 0.1), 0.5), seg=12)
    for i in range(5):
        a = i / 5 * 6.283
        C.sphere("fp", (x + math.cos(a) * 0.035 * s, y + math.sin(a) * 0.035 * s, 0.085 * s), (0.03 * s, 0.03 * s, 0.012 * s), M("petal%s" % str(col), col, 0.5), seg=12)

def cloud(name, x, y, z, s):
    return C.metaball(name, [(x, y, z, 0.9 * s, 1.4, 1, 0.8), (x - 0.9 * s, y, z - 0.15 * s, 0.6 * s, 1, 1, 0.9), (x + 0.9 * s, y, z - 0.1 * s, 0.7 * s, 1, 1, 0.9),
                             (x + 0.3 * s, y, z + 0.4 * s, 0.6 * s, 1, 1, 1)], M("cloud", (1, 1, 1), 0.9, sss=0.0), res=0.06 * s)

ground()
for x, y, s in ((-3.2, 3.5, 1.2), (3.0, 4.0, 1.3), (-6, 8, 1.6), (6.5, 9, 1.7), (-1.5, 10, 1.4), (1.8, 6.5, 1.0)):
    tree(x, y, s)
r = random.Random(3)
for i in range(70):
    flower(r.uniform(-3.5, 3.5), r.uniform(-1.5, 3.0), [(1, 0.45, 0.7), (1, 1, 1), (0.75, 0.5, 1.0), (1, 0.6, 0.2)][i % 4], r.uniform(0.9, 1.4))
clouds_bg = [cloud("cloudA", -5, 18, 6.5, 1.3), cloud("cloudB", 5, 20, 7.5, 1.5)]
clouds_new = [cloud("cloudN%d" % i, x, 14, z, 1.0) for i, (x, z) in enumerate(((-3.5, 4.2), (0, 5.4), (3.6, 4.5), (-1.8, 6.6), (2.2, 7.0)))]
sun = C.sphere("sun", (-5.5, 16, 5.5), 1.1, M("sunm", (1.0, 0.7, 0.1), 0.4, emit=2.2))
moon = C.sphere("moon", (5.5, 16, 5.5), 0.9, M("moonm", (1.0, 0.9, 0.55), 0.6, emit=1.3))
stars = []
r = random.Random(8)
for i in range(60):
    stars.append(C.sphere("star", (r.uniform(-14, 14), r.uniform(15, 25), r.uniform(3, 12)), r.uniform(0.04, 0.09), M("starm", (1, 0.95, 0.7), 0.3, emit=12), seg=8))
orb = C.sphere("orb", (0, 12, 5), 1.0, M("orbm", (1, 0.92, 0.6), 0.2, emit=8))

# luzes e mundo
bpy.ops.object.light_add(type="SUN", rotation=(math.radians(50), 0, math.radians(-30))); key = bpy.context.object; key.data.angle = math.radians(10)
bpy.ops.object.light_add(type="AREA", location=(0, -4, 3)); fill = bpy.context.object; fill.data.size = 5
fill.rotation_euler = (math.radians(55), 0, 0)
bpy.ops.object.light_add(type="AREA", location=(0, 3, 2.5)); rim = bpy.context.object; rim.data.size = 3; rim.rotation_euler = (math.radians(-60), 0, 0)
world = bpy.data.worlds.new("w"); scene.world = world; world.use_nodes = True
bg = world.node_tree.nodes["Background"]

# personagens
LULU = C.build_kid("lulu", -0.3); THEO = C.build_kid("theo", 0.3)

# camera
bpy.ops.object.camera_add(); cam = bpy.context.object; scene.camera = cam
cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 2.8

# ------------------------------------------------------------------ roteiro (pela letra)
SEG = [  # (inicio, fim, cena)
    (0.0, 6.5, "intro"), (6.5, 10.6, "levanta"), (10.6, 15.3, "escuro"), (15.3, 19.6, "luz"), (19.6, 23.9, "dianoite"), (23.9, 30.5, "ceu")]
def seg_at(t):
    for a, b, n in SEG:
        if a <= t < b: return a, b, n
    return SEG[-1]
def ease(x): x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)

def arm_targets(t, who, scn, ta):
    """poses de braco (L, R) por cena"""
    if scn == "intro":
        wav = "wave" if int(t * 5) % 2 == 0 else "wave2"
        return ("down", wav) if who == "lulu" else (wav, "down")
    if scn == "levanta":
        return ("hip", "one") if who == "lulu" else ("one", "hip")
    if scn == "escuro": return ("open", "open") if t - ta > 1.2 else ("down", "down")
    if scn == "luz":
        if t < 17.0: return ("open", "open")
        return ("up", "up")
    if scn == "dianoite": return ("down", "one") if who == "lulu" else ("one", "down")
    if scn == "ceu": return ("point", "down") if who == "lulu" else ("down", "point")
    return ("down", "down")

def blend_q(a, b, f): return a.slerp(b, ease(f))

def kid_frame(kid, who, t, fr):
    a0, b0, scn = seg_at(t)
    arm = kid["arm"]
    # transicao de pose de braco suave (0.3 s)
    tp = max(a0, t - 0.3)
    cur = arm_targets(t, who, scn, a0); prev = arm_targets(t - 0.3, who, seg_at(t - 0.3)[2], seg_at(t - 0.3)[0]) if t > 0.3 else cur
    f = (t - a0) / 0.3 if t - a0 < 0.3 else 1.0
    for side, pc, pp in (("L", cur[0], prev[0]), ("R", cur[1], prev[1])):
        qc = C.arm_quats(arm, pc, side); qp = C.arm_quats(arm, pp, side)
        for bi, bn in enumerate(("upperarm." + side, "forearm." + side)):
            pb = arm.pose.bones[bn]; pb.rotation_mode = "QUATERNION"
            pb.rotation_quaternion = blend_q(qp[bi], qc[bi], f) if pc != pp else qc[bi]
            pb.keyframe_insert("rotation_quaternion", frame=fr)
    ph = beat_phase(t)
    dark = scn == "escuro"
    energy = 0.35 if scn in ("escuro", "dianoite") else 1.0
    bounce = 0.03 * energy * abs(math.sin(ph * math.pi))
    side = 1 if who == "lulu" else -1
    look = (0.0, 0.0)
    brow = 0.0; mo = mouth_open(t, 1.0 if who == "lulu" else 0.55)
    head = (4 * math.sin(t * 2.1 + side), 0, side * 10 + 4 * math.sin(t * 1.3))
    if scn == "escuro":
        lk = math.sin((t - a0) * 1.6 + side); look = (lk, 0.2); brow = 0.8; head = (8, 0, side * 5 + 25 * lk)
    if scn == "luz":
        if t < 17.3: brow = 1.0; look = (0, 0.8); head = (-14, 0, side * 5)
        if 16.6 <= t < 17.4 and who == "theo": mo = max(mo, 0.9)
    if scn == "ceu" and t > 25.6: look = (0, 0.9); head = (-18, 0, side * 6); brow = 0.6
    if scn == "intro" and 3.5 < t < 6.5: brow = 0.5
    blink = 1.0 if ((t + (0 if who == "lulu" else 1.3)) % 3.4) < 0.1 and scn != "escuro" else 0.0
    C.key_pose(kid, fr, {"head": head, "hips": (0, 3 * math.sin(ph * 2 * math.pi) * energy, 0), "spine": (0, 0, 4 * math.sin(t * 2) * energy),
                         "loc": bounce, "mouth": mo, "blink": blink, "brow": brow, "look": look, "turn": side * 8})
    for s_, bn in (("L", "thigh.L"), ("R", "thigh.R")):
        pb = arm.pose.bones[bn]; pb.rotation_mode = "XYZ"
        pb.rotation_euler = (math.radians(-8 * bounce / 0.03 * (1 if s_ == "L" else 0.6)), 0, 0); pb.keyframe_insert("rotation_euler", frame=fr)

def look_at(obj, target):
    d = Vector(target) - obj.location
    obj.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()

def env_frame(t, fr):
    a0, b0, scn = seg_at(t)
    day = (0.3, 0.58, 1.0); night = (0.01, 0.012, 0.035)
    if scn == "escuro":
        k = ease((t - a0) / 0.8); wc = [day[i] * (1 - k) + night[i] * k for i in range(3)]; ke, fe, re = 1.9 * (1 - k) + 0.02, 35 * (1 - k) + 6, 18
    elif scn == "luz":
        k = ease((t - 17.1) / 1.0); wc = [night[i] * (1 - k) + day[i] * k for i in range(3)]; ke, fe, re = 0.02 + 1.9 * k, 6 + 29 * k, 25
    else:
        wc = day; ke, fe, re = 1.9, 35, 25
        if scn == "dianoite" and t >= 22.3:
            wc = (0.03, 0.05, 0.18); ke, fe, re = 0.15, 14, 22
    bg.inputs[0].default_value = (*wc, 1); bg.inputs[1].default_value = 0.75
    bg.inputs[0].keyframe_insert("default_value", frame=fr)
    key.data.energy = ke; fill.data.energy = fe; rim.data.energy = re
    fill.data.color = (0.75, 0.8, 1.0) if (scn == "escuro" or (scn == "dianoite" and t >= 22.3)) else (1, 0.97, 0.92)
    for l in (key.data, fill.data, rim.data):
        l.keyframe_insert("energy", frame=fr)
    fill.data.keyframe_insert("color", frame=fr)
    nt_ = scn == "dianoite" and t >= 22.3
    vis = {"sun": scn in ("intro", "levanta", "ceu") or (scn == "dianoite" and not nt_), "moon": nt_,
           "stars": nt_ or scn == "escuro", "orb": scn == "luz", "newclouds": scn == "ceu"}
    for o, v in ((sun, vis["sun"]), (moon, vis["moon"]), (orb, vis["orb"])):
        o.hide_render = not v; o.keyframe_insert("hide_render", frame=fr)
    if scn == "dianoite":
        sun.location = (0, 16, 4.8); moon.location = (0, 16, 4.8)
    else:
        sun.location = (-5.5, 16, 5.5)
    sun.keyframe_insert("location", frame=fr); moon.keyframe_insert("location", frame=fr)
    if scn == "luz":
        s = 1.6 * ease((t - 16.5) / 0.6) * (1 + 0.05 * math.sin(t * 8)); orb.scale = (s, s, s); orb.keyframe_insert("scale", frame=fr)
    for st in stars:
        st.hide_render = not vis["stars"]; st.keyframe_insert("hide_render", frame=fr)
    for i, c in enumerate(clouds_new):
        tt = 25.0 + i * 0.35
        s = ease((t - tt) / 0.6) if scn == "ceu" else 0.0
        c.scale = (max(0.001, s),) * 3; c.keyframe_insert("scale", frame=fr)
    # camera por cena
    if scn == "intro":
        k = ease(t / 6.5); cam.location = (0, -4.6 + 1.2 * k, 0.95 - 0.1 * k); cam.data.lens = 35; look_at(cam, (0, 0, 0.62))
    elif scn == "levanta":
        cam.location = (0.15 + 0.1 * math.sin(t), -2.7, 0.72); cam.data.lens = 42; look_at(cam, (0, 0, 0.6))
    elif scn == "escuro":
        a = (t - a0) * 0.12; cam.location = (3.0 * math.sin(a), -3.0 * math.cos(a), 0.8); cam.data.lens = 38; look_at(cam, (0, 0, 0.6))
    elif scn == "luz":
        k = ease((t - a0) / 2.5); cam.location = (0, -2.4, 0.4); cam.data.lens = 28; look_at(cam, (0, 4, 0.9 + 2.2 * k))
    elif scn == "dianoite":
        cam.location = (0, -4.4, 0.9); cam.data.lens = 30; look_at(cam, (0, 4, 1.9))
    elif scn == "ceu":
        k = ease((t - 25.6) / 1.5); cam.location = (0, -4.0, 0.45); cam.data.lens = 26; look_at(cam, (0, 4 * k, 0.75 + 2.6 * k))
    cam.data.dof.focus_distance = (Vector((0, 0, 0.7)) - cam.location).length
    cam.keyframe_insert("location", frame=fr); cam.keyframe_insert("rotation_euler", frame=fr)
    cam.data.keyframe_insert("lens", frame=fr); cam.data.dof.keyframe_insert("focus_distance", frame=fr)

f0 = int(T_START * FPS) + 1; f1 = int(T_END * FPS)
t_build = time.time()
for fr in range(f0, f1 + 1):
    t = (fr - 1) / FPS
    env_frame(t, fr); kid_frame(LULU, "lulu", t, fr); kid_frame(THEO, "theo", t, fr)
# interpolacao constante (cortes secos de camera)
for ob in bpy.data.objects:
    ad = ob.animation_data
    if ad and ad.action:
        try:
            for fc in ad.action.fcurves:
                for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
        except Exception: pass
print("keys", round(time.time() - t_build, 1), "s", flush=True)

# ------------------------------------------------------------------ render
scene.render.engine = "CYCLES"; cy = scene.cycles
cy.device = "CPU"; cy.samples = 6 if TEST else 10; cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.06
cy.use_denoising = True; cy.denoiser = "OPENIMAGEDENOISE"
cy.max_bounces = 4; cy.diffuse_bounces = 2; cy.glossy_bounces = 2; cy.transmission_bounces = 0; cy.volume_bounces = 0; cy.caustics_reflective = False; cy.caustics_refractive = False
scene.render.use_persistent_data = True
scene.view_settings.view_transform = "Standard"; scene.view_settings.look = "Medium High Contrast"
scene.render.resolution_x, scene.render.resolution_y = RES
scene.render.fps = FPS
scene.frame_start, scene.frame_end = f0, f1
scene.frame_step = int(os.environ.get("FRAME_STEP", "1"))
scene.render.image_settings.file_format = "PNG"
scene.render.use_overwrite = False; scene.render.use_placeholder = True
scene.render.filepath = os.path.join(OUT, "f_")
if TEST:
    for tt in (2.0, 8.0, 12.5, 17.8, 21.5, 27.5):
        scene.frame_set(int(tt * FPS) + 1)
        scene.render.filepath = "/tmp/claude-0/pilot_%05.1f.png" % tt
        t0 = time.time(); bpy.ops.render.render(write_still=True); print("frame", tt, round(time.time() - t0, 1), "s", flush=True)
else:
    bpy.ops.render.render(animation=True)
    print("RENDER OK", flush=True)
