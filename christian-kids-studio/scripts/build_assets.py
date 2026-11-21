"""Constroi e renderiza (Cycles/CPU) os assets 3D do estudio: personagens em varias poses
(boca aberta/fechada), bichinhos, objetos e cenarios. Saida: PNG com transparencia.
Uso: /opt/kidsvenv/bin/python build_assets.py [--only nome1,nome2] [--preview]
Assets ja renderizados sao pulados (cache)."""
import bpy, bmesh, math, os, sys, random
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
PREVIEW = "--preview" in ARGS
ONLY = None
if "--only" in ARGS:
    ONLY = set(ARGS[ARGS.index("--only") + 1].split(","))
FORCE = "--force" in ARGS
OUT = os.path.join(ROOT, "assets", "renders" + ("_preview" if PREVIEW else ""))
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- utilidades
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.samples = 12 if PREVIEW else 48
    s.cycles.use_adaptive_sampling = True
    s.cycles.use_denoising = True
    s.cycles.max_bounces = 4
    s.view_settings.view_transform = "Standard"
    s.view_settings.look = "Medium High Contrast"
    return s

_mats = {}
def mat(name, color, rough=0.45, coat=0.25, sss=0.0, emit=0.0, alpha=1.0):
    key = (name, color, rough, coat, sss, emit)
    if key in _mats and _mats[key].name in bpy.data.materials:
        return _mats[key]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    c = tuple(color) + (1,) if len(color) == 3 else color
    b.inputs["Base Color"].default_value = c
    b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = 0.2
    if sss:
        b.inputs["Subsurface Weight"].default_value = sss
        b.inputs["Subsurface Radius"].default_value = (0.4, 0.2, 0.15)
        b.inputs["Subsurface Scale"].default_value = 0.05
    if emit:
        b.inputs["Emission Color"].default_value = c
        b.inputs["Emission Strength"].default_value = emit
    _mats[key] = m
    return m

def smooth(o):
    for p in o.data.polygons:
        p.use_smooth = True
    return o

def sphere(loc, scale, m, seg=40, parent=None, name="s"):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, location=loc)
    o = bpy.context.object; o.name = name
    o.scale = scale if isinstance(scale, (tuple, list)) else (scale,) * 3
    o.data.materials.append(m); smooth(o)
    if parent: setp(o, parent)
    return o

def cyl(loc, r, depth, m, rot=(0, 0, 0), parent=None, r2=None, verts=32):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r2, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object; o.data.materials.append(m); smooth(o)
    bev = o.modifiers.new("b", "BEVEL"); bev.width = min(r, r2 or r) * 0.35; bev.segments = 3
    if parent: setp(o, parent)
    return o

def setp(o, parent):
    bpy.context.view_layer.update()
    mw = o.matrix_world.copy(); o.parent = parent; o.matrix_world = mw

def empty(loc, rot=(0, 0, 0)):
    bpy.ops.object.empty_add(location=loc, rotation=rot)
    return bpy.context.object

def arc(loc, major, minor, m, rot=(math.radians(90), 0, 0), keep="lower", parent=None):
    """meio-toro: sorriso / olho fechado / arco-iris"""
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=48, minor_segments=12)
    o = bpy.context.object
    bm = bmesh.new(); bm.from_mesh(o.data)
    kill = [v for v in bm.verts if (v.co.y > minor * 0.2 if keep == "lower" else v.co.y < -minor * 0.2)]
    bmesh.ops.delete(bm, geom=kill, context="VERTS"); bm.to_mesh(o.data); bm.free()
    o.location = loc; o.rotation_euler = rot; o.data.materials.append(m); smooth(o)
    if parent: setp(o, parent)
    return o

def star_mesh(loc, r, m, depth=0.12, pts=5, parent=None, rot=(math.radians(90), 0, 0)):
    me = bpy.data.meshes.new("star"); bm = bmesh.new()
    vs = []
    for i in range(pts * 2):
        a = math.pi / 2 + i * math.pi / pts
        rr = r if i % 2 == 0 else r * 0.45
        vs.append(bm.verts.new((math.cos(a) * rr, math.sin(a) * rr, 0)))
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]:
        v.co.z += depth
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new("star", me); bpy.context.collection.objects.link(o)
    o.location = loc; o.rotation_euler = rot; o.data.materials.append(m)
    bev = o.modifiers.new("b", "BEVEL"); bev.width = depth * 0.45; bev.segments = 4
    smooth(o)
    if parent: setp(o, parent)
    return o

def heart_mesh(loc, size, m, parent=None):
    me = bpy.data.meshes.new("heart"); bm = bmesh.new(); vs = []
    for i in range(64):
        t = i / 64 * 2 * math.pi
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        vs.append(bm.verts.new((x / 17 * size, y / 17 * size, 0)))
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]:
        v.co.z += size * 0.35
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new("heart", me); bpy.context.collection.objects.link(o)
    o.location = loc; o.rotation_euler = (math.radians(90), 0, 0); o.data.materials.append(m)
    bev = o.modifiers.new("b", "BEVEL"); bev.width = size * 0.15; bev.segments = 5
    smooth(o)
    if parent: setp(o, parent)
    return o

def studio(target=(0, 0, 1.15), dist=5.0, lens=50, res=(768, 1024), ortho=None, shadow=False, world=(0.75, 0.8, 0.9), wstr=0.45, elev=0.15):
    s = bpy.context.scene
    s.render.resolution_x, s.render.resolution_y = res
    s.render.film_transparent = True
    t = Vector(target)
    cam_loc = t + Vector((0, -dist, dist * elev))
    bpy.ops.object.camera_add(location=cam_loc)
    cam = bpy.context.object
    d = t - cam.location
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    cam.data.lens = lens
    if ortho:
        cam.data.type = "ORTHO"; cam.data.ortho_scale = ortho
    s.camera = cam
    bpy.ops.object.light_add(type="AREA", location=(-3.5, -4.5, 5.5))
    k = bpy.context.object; k.data.energy = 380; k.data.size = 4; k.data.color = (1, 0.95, 0.88)
    k.rotation_euler = (t - k.location).to_track_quat("-Z", "Y").to_euler()
    bpy.ops.object.light_add(type="AREA", location=(4, -3, 2.5))
    f = bpy.context.object; f.data.energy = 160; f.data.size = 5; f.data.color = (0.85, 0.9, 1)
    f.rotation_euler = (t - f.location).to_track_quat("-Z", "Y").to_euler()
    bpy.ops.object.light_add(type="AREA", location=(0, 4, 4))
    r = bpy.context.object; r.data.energy = 260; r.data.size = 3
    r.rotation_euler = (t - r.location).to_track_quat("-Z", "Y").to_euler()
    w = bpy.data.worlds.new("w"); s.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = tuple(world) + (1,)
    w.node_tree.nodes["Background"].inputs[1].default_value = wstr
    if shadow:
        bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0))
        p = bpy.context.object; p.is_shadow_catcher = True
    return cam

def render(name):
    path = os.path.join(OUT, name + ".png")
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print("OK", name, flush=True)

def wanted(name):
    if ONLY and not any(name.startswith(o) for o in ONLY):
        return False
    if not FORCE and os.path.exists(os.path.join(OUT, name + ".png")):
        return False
    return True

# ---------------------------------------------------------------- rosto padrao
def face(head, c, mouth, eyes="open", z=1.62, r=0.58, iris=(0.25, 0.14, 0.07)):
    M_white = mat("eyewhite", (0.97, 0.97, 0.97), 0.25, 0.6)
    M_iris = mat("iris", iris, 0.3, 0.8)
    M_pupil = mat("pupil", (0.02, 0.02, 0.025), 0.2, 0.9)
    M_hi = mat("hi", (1, 1, 1), 0.1, 0, emit=2.0)
    M_lash = mat("lash", (0.05, 0.03, 0.03), 0.5)
    for sx in (-1, 1):
        ex, ez = sx * 0.2 * r / 0.58, z + 0.07 * r / 0.58
        ey = -r * 0.86
        if eyes == "open":
            sphere((ex, ey, ez), (0.13 * r / .58, 0.07, 0.165 * r / .58), M_white, parent=head)
            sphere((ex, ey - 0.045, ez - 0.01), (0.095 * r / .58, 0.04, 0.12 * r / .58), M_iris, parent=head)
            sphere((ex, ey - 0.075, ez - 0.01), (0.055 * r / .58, 0.03, 0.07 * r / .58), M_pupil, parent=head)
            sphere((ex + 0.035, ey - 0.11, ez + 0.05), 0.028 * r / .58, M_hi, seg=16, parent=head)
            sphere((ex - 0.03, ey - 0.11, ez - 0.05), 0.014 * r / .58, M_hi, seg=12, parent=head)
        else:
            arc((ex, ey - 0.03, ez - 0.02), 0.09 * r / .58, 0.016, M_lash, parent=head)
    M_cheek = mat("cheek", (1.0, 0.45, 0.5), 0.6, 0.0)
    for sx in (-1, 1):
        sphere((sx * 0.33 * r / .58, -r * 0.8, z - 0.15 * r / .58), (0.085, 0.03, 0.055), M_cheek, parent=head)
    M_m = mat("mouthdark", (0.35, 0.05, 0.08), 0.5, 0.3)
    M_t = mat("tongue", (1.0, 0.45, 0.5), 0.5, 0.3)
    mz = z - 0.2 * r / .58
    if mouth == "open":
        sphere((0, -r * 0.92, mz - 0.02), (0.1 * r / .58, 0.045, 0.085 * r / .58), M_m, parent=head)
        sphere((0, -r * 0.95, mz - 0.06), (0.06 * r / .58, 0.03, 0.035 * r / .58), M_t, parent=head)
    else:
        arc((0, -r * 0.93, mz + 0.03), 0.085 * r / .58, 0.02, M_m, parent=head)

# ---------------------------------------------------------------- criancas
POSES = {  # (rotX, rotZ) por braco: L = +x da tela, R = -x
    "idle":       ((0, -12), (0, 12)),
    "cheer":      ((0, -122), (0, 122)),
    "wave":       ((0, -12), (-10, 118)),
    "pointup":    ((0, -12), (-12, 132)),
    "open":       ((0, -80), (0, 80)),
    "clap":       ((-72, -38), (-72, 38)),
    "pray":       ((-62, -40), (-62, 40)),
    "pointself":  ((0, -12), (-58, 42)),
}

def arm(side, rx, rz_out, skin, sleeve, parent):
    sx = 1 if side == "L" else -1
    piv = empty((sx * 0.3, 0, 1.0))
    # braco aponta para baixo; rotacao "para fora" em torno de Y, para frente em X
    cyl((sx * 0.3, 0, 0.86), 0.085, 0.22, sleeve, parent=piv)
    cyl((sx * 0.3, 0, 0.68), 0.065, 0.24, skin, parent=piv)
    sphere((sx * 0.3, 0, 0.53), 0.09, skin, parent=piv)
    piv.rotation_mode = "XYZ"
    piv.rotation_euler = (math.radians(rx), math.radians(-rz_out * sx * -1) if False else 0, 0)
    # aplica: primeiro para frente (X), depois abre/levanta (Y)
    piv.rotation_euler = (math.radians(rx), math.radians(rz_out if side == "R" else rz_out), 0)
    setp(piv, parent)
    return piv

def kid(kind, pose, mouth):
    root = empty((0, 0, 0))
    skin = mat("skin_" + kind, (0.98, 0.76, 0.62) if kind == "lulu" else (0.78, 0.55, 0.4), 0.5, 0.1, sss=0.25)
    if kind == "lulu":
        top = mat("pink", (1.0, 0.25, 0.55), 0.5, 0.2)
        hairc = mat("hairL", (0.45, 0.2, 0.06), 0.45, 0.3)
        shoe = mat("shoeL", (0.95, 0.3, 0.45), 0.4, 0.5)
        # vestido
        cyl((0, 0, 0.62), 0.46, 0.62, top, r2=0.2, parent=root)
        sphere((0, 0, 0.98), (0.27, 0.22, 0.2), top, parent=root)
        sphere((0, -0.1, 0.92), (0.2, 0.12, 0.05), mat("white", (1, 1, 1), 0.5), parent=root)  # golinha
    else:
        top = mat("blue", (0.1, 0.45, 1.0), 0.5, 0.2)
        shorts = mat("shorts", (1.0, 0.72, 0.1), 0.6, 0.1)
        hairc = mat("hairT", (0.1, 0.06, 0.04), 0.5, 0.3)
        shoe = mat("shoeT", (0.95, 0.3, 0.2), 0.4, 0.5)
        sphere((0, 0, 0.86), (0.33, 0.27, 0.36), top, parent=root)
        cyl((0, 0, 0.5), 0.29, 0.22, shorts, parent=root)
        star_mesh((0, -0.27, 0.88), 0.11, mat("yellow", (1, 0.85, 0.15), 0.4, 0.4), depth=0.03, parent=root)
    for sx in (-1, 1):
        cyl((sx * 0.13, 0, 0.28), 0.075, 0.34, skin, parent=root)
        sphere((sx * 0.14, -0.06, 0.08), (0.12, 0.17, 0.08), shoe, parent=root)
    head = empty((0, 0, 1.62)); setp(head, root)
    sphere((0, 0, 1.62), 0.58, skin, parent=head)
    for sx in (-1, 1):  # orelhas
        sphere((sx * 0.57, 0.02, 1.6), (0.09, 0.06, 0.12), skin, parent=head)
    sphere((0, -0.6, 1.52), (0.05, 0.04, 0.04), skin, parent=head)  # nariz
    if kind == "lulu":
        sphere((0, 0.14, 1.72), (0.63, 0.6, 0.6), hairc, parent=head)
        for i, x in enumerate((-0.32, -0.12, 0.1, 0.3)):
            sphere((x, -0.4, 2.02 - abs(x) * 0.25), (0.17, 0.12, 0.1), hairc, parent=head)
        bow = mat("bow", (1.0, 0.25, 0.5), 0.35, 0.6)
        for sx in (-1, 1):
            sphere((sx * 0.66, 0.08, 1.72), 0.2, hairc, parent=head)
            sphere((sx * 0.74, 0.1, 1.5), (0.14, 0.14, 0.2), hairc, parent=head)
            sphere((sx * 0.6, 0.0, 1.9), (0.1, 0.06, 0.07), bow, parent=head)
            sphere((sx * 0.5, -0.02, 1.95), (0.07, 0.05, 0.06), bow, parent=head)
    else:
        sphere((0, 0.12, 1.74), (0.62, 0.6, 0.58), hairc, parent=head)
        random.seed(3)
        for i in range(14):
            a = i / 14 * math.pi * 2
            sphere((math.cos(a) * 0.42, 0.05 + math.sin(a) * 0.3, 2.08 + random.uniform(-0.04, 0.04)), 0.17, hairc, parent=head)
        for x in (-0.3, -0.1, 0.12, 0.32):
            sphere((x, -0.42, 2.0 - abs(x) * 0.2), (0.15, 0.11, 0.1), hairc, parent=head)
    eyes = "closed" if pose == "pray" else "open"
    face(head, None, mouth, eyes=eyes, iris=(0.3, 0.17, 0.07) if kind == "lulu" else (0.12, 0.3, 0.12))
    (lx, lz), (rx, rz) = POSES[pose]
    # braco L (x+): "abrir" = rotacao Y negativa; braco R (x-): Y positiva
    for side, ax, az in (("L", lx, lz), ("R", rx, rz)):
        sx = 1 if side == "L" else -1
        piv = empty((sx * 0.3, 0, 1.02))
        cyl((sx * 0.3, 0, 0.88), 0.09, 0.22, top, parent=piv)
        cyl((sx * 0.3, 0, 0.7), 0.068, 0.24, skin, parent=piv)
        sphere((sx * 0.3, 0, 0.55), 0.095, skin, parent=piv)
        piv.rotation_mode = "XYZ"
        if pose in ("clap", "pray", "pointself") and (side == "L" or pose != "pointself"):
            piv.rotation_euler = (math.radians(ax), 0, math.radians(az))
        elif pose == "pointself" and side == "R":
            piv.rotation_euler = (math.radians(ax), 0, math.radians(az))
        else:
            piv.rotation_euler = (math.radians(ax), math.radians(az), 0)
        setp(piv, root)
    return root

def sheep(pose, mouth):
    root = empty((0, 0, 0))
    wool = mat("wool", (0.98, 0.97, 0.95), 0.9, 0.0, sss=0.1)
    dark = mat("sheepface", (0.35, 0.3, 0.3), 0.6, 0.2)
    lift = 0.25 if pose == "jump" else 0
    random.seed(7)
    for i in range(16):
        a = i / 16 * math.pi * 2
        sphere((math.cos(a) * 0.38, math.sin(a) * 0.25, 0.65 + lift + random.uniform(-0.12, 0.15)), 0.26, wool, parent=root)
    sphere((0, 0, 0.68 + lift), (0.5, 0.4, 0.38), wool, parent=root)
    for sx in (-1, 1):
        for sy in (-1, 1):
            leg_len = 0.18 if pose == "jump" else 0.35
            cyl((sx * 0.22, sy * 0.15, 0.2 + lift + (0.35 - leg_len) / 2), 0.065, leg_len, dark, parent=root)
    head = empty((0, -0.35, 1.05 + lift)); setp(head, root)
    sphere((0, -0.4, 1.05 + lift), (0.3, 0.28, 0.32), dark, parent=head)
    for i in range(6):
        a = i / 6 * math.pi * 2
        sphere((math.cos(a) * 0.2, -0.35 + math.sin(a) * 0.1, 1.33 + lift), 0.13, wool, parent=head)
    for sx in (-1, 1):
        sphere((sx * 0.33, -0.35, 1.1 + lift), (0.16, 0.05, 0.07), dark, parent=head)
    sub = empty((0, -0.4, 0)); setp(sub, head)
    # rosto escalonado
    M_white = mat("eyewhite", (0.97, 0.97, 0.97), 0.25, 0.6)
    M_pupil = mat("pupil", (0.02, 0.02, 0.025), 0.2, 0.9)
    M_hi = mat("hi", (1, 1, 1), 0.1, 0, emit=2.0)
    z = 1.1 + lift
    for sx in (-1, 1):
        sphere((sx * 0.11, -0.66, z + 0.03), (0.08, 0.04, 0.095), M_white, parent=head)
        sphere((sx * 0.11, -0.7, z + 0.02), (0.045, 0.02, 0.055), M_pupil, parent=head)
        sphere((sx * 0.11 + 0.02, -0.72, z + 0.05), 0.015, M_hi, seg=12, parent=head)
    M_m = mat("mouthdark", (0.35, 0.05, 0.08), 0.5, 0.3)
    if mouth == "open":
        sphere((0, -0.68, z - 0.14), (0.06, 0.03, 0.05), M_m, parent=head)
    else:
        arc((0, -0.68, z - 0.11), 0.05, 0.013, M_m, parent=head)
    sphere((0, -0.67, z - 0.05), (0.04, 0.02, 0.025), mat("nose", (0.15, 0.1, 0.1), 0.4), parent=head)
    return root

# ---------------------------------------------------------------- bichos
def cute_eyes(loc_center, spread, size, parent=None):
    M_white = mat("eyewhite", (0.97, 0.97, 0.97), 0.25, 0.6)
    M_pupil = mat("pupil", (0.02, 0.02, 0.025), 0.2, 0.9)
    M_hi = mat("hi", (1, 1, 1), 0.1, 0, emit=2.0)
    x, y, z = loc_center
    for sx in (-1, 1):
        sphere((x + sx * spread, y, z), (size, size * 0.5, size * 1.15), M_white, parent=parent)
        sphere((x + sx * spread, y - size * 0.45, z - size * 0.05), (size * 0.62, size * 0.3, size * 0.75), M_pupil, parent=parent)
        sphere((x + sx * spread + size * 0.25, y - size * 0.75, z + size * 0.35), size * 0.2, M_hi, seg=12, parent=parent)

def smile(loc, w, parent=None):
    arc(loc, w, w * 0.22, mat("mouthdark", (0.35, 0.05, 0.08), 0.5, 0.3), parent=parent)

def quadruped(body_c, head_c, body=(0.55, 0.35, 0.33), head_r=0.4, neck=0.0, leg=0.35, legc=None):
    root = empty((0, 0, 0))
    bm = mat("b" + str(body_c), body_c, 0.6, 0.15, sss=0.05)
    hm = mat("h" + str(head_c), head_c, 0.6, 0.15, sss=0.05)
    lm = mat("l" + str(legc or body_c), legc or body_c, 0.6, 0.15)
    bz = leg + body[2] * 0.8
    sphere((0.15, 0.1, bz), body, bm, parent=root)
    for sx in (-0.2, 0.45):
        for sy in (-0.15, 0.3):
            cyl((sx, sy, leg / 2 + 0.03), 0.09, leg, lm, parent=root)
    hz = bz + body[2] * 0.6 + neck
    if neck > 0:
        cyl((-0.2, -0.05, bz + neck / 2 + 0.1), 0.12, neck + 0.2, bm, parent=root)
    sphere((-0.25, -0.15, hz), head_r, hm, parent=root)
    cute_eyes((-0.25, -0.15 - head_r * 0.85, hz + head_r * 0.12), head_r * 0.36, head_r * 0.22, parent=root)
    smile((-0.25, -0.15 - head_r * 0.95, hz - head_r * 0.35), head_r * 0.18, parent=root)
    return root, hz, hm, bm

def animal(name):
    if name == "lion":
        root, hz, hm, bm = quadruped((1, 0.65, 0.1), (1, 0.72, 0.2))
        mane = mat("mane", (0.85, 0.38, 0.08), 0.8, 0.1)
        for i in range(14):
            a = i / 14 * math.pi * 2
            sphere((-0.25 + math.cos(a) * 0.4, -0.02, hz + math.sin(a) * 0.4), 0.17, mane, parent=root)
        for sx in (-1, 1):
            sphere((-0.25 + sx * 0.3, -0.15, hz + 0.33), 0.1, hm, parent=root)
        sphere((-0.25, -0.53, hz - 0.08), (0.06, 0.04, 0.04), mat("nose", (0.15, 0.1, 0.1), 0.4), parent=root)
    elif name == "giraffe":
        root, hz, hm, bm = quadruped((1, 0.8, 0.35), (1, 0.82, 0.4), neck=1.0, leg=0.6, head_r=0.33)
        spot = mat("spot", (0.75, 0.42, 0.15), 0.7)
        random.seed(5)
        for i in range(10):
            sphere((0.15 + random.uniform(-0.4, 0.4), -0.18, 0.95 + random.uniform(-0.15, 0.2)), (0.1, 0.03, 0.08), spot, parent=root)
        for i in range(4):
            sphere((-0.2, -0.17, 1.3 + i * 0.22), (0.07, 0.03, 0.06), spot, parent=root)
        for sx in (-1, 1):
            cyl((-0.25 + sx * 0.12, -0.15, hz + 0.38), 0.03, 0.2, hm, parent=root)
            sphere((-0.25 + sx * 0.12, -0.15, hz + 0.49), 0.05, spot, parent=root)
    elif name == "capybara":
        root, hz, hm, bm = quadruped((0.6, 0.4, 0.25), (0.62, 0.42, 0.27), body=(0.6, 0.38, 0.36), leg=0.22, head_r=0.36)
        sphere((-0.25, -0.45, hz - 0.12), (0.22, 0.15, 0.16), hm, parent=root)
        for sx in (-1, 1):
            sphere((-0.25 + sx * 0.24, -0.1, hz + 0.3), 0.07, hm, parent=root)
    elif name == "monkey":
        root, hz, hm, bm = quadruped((0.5, 0.3, 0.17), (0.5, 0.3, 0.17), body=(0.35, 0.3, 0.42), leg=0.3, head_r=0.38)
        fm = mat("mface", (0.98, 0.8, 0.62), 0.6, 0.1)
        sphere((-0.25, -0.38, hz - 0.05), (0.27, 0.15, 0.25), fm, parent=root)
        for sx in (-1, 1):
            sphere((-0.25 + sx * 0.4, -0.12, hz + 0.05), (0.13, 0.06, 0.15), fm, parent=root)
        cute_eyes((-0.25, -0.53, hz + 0.08), 0.12, 0.08, parent=root)
        smile((-0.25, -0.55, hz - 0.15), 0.07, parent=root)
    elif name == "armadillo":
        root, hz, hm, bm = quadruped((0.6, 0.55, 0.5), (0.78, 0.66, 0.58), body=(0.55, 0.4, 0.32), leg=0.18, head_r=0.28)
        band = mat("band", (0.5, 0.45, 0.42), 0.6)
        for i in range(5):
            bpy.ops.mesh.primitive_torus_add(major_radius=0.36, minor_radius=0.03, location=(-0.1 + i * 0.13, 0.1, 0.46), rotation=(0, math.radians(90), 0))
            o = bpy.context.object; o.scale = (1, 1.1, 0.95); o.data.materials.append(band); smooth(o); setp(o, root)
        for sx in (-1, 1):
            sphere((-0.25 + sx * 0.12, -0.05, hz + 0.28), (0.06, 0.04, 0.12), bm, parent=root)
    elif name == "macaw":
        root = empty((0, 0, 0))
        red, blue, yel = mat("red", (0.95, 0.12, 0.1), 0.4, 0.5), mat("mblue", (0.1, 0.35, 1), 0.4, 0.5), mat("myel", (1, 0.8, 0.1), 0.4, 0.5)
        sphere((0, 0, 0.7), (0.3, 0.28, 0.42), red, parent=root)
        sphere((0, -0.05, 1.18), 0.3, red, parent=root)
        for sx in (-1, 1):
            sphere((sx * 0.3, 0.02, 0.72), (0.08, 0.2, 0.32), blue, parent=root)
            sphere((sx * 0.3, 0.0, 0.92), (0.07, 0.18, 0.12), yel, parent=root)
        cyl((0, 0.15, 0.25), 0.08, 0.6, blue, r2=0.02, rot=(math.radians(20), 0, 0), parent=root)
        sphere((0, -0.33, 1.1), (0.1, 0.12, 0.13), mat("beak", (0.95, 0.92, 0.85), 0.4), parent=root)
        sphere((0, -0.24, 1.22), (0.22, 0.1, 0.12), mat("wface", (1, 1, 1), 0.5), parent=root)
        cute_eyes((0, -0.3, 1.27), 0.11, 0.07, parent=root)
    elif name in ("bemtevi", "bird"):
        root = empty((0, 0, 0))
        brown, yel, blk, wht = mat("bbrown", (0.5, 0.33, 0.18), 0.6, 0.3), mat("byel", (1, 0.85, 0.1), 0.5, 0.3), mat("bblk", (0.05, 0.05, 0.05), 0.5, 0.3), mat("bwht", (1, 1, 1), 0.5, 0.3)
        sphere((0, 0, 0.6), (0.33, 0.3, 0.34), brown, parent=root)
        sphere((0, -0.12, 0.55), (0.28, 0.2, 0.27), yel, parent=root)
        sphere((0, -0.02, 1.0), 0.28, blk, parent=root)
        for sx in (-1, 1):
            sphere((sx * 0.15, -0.2, 1.05), (0.1, 0.06, 0.04), wht, parent=root)
            sphere((sx * 0.32, 0.05, 0.62), (0.08, 0.2, 0.22), brown, parent=root)
        sphere((0, -0.22, 0.86), (0.14, 0.06, 0.07), wht, parent=root)
        cyl((0, -0.34, 0.95), 0.05, 0.16, blk, r2=0.0, rot=(math.radians(90), 0, 0), parent=root)
        cute_eyes((0, -0.25, 1.02), 0.11, 0.055, parent=root)
        cyl((0, 0.32, 0.4), 0.09, 0.35, brown, r2=0.03, rot=(math.radians(-40), 0, 0), parent=root)
    elif name == "whale":
        root = empty((0, 0, 0))
        b, w = mat("whale", (0.25, 0.55, 0.95), 0.4, 0.5), mat("belly", (0.85, 0.93, 1), 0.5, 0.3)
        sphere((0, 0, 0.6), (0.75, 0.6, 0.55), b, parent=root)
        sphere((0, -0.2, 0.45), (0.6, 0.45, 0.35), w, parent=root)
        cyl((0.85, 0.2, 0.75), 0.2, 0.5, b, r2=0.05, rot=(0, math.radians(70), 0), parent=root)
        for sx in (-1, 1):
            sphere((0.95 + 0.0, 0.2 + sx * 0.18, 0.95), (0.08, 0.2, 0.06), b, parent=root)
        cute_eyes((-0.4, -0.5, 0.75), 0.18, 0.09, parent=root)
        smile((-0.4, -0.57, 0.52), 0.12, parent=root)
        drop = mat("spout", (0.6, 0.85, 1), 0.1, 0.5)
        for i, dx in enumerate((-0.1, 0, 0.1)):
            sphere((-0.15 + dx, -0.1, 1.25 + (0.1 if dx == 0 else 0)), 0.07, drop, parent=root)
    elif name == "fish":
        root = empty((0, 0, 0))
        o = mat("fish", (1, 0.5, 0.1), 0.35, 0.6)
        sphere((0, 0, 0.5), (0.4, 0.22, 0.32), o, parent=root)
        cyl((0.45, 0, 0.5), 0.25, 0.25, o, r2=0.02, rot=(0, math.radians(-90), 0), parent=root)
        wst = mat("stripe", (1, 1, 1), 0.4, 0.4)
        sphere((0.05, 0, 0.5), (0.06, 0.225, 0.3), wst, parent=root)
        cute_eyes((-0.22, -0.18, 0.58), 0.08, 0.06, parent=root)
        smile((-0.3, -0.2, 0.42), 0.05, parent=root)
    return root

# ---------------------------------------------------------------- objetos
def prop(name):
    root = empty((0, 0, 0))
    if name == "sun":
        y = mat("sunm", (1, 0.75, 0.0), 0.4, 0.3, emit=0.8)
        sphere((0, 0, 1), 0.6, y, parent=root)
        for i in range(12):
            a = i / 12 * 2 * math.pi
            cyl((math.cos(a) * 0.85, 0.05, 1 + math.sin(a) * 0.85), 0.11, 0.3, mat("ray", (1, 0.6, 0.1), 0.4, 0.3, emit=0.4), r2=0.0,
                rot=(0, -a + math.radians(90), 0), parent=root)
        cute_eyes((0, -0.52, 1.1), 0.18, 0.09, parent=root)
        smile((0, -0.58, 0.88), 0.13, parent=root)
        for sx in (-1, 1):
            sphere((sx * 0.33, -0.5, 0.92), (0.08, 0.03, 0.05), mat("cheek", (1.0, 0.45, 0.5), 0.6, 0.0), parent=root)
    elif name == "moon":
        m = mat("moonm", (1, 0.93, 0.6), 0.5, 0.3, emit=0.5)
        a = sphere((0, 0, 1), 0.6, m, parent=root)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.55, location=(0.35, -0.2, 1.15)); cut = bpy.context.object
        mod = a.modifiers.new("cut", "BOOLEAN"); mod.object = cut; mod.operation = "DIFFERENCE"
        bpy.context.view_layer.objects.active = a; bpy.ops.object.modifier_apply(modifier="cut"); bpy.data.objects.remove(cut)
        cute_eyes((-0.3, -0.5, 1.05), 0.0, 0.07, parent=root)
        smile((-0.33, -0.55, 0.86), 0.07, parent=root)
    elif name == "star":
        star_mesh((0, 0, 1), 0.6, mat("starm", (1, 0.85, 0.2), 0.35, 0.5, emit=0.8), depth=0.2, parent=root)
        cute_eyes((0, -0.12, 1.02), 0.12, 0.06, parent=root)
        smile((0, -0.14, 0.88), 0.07, parent=root)
    elif name == "cloud":
        w = mat("cloudm", (1, 1, 1), 0.9, 0.0, sss=0.2)
        for x, z, r in ((-0.5, 0.9, 0.35), (0, 1.05, 0.5), (0.5, 0.92, 0.38), (-0.2, 0.8, 0.35), (0.25, 0.8, 0.35)):
            sphere((x, 0, z), r, w, parent=root)
    elif name == "flower":
        cyl((0, 0, 0.4), 0.04, 0.8, mat("stem", (0.25, 0.7, 0.2), 0.6), parent=root)
        for sx in (-1, 1):
            sphere((sx * 0.15, 0, 0.35), (0.15, 0.03, 0.07), mat("leaf", (0.3, 0.8, 0.25), 0.6), parent=root)
        pm = mat("petal", (1, 0.35, 0.6), 0.5, 0.3)
        for i in range(8):
            a = i / 8 * 2 * math.pi
            sphere((math.cos(a) * 0.2, -0.02, 0.95 + math.sin(a) * 0.2), (0.13, 0.05, 0.13), pm, parent=root)
        sphere((0, -0.08, 0.95), (0.13, 0.08, 0.13), mat("fcenter", (1, 0.85, 0.15), 0.5, 0.3), parent=root)
        cute_eyes((0, -0.16, 0.98), 0.05, 0.03, parent=root)
    elif name == "tree":
        cyl((0, 0, 0.5), 0.15, 1.0, mat("trunk", (0.55, 0.33, 0.18), 0.7), r2=0.11, parent=root)
        g = mat("crown", (0.3, 0.78, 0.25), 0.6, 0.1)
        for x, z, r in ((0, 1.45, 0.55), (-0.4, 1.2, 0.4), (0.4, 1.2, 0.4), (0, 1.0, 0.4), (-0.2, 1.75, 0.35), (0.25, 1.7, 0.35)):
            sphere((x, 0, z), r, g, parent=root)
        fr = mat("fruit", (1, 0.2, 0.15), 0.3, 0.6)
        for x, z in ((-0.3, 1.3), (0.35, 1.45), (0.05, 1.15), (0.15, 1.75)):
            sphere((x, -0.45, z), 0.08, fr, parent=root)
    elif name == "heart":
        heart_mesh((0, 0, 1), 0.6, mat("heartm", (1, 0.15, 0.35), 0.3, 0.6), parent=root)
        cute_eyes((0, -0.25, 1.05), 0.14, 0.06, parent=root)
        smile((0, -0.25, 0.85), 0.08, parent=root)
    elif name == "sprout":
        cyl((0, 0, 0.1), 0.35, 0.2, mat("soil", (0.45, 0.28, 0.15), 0.9), parent=root)
        cyl((0, 0, 0.35), 0.03, 0.5, mat("stem", (0.25, 0.7, 0.2), 0.6), parent=root)
        for sx in (-1, 1):
            sphere((sx * 0.14, 0, 0.6), (0.15, 0.04, 0.07), mat("leaf", (0.3, 0.8, 0.25), 0.6), parent=root)
    elif name == "rainbow":
        cols = [(1, 0.2, 0.2), (1, 0.55, 0.1), (1, 0.9, 0.15), (0.3, 0.85, 0.3), (0.2, 0.55, 1), (0.6, 0.35, 0.95)]
        for i, c in enumerate(cols):
            arc((0, 0, 0), 1.6 - i * 0.12, 0.07, mat("rb%d" % i, c, 0.4, 0.3, emit=0.3), rot=(math.radians(90), 0, 0), keep="upper", parent=root)
    return root

# ---------------------------------------------------------------- cenarios
def hills(color, seed, amp=0.6, y0=4, depth=30, width=40, base=0):
    random.seed(seed)
    me = bpy.data.meshes.new("hill"); bm = bmesh.new()
    nx, ny = 80, 40
    ph = [random.uniform(0, 6) for _ in range(4)]
    grid = []
    for j in range(ny + 1):
        row = []
        for i in range(nx + 1):
            x = -width / 2 + width * i / nx; y = y0 + depth * j / ny
            z = base + amp * (math.sin(x * 0.25 + ph[0]) + 0.6 * math.sin(x * 0.55 + ph[1]) + 0.4 * math.sin(y * 0.3 + ph[2])) * min(1, (y - y0 + 1) / 4)
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for j in range(ny):
        for i in range(nx):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new("hill", me); bpy.context.collection.objects.link(o)
    o.data.materials.append(mat("hill%s" % seed, color, 0.85, 0.0)); smooth(o)
    return o

def sky(top, bottom, strength=1.0):
    s = bpy.context.scene
    w = bpy.data.worlds.new("sky"); s.world = w; w.use_nodes = True
    nt = w.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = tuple(bottom) + (1,)
    ramp.color_ramp.elements[1].position = 0.35; ramp.color_ramp.elements[1].color = tuple(top) + (1,)
    bg = nt.nodes["Background"]; bg.inputs[1].default_value = strength
    nt.links.new(tc.outputs["Generated"], sep.inputs[0]); nt.links.new(sep.outputs["Z"], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], bg.inputs[0])

def place(builder, name, loc, scale=1.0, rotz=0):
    r = builder(name); r.location = loc; r.scale = (scale,) * 3; r.rotation_euler = (0, 0, math.radians(rotz))
    return r

def bg_camera(sun_energy=2.4, sun_color=(1, 0.95, 0.85), sun_rot=(50, 0, -30)):
    s = bpy.context.scene
    s.render.resolution_x, s.render.resolution_y = (1152, 648) if PREVIEW else (2112, 1188)
    s.render.film_transparent = False
    bpy.ops.object.camera_add(location=(0, -9, 2.2), rotation=(math.radians(84), 0, 0))
    s.camera = bpy.context.object; s.camera.data.lens = 32
    bpy.ops.object.light_add(type="SUN", rotation=tuple(math.radians(a) for a in sun_rot))
    l = bpy.context.object; l.data.energy = sun_energy; l.data.color = sun_color; l.data.angle = math.radians(8)

def background(kind):
    if kind == "bg_meadow":
        sky((0.2, 0.55, 1.0), (0.7, 0.88, 1.0), 0.75)
        hills((0.3, 0.85, 0.2), 1, amp=0.25, y0=-6, base=-0.05)
        hills((0.3, 0.7, 0.28), 2, amp=1.2, y0=8, base=0)
        hills((0.4, 0.75, 0.5), 3, amp=2.2, y0=16, base=0.5)
        bg_camera()
        for x, y, s in ((-6, 6, 1.3), (6.5, 7, 1.5), (-9, 12, 1.8), (9, 13, 1.6), (-3, 14, 1.4)):
            place(prop, "tree", (x, y, 0.1), s, random.uniform(-20, 20))
        random.seed(11)
        for i in range(26):
            place(prop, "flower", (random.uniform(-9, 9), random.uniform(-2, 6), 0), random.uniform(0.25, 0.4), random.uniform(-40, 40))
        for x, z in ((-7, 6.5), (3, 7.5), (8, 6)):
            place(prop, "cloud", (x, 20, z), 2.2)
    elif kind == "bg_dark":
        sky((0.02, 0.02, 0.06), (0.06, 0.05, 0.15), 1.0)
        hills((0.05, 0.06, 0.12), 1, amp=0.3, y0=-6, base=-0.05)
        hills((0.04, 0.05, 0.1), 2, amp=1.5, y0=8)
        bg_camera(sun_energy=0.15, sun_color=(0.5, 0.6, 1))
    elif kind == "bg_sky":
        sky((0.15, 0.5, 1.0), (0.8, 0.92, 1.0), 1.1)
        bg_camera()
        random.seed(4)
        for i in range(9):
            place(prop, "cloud", (random.uniform(-12, 12), random.uniform(6, 22), random.uniform(0, 7)), random.uniform(1.2, 2.6))
    elif kind == "bg_landsea":
        sky((0.25, 0.6, 1.0), (0.8, 0.93, 1.0), 1.0)
        bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 20, -0.15))
        sea = bpy.context.object; sea.data.materials.append(mat("sea", (0.1, 0.55, 0.95), 0.15, 0.8))
        hills((0.9, 0.8, 0.55), 5, amp=0.15, y0=-6, depth=8, base=-0.05)
        hills((0.3, 0.85, 0.2), 6, amp=0.9, y0=1, depth=6, width=22, base=0.0)
        bg_camera()
        for x, y, s in ((-5, 4, 1.2), (5.5, 5, 1.3), (-2, 6, 0.9)):
            place(prop, "tree", (x, y, 0.3), s)
        for x in (-7, -3.5, 3, 7):
            place(prop, "sprout", (x, -1.5, 0), 0.6)
    elif kind == "bg_night":
        sky((0.05, 0.08, 0.3), (0.2, 0.2, 0.5), 1.0)
        hills((0.12, 0.3, 0.25), 1, amp=0.25, y0=-6, base=-0.05)
        hills((0.1, 0.22, 0.3), 2, amp=1.3, y0=8)
        bg_camera(sun_energy=0.7, sun_color=(0.6, 0.7, 1))
        random.seed(9)
        for i in range(30):
            star_mesh((random.uniform(-16, 16), 25, random.uniform(3, 12)), random.uniform(0.12, 0.3), mat("tw", (1, 0.9, 0.5), 0.3, 0, emit=4), depth=0.05)
        place(prop, "moon", (7, 22, 6), 2.2)
    elif kind == "bg_underwater":
        sky((0.0, 0.3, 0.6), (0.1, 0.6, 0.85), 1.2)
        hills((0.95, 0.85, 0.6), 3, amp=0.4, y0=-6, base=-0.05)
        bg_camera(sun_energy=2.0, sun_color=(0.6, 0.9, 1))
        random.seed(2)
        weed = mat("weed", (0.15, 0.7, 0.4), 0.6)
        for i in range(14):
            x = random.uniform(-10, 10); y = random.uniform(1, 10); h = random.uniform(1, 3)
            cyl((x, y, h / 2), 0.12, h, weed, r2=0.04)
        bub = mat("bub", (0.8, 0.95, 1), 0.05, 0.9)
        for i in range(25):
            sphere((random.uniform(-10, 10), random.uniform(2, 12), random.uniform(1, 8)), random.uniform(0.08, 0.2), bub, seg=16)
        coral = mat("coral", (1, 0.4, 0.5), 0.6)
        for i in range(8):
            sphere((random.uniform(-9, 9), random.uniform(0, 6), 0.2), random.uniform(0.3, 0.6), coral)
    elif kind == "bg_savanna":
        sky((0.35, 0.65, 1.0), (1.0, 0.9, 0.7), 1.0)
        hills((0.75, 0.8, 0.3), 4, amp=0.2, y0=-6, base=-0.05)
        hills((0.6, 0.72, 0.28), 7, amp=0.9, y0=10)
        bg_camera(sun_color=(1, 0.9, 0.75))
        for x, y, s in ((-8, 10, 1.6), (7, 12, 1.8), (2, 16, 1.4)):
            place(prop, "tree", (x, y, 0.1), s)
        place(prop, "sun", (-6, 25, 7), 2.2)
    elif kind == "bg_rainbow":
        sky((0.3, 0.62, 1.0), (0.85, 0.95, 1.0), 1.1)
        hills((0.4, 0.82, 0.32), 1, amp=0.25, y0=-6, base=-0.05)
        hills((0.35, 0.75, 0.3), 2, amp=1.2, y0=8)
        bg_camera()
        place(prop, "rainbow", (0, 18, 0), 7)
        random.seed(12)
        for i in range(20):
            place(prop, "flower", (random.uniform(-9, 9), random.uniform(-2, 6), 0), random.uniform(0.25, 0.4))
        for x, z in ((-8, 7), (8, 7.5)):
            place(prop, "cloud", (x, 20, z), 2.2)
    else:
        raise ValueError(kind)

# ---------------------------------------------------------------- lista de trabalho
JOBS = []
for k in ("lulu", "theo"):
    for p in POSES:
        for m in ("closed", "open"):
            JOBS.append(("%s_%s_%s" % (k, p, m), lambda k=k, p=p, m=m: (studio(), kid(k, p, m))))
for p in ("idle", "jump"):
    for m in ("closed", "open"):
        JOBS.append(("sheep_%s_%s" % (p, m), lambda p=p, m=m: (studio(target=(0, 0, 0.8), dist=5.5, res=(768, 768)), sheep(p, m))))
for a in ("lion", "giraffe", "capybara", "monkey", "armadillo", "macaw", "bemtevi", "whale", "fish"):
    tgt = {"giraffe": (0, 0, 1.4), "whale": (0, 0, 0.7)}.get(a, (0, 0, 0.8))
    JOBS.append(("animal_" + a, lambda a=a, tgt=tgt: (studio(target=tgt, dist=5.5 if a != "giraffe" else 7.5, res=(768, 768)), animal(a))))
for pr in ("sun", "moon", "star", "cloud", "flower", "tree", "heart", "sprout", "rainbow"):
    tgt = {"tree": (0, 0, 1.1), "rainbow": (0, 0, 0.9), "sprout": (0, 0, 0.4), "flower": (0, 0, 0.6)}.get(pr, (0, 0, 1))
    JOBS.append(("prop_" + pr, lambda pr=pr, tgt=tgt: (studio(target=tgt, dist=5.0 if pr != "rainbow" else 9, res=(768, 768), shadow=False), prop(pr))))
for bg in ("bg_meadow", "bg_dark", "bg_sky", "bg_landsea", "bg_night", "bg_underwater", "bg_savanna", "bg_rainbow"):
    JOBS.append((bg, lambda bg=bg: background(bg)))

if __name__ == "__main__":
    import time
    for name, fn in JOBS:
        if not wanted(name):
            continue
        t = time.time()
        reset(); _mats.clear()
        fn()
        if name.startswith("bg_"):
            bpy.context.scene.cycles.samples = 16 if PREVIEW else 64
        render(name)
        print("  %.1fs" % (time.time() - t), flush=True)
