"""Personagens 3D originais (estilo desenho infantil 3D): corpo em malha unica (Skin + Subdivision),
esqueleto com pesos automaticos, rosto animavel (olhos com iris, palpebras, sobrancelhas, boca).
Uso dentro do Blender (bpy). build_kid(name) devolve dict com armature e controles do rosto."""
import bpy, bmesh, math
from mathutils import Vector, Matrix

def mat(name, color, rough=0.5, sss=0.0, sheen=0.0, coat=0.0, emit=0.0):
    if name in bpy.data.materials: return bpy.data.materials[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    if sss:
        b.inputs["Subsurface Weight"].default_value = sss
        b.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.2)
        b.inputs["Subsurface Scale"].default_value = 0.03
    if sheen: b.inputs["Sheen Weight"].default_value = sheen
    if coat: b.inputs["Coat Weight"].default_value = coat
    if emit:
        b.inputs["Emission Color"].default_value = (*color, 1); b.inputs["Emission Strength"].default_value = emit
    return m

def eye_mat(name, iris):
    """iris + pupila pintadas na esfera (olham para -Y do objeto)"""
    if name in bpy.data.materials: return bpy.data.materials[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.05; b.inputs["Coat Weight"].default_value = 1.0
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nrm = nt.nodes.new("ShaderNodeVectorMath"); nrm.operation = "NORMALIZE"
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    neg = nt.nodes.new("ShaderNodeMath"); neg.operation = "MULTIPLY"; neg.inputs[1].default_value = -1
    ramp = nt.nodes.new("ShaderNodeValToRGB"); cr = ramp.color_ramp; cr.interpolation = "EASE"
    cr.elements[0].position = 0.70; cr.elements[0].color = (0.97, 0.97, 0.97, 1)
    cr.elements[1].position = 0.74; cr.elements[1].color = (*[c * 0.55 for c in iris], 1)
    e = cr.elements.new(0.84); e.color = (*iris, 1)
    e = cr.elements.new(0.895); e.color = (*[min(1, c * 1.25) for c in iris], 1)
    e = cr.elements.new(0.905); e.color = (0.02, 0.015, 0.02, 1)
    nt.links.new(tc.outputs["Object"], nrm.inputs[0]); nt.links.new(nrm.outputs[0], sep.inputs[0])
    nt.links.new(sep.outputs["Y"], neg.inputs[0]); nt.links.new(neg.outputs[0], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], b.inputs["Base Color"])
    return m

def smooth(o):
    for p in o.data.polygons: p.use_smooth = True
    return o

def apply_mods(o):
    with bpy.context.temp_override(object=o, active_object=o, selected_objects=[o], selected_editable_objects=[o]):
        for md in list(o.modifiers):
            bpy.ops.object.modifier_apply(modifier=md.name)

def skin_mesh(name, verts, edges, radii, m, root=0, subdiv=3):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, edges, [])
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    o.modifiers.new("skin", "SKIN")
    sv = me.skin_vertices[0].data
    for i, r in enumerate(radii):
        sv[i].radius = r if isinstance(r, (tuple, list)) else (r, r)
        sv[i].use_root = (i == root)
    sd = o.modifiers.new("sub", "SUBSURF"); sd.levels = subdiv; sd.render_levels = subdiv
    apply_mods(o); smooth(o)
    o.data.materials.append(m)
    return o

def sphere(name, loc, scale, m, seg=48):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=1.0)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.transform(Matrix.Diagonal((*(scale if isinstance(scale, (tuple, list)) else (scale,) * 3), 1)))
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    o.location = loc; o.data.materials.append(m); smooth(o)
    return o

def half_sphere(name, loc, r, m, keep="top"):
    o = sphere(name, (0, 0, 0), r, m)
    bm = bmesh.new(); bm.from_mesh(o.data)
    kill = [v for v in bm.verts if (v.co.z < -1e-4 if keep == "top" else v.co.z > 1e-4)]
    bmesh.ops.delete(bm, geom=kill, context="VERTS"); bm.to_mesh(o.data); bm.free()
    o.location = loc
    return o

def arc_mesh(name, loc, major, minor, m, frac=0.5, rot=(0, 0, 0)):
    """arco (sobrancelha / sorriso) no plano XZ"""
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, segments=1, radius=1)  # placeholder
    bm.free()
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=40, minor_segments=10)
    o = bpy.context.object; o.name = name
    bm = bmesh.new(); bm.from_mesh(o.data)
    ang_lim = math.pi * frac
    kill = [v for v in bm.verts if abs(math.atan2(v.co.x, v.co.y)) > ang_lim / 2]
    bmesh.ops.delete(bm, geom=kill, context="VERTS"); bm.to_mesh(o.data); bm.free()
    o.rotation_euler = rot; o.location = loc
    o.data.materials.append(m); smooth(o)
    return o

def metaball(name, elems, m, res=0.012):
    mb = bpy.data.metaballs.new(name); mb.resolution = res; mb.render_resolution = res
    o = bpy.data.objects.new(name, mb); bpy.context.collection.objects.link(o)
    for (x, y, z, r, sx, sy, sz) in elems:
        e = mb.elements.new(); e.type = "ELLIPSOID"; e.co = (x, y, z); e.radius = r
        e.size_x, e.size_y, e.size_z = sx, sy, sz
    bpy.context.view_layer.update()
    with bpy.context.temp_override(object=o, active_object=o, selected_objects=[o], selected_editable_objects=[o]):
        bpy.ops.object.convert(target="MESH")
    o = bpy.context.view_layer.objects.get(name) or [x for x in bpy.data.objects if x.name.startswith(name)][-1]
    o.data.materials.clear(); o.data.materials.append(m); smooth(o)
    return o

# ---------------------------------------------------------------- definicoes
KIDS = {
    "lulu": dict(skin=(0.95, 0.58, 0.42), hair=(0.22, 0.1, 0.05), iris=(0.35, 0.18, 0.07),
                 top=(1.0, 0.35, 0.55), bottom=None, shoe=(1.0, 0.85, 0.25), sock=(1, 1, 1), girl=True),
    "theo": dict(skin=(0.55, 0.33, 0.2), hair=(0.06, 0.035, 0.025), iris=(0.25, 0.14, 0.06),
                 top=(0.15, 0.75, 0.6), bottom=(0.2, 0.45, 0.95), shoe=(1.0, 0.45, 0.2), sock=(1, 1, 1), girl=False),
}

def build_kid(name, x=0.0):
    k = KIDS[name]
    skin = mat(name + "_skin", k["skin"], 0.45, sss=0.06, sheen=0.1)
    top = mat(name + "_top", k["top"], 0.65, sheen=0.4)
    hairm = mat(name + "_hair", k["hair"], 0.35, coat=0.3, sheen=0.2)
    shoe = mat(name + "_shoe", k["shoe"], 0.35, coat=0.5)
    # ---------- esqueleto de pele (A-pose)
    P = {
        "pelvis": (0, 0, 0.36), "belly": (0, 0, 0.46), "chest": (0, 0, 0.56), "neck": (0, 0, 0.63),
        "hipL": (0.075, 0, 0.33), "kneeL": (0.08, 0, 0.19), "ankleL": (0.08, 0, 0.065), "toeL": (0.08, -0.075, 0.035),
        "shL": (0.135, 0, 0.575), "elL": (0.215, 0, 0.455), "wrL": (0.262, 0, 0.35), "haL": (0.282, -0.005, 0.3), "thL": (0.255, -0.04, 0.33),
    }
    for kk in list(P):
        if kk.endswith("L"):
            x0, y0, z0 = P[kk]; P[kk[:-1] + "R"] = (-x0, y0, z0)
    names = list(P); idx = {n: i for i, n in enumerate(names)}
    E = [("pelvis", "belly"), ("belly", "chest"), ("chest", "neck")]
    for s in "LR":
        E += [("pelvis", "hip" + s), ("hip" + s, "knee" + s), ("knee" + s, "ankle" + s), ("ankle" + s, "toe" + s),
              ("chest", "sh" + s), ("sh" + s, "el" + s), ("el" + s, "wr" + s), ("wr" + s, "ha" + s), ("wr" + s, "th" + s)]
    R = {"pelvis": (0.13, 0.115), "belly": (0.155, 0.14), "chest": (0.135, 0.12), "neck": (0.06, 0.06)}
    for s in "LR":
        R.update({"hip" + s: 0.068, "knee" + s: 0.058, "ankle" + s: 0.05, "toe" + s: 0.052, "sh" + s: 0.052, "el" + s: 0.043,
                  "wr" + s: 0.037, "ha" + s: 0.048, "th" + s: 0.02})
    body = skin_mesh(name + "_body", [P[n] for n in names], [(idx[a], idx[b]) for a, b in E], [R[n] for n in names], skin)
    parts = [body]
    # ---------- roupa pintada no proprio corpo (sem atravessar)
    body.data.materials.append(top)
    bot = mat(name + "_bottom", k["bottom"], 0.7, sheen=0.3) if k["bottom"] else None
    if bot: body.data.materials.append(bot)
    sockm = mat(name + "_sock", k["sock"], 0.8, sheen=0.3); body.data.materials.append(sockm)
    def seg_t(c, a, b):
        ab = b - a; t = max(0.0, min(1.0, (c - a).dot(ab) / ab.length_squared)); return t, (a + ab * t - c).length
    for f in body.data.polygons:
        c = f.center.copy()
        mi = 0
        if abs(c.x) < 0.2 and 0.3 < c.z < 0.62: mi = 1
        for sd in "LR":
            t, d = seg_t(c, Vector(P["sh" + sd]), Vector(P["el" + sd]))
            if t < 0.5 and d < 0.075: mi = 1
            t2, d2 = seg_t(c, Vector(P["hip" + sd]), Vector(P["knee" + sd]))
            if bot and t2 < 0.5 and d2 < 0.09: mi = 2
            t3, d3 = seg_t(c, Vector(P["knee" + sd]), Vector(P["ankle" + sd]))
            if t3 > 0.72 and d3 < 0.07: mi = 3 if bot else 2
        if bot and abs(c.x) < 0.2 and 0.3 < c.z <= 0.375: mi = 2
        f.material_index = mi
    if k["girl"]:
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=False, segments=48, radius1=0.25, radius2=0.15, depth=0.2)
        me = bpy.data.meshes.new(name + "_skirt"); bm.to_mesh(me); bm.free()
        sk = bpy.data.objects.new(name + "_skirt", me); bpy.context.collection.objects.link(sk)
        sk.location = (0, 0, 0.33); sk.data.materials.append(top)
        so = sk.modifiers.new("s", "SOLIDIFY"); so.thickness = 0.012
        sd = sk.modifiers.new("d", "SUBSURF"); sd.levels = 2; apply_mods(sk); smooth(sk); skirt = sk
    if False:
        bot = mat(name + "_bottom", k["bottom"], 0.7, sheen=0.3)
        sn = ["pelvis", "hipL", "kneeL", "hipR", "kneeR"]
        sP = {"pelvis": (0, 0, 0.37), "hipL": P["hipL"], "hipR": P["hipR"], "kneeL": tuple((Vector(P["hipL"]) * 0.45 + Vector(P["kneeL"]) * 0.55)),
              "kneeR": tuple((Vector(P["hipR"]) * 0.45 + Vector(P["kneeR"]) * 0.55))}
        si = {n: i for i, n in enumerate(sn)}
        sh = skin_mesh(name + "_shorts", [sP[n] for n in sn], [(si["pelvis"], si["hipL"]), (si["hipL"], si["kneeL"]), (si["pelvis"], si["hipR"]), (si["hipR"], si["kneeR"])],
                       [(0.142, 0.127), 0.08, 0.072, 0.08, 0.072], bot)
        parts.append(sh)
    for s in "LR":  # sapatos
        a = Vector(P["ankle" + s]); t = Vector(P["toe" + s])
        shoe_o = sphere(name + "_shoe" + s, tuple((a + t) / 2 + Vector((0, -0.01, -0.012))), (0.062, 0.095, 0.052), shoe)
        parts.append(shoe_o)
    skirt = locals().get("skirt")
    # ---------- armature
    arm_d = bpy.data.armatures.new(name + "_rig"); arm = bpy.data.objects.new(name + "_rig", arm_d)
    bpy.context.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")
    eb = arm_d.edit_bones
    def bone(n, h, t, parent=None):
        b = eb.new(n); b.head = h; b.tail = t
        if parent: b.parent = eb[parent]; b.use_connect = False
        return b
    bone("root", (0, 0, 0), (0, 0, 0.12))
    bone("hips", P["pelvis"], P["belly"], "root")
    bone("spine", P["belly"], P["chest"], "hips")
    bone("neck", P["chest"], P["neck"], "spine")
    bone("head", P["neck"], (0, 0, 1.15), "neck")
    for s in "LR":
        bone("thigh." + s, P["hip" + s], P["knee" + s], "hips")
        bone("shin." + s, P["knee" + s], P["ankle" + s], "thigh." + s)
        bone("foot." + s, P["ankle" + s], P["toe" + s], "shin." + s)
        bone("upperarm." + s, P["sh" + s], P["el" + s], "spine")
        bone("forearm." + s, P["el" + s], P["wr" + s], "upperarm." + s)
        bone("hand." + s, P["wr" + s], P["ha" + s], "forearm." + s)
    bpy.ops.object.mode_set(mode="OBJECT")
    # pesos automaticos
    for o in parts:
        for ob in bpy.context.view_layer.objects: ob.select_set(False)
        o.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
        bpy.ops.object.parent_set(type="ARMATURE_AUTO")
    if skirt is not None:
        bpy.context.view_layer.update(); mw = skirt.matrix_world.copy()
        skirt.parent = arm; skirt.parent_type = "BONE"; skirt.parent_bone = "hips"; bpy.context.view_layer.update(); skirt.matrix_world = mw
    # ---------- cabeca (rigida no osso head)
    head_parts = []
    HZ = 0.845
    head = sphere(name + "_head", (0, 0, HZ), (0.215, 0.195, 0.2), skin); head_parts.append(head)
    for sx in (-1, 1):
        head_parts.append(sphere(name + "_cheek", (sx * 0.1, -0.135, HZ - 0.065), (0.06, 0.05, 0.045), skin))
        head_parts.append(sphere(name + "_ear", (sx * 0.205, 0.01, HZ - 0.01), (0.035, 0.03, 0.05), skin))
    head_parts.append(sphere(name + "_nose", (0, -0.192, HZ - 0.035), (0.022, 0.016, 0.017), skin))
    lash = mat("lash_dark", (0.05, 0.03, 0.03), 0.5)
    ctrl = {"eyes": [], "lids": [], "brows": [], "mouth": None, "smile": None, "eye_hl": []}
    for sx in (-1, 1):
        ex, ey, ez = sx * 0.073, -0.155, HZ + 0.02
        eye = sphere(name + "_eye", (ex, ey, ez), 0.055, eye_mat(name + "_eye", k["iris"]))
        eye.scale = (1, 1, 1.12); head_parts.append(eye); ctrl["eyes"].append(eye)
        hl = sphere(name + "_hl", (ex + 0.014, ey - 0.052, ez + 0.022), 0.009, mat("eye_hl", (1, 1, 1), emit=3.0), seg=16)
        head_parts.append(hl); ctrl["eye_hl"].append(hl)
        lid = half_sphere(name + "_lid", (ex, ey, ez), 0.058, skin, keep="top"); lid.scale = (1.03, 1.03, 1.15)
        lid.rotation_euler = (math.radians(-100), 0, 0)  # aberto (para tras)
        head_parts.append(lid); ctrl["lids"].append(lid)
        br = arc_mesh(name + "_brow", (ex, ey - 0.01, ez + 0.085), 0.035, 0.007, lash, frac=0.45, rot=(math.radians(90), 0, 0))
        head_parts.append(br); ctrl["brows"].append(br)
        if k["girl"]:
            for i in range(2):
                l2 = sphere(name + "_lashes", (ex + sx * (0.045 + 0.008 * i), ey + 0.01, ez + 0.035 + 0.01 * i), (0.012, 0.006, 0.004), lash, seg=12)
                l2.rotation_euler = (0, sx * math.radians(30 + 15 * i), 0); head_parts.append(l2)
    mouth_m = mat("mouth_in", (0.45, 0.06, 0.1), 0.6)
    mouth = half_sphere(name + "_mouth", (0, -0.178, HZ - 0.085), 1.0, mouth_m, keep="bottom")
    mouth.scale = (0.045, 0.02, 0.006); head_parts.append(mouth); ctrl["mouth"] = mouth
    tongue = sphere(name + "_tongue", (0, -0.18, HZ - 0.098), (0.022, 0.012, 0.008), mat("tongue", (1.0, 0.4, 0.45), 0.5))
    tongue.parent = mouth; tongue.location = (0, -0.2, -0.55); tongue.scale = (0.5, 0.6, 1.4)
    # cabelo
    if k["girl"]:
        hair = metaball(name + "_hair", [(0, 0.06, HZ + 0.08, 0.31, 1.0, 0.92, 0.92), (0, -0.12, HZ + 0.17, 0.13, 1.6, 0.7, 0.5),
                                          (0.23, 0.05, HZ + 0.16, 0.13, 1, 1, 1), (-0.23, 0.05, HZ + 0.16, 0.13, 1, 1, 1),
                                          (0, 0.12, HZ - 0.02, 0.21, 1.15, 0.8, 1.0)], hairm)
        bowm = mat("bow", (1.0, 0.25, 0.55), 0.35, coat=0.4)
        for sx in (-1, 1):
            for d in (-1, 1):
                b = sphere(name + "_bow", (sx * 0.21 + d * 0.035, 0.0, HZ + 0.27), (0.04, 0.018, 0.026), bowm); head_parts.append(b)
            head_parts.append(sphere(name + "_bowc", (sx * 0.21, -0.01, HZ + 0.27), 0.016, bowm))
    else:
        el = [(0, 0.05, HZ + 0.07, 0.29, 1.0, 0.95, 0.88)]
        import random; r = random.Random(4)
        for i in range(16):
            a = i / 16 * math.pi * 2
            el.append((math.cos(a) * 0.14, 0.03 + math.sin(a) * 0.12, HZ + 0.18 + r.uniform(-0.02, 0.02), 0.065, 1, 1, 1))
        for x in (-0.09, -0.03, 0.03, 0.09):
            el.append((x, -0.14, HZ + 0.14, 0.055, 1, 1, 1))
        hair = metaball(name + "_hair", el, hairm, res=0.01)
    head_parts.append(hair)
    # remove casca de cabelo que cobre o rosto: nada (metaball fica atras/topo)
    bpy.context.view_layer.update()
    face = bpy.data.objects.new(name + "_face", None); bpy.context.collection.objects.link(face)
    face.parent = arm; face.parent_type = "BONE"; face.parent_bone = "head"
    bpy.context.view_layer.update(); face.matrix_world = Matrix.Translation((0, 0, HZ)); bpy.context.view_layer.update()
    inv = face.matrix_world.inverted()
    for o in head_parts:
        if o.parent is not None: continue
        o.parent = face; o.matrix_parent_inverse = inv
    ctrl["face"] = face
    bpy.context.view_layer.update()
    arm.location = (x, 0, 0)
    for o in parts:
        o.select_set(False)
    return {"arm": arm, "ctrl": ctrl, "name": name}

# ---------------------------------------------------------------- poses / animacao
def pose_bone(arm, bname, rot):
    pb = arm.pose.bones[bname]; pb.rotation_mode = "XYZ"; pb.rotation_euler = tuple(math.radians(a) for a in rot)
    return pb

def key_pose(kid, frame, pose):
    """pose: dict bone -> (rx, ry, rz) em graus; chaves especiais: 'loc' (root z), 'mouth' 0..1, 'blink' 0..1, 'brow' -1..1, 'look' (x,z)"""
    arm = kid["arm"]; c = kid["ctrl"]
    for bname, rot in pose.items():
        if bname in ("loc", "mouth", "blink", "brow", "look", "turn"): continue
        pb = pose_bone(arm, bname, rot); pb.keyframe_insert("rotation_euler", frame=frame)
    rb = arm.pose.bones["root"]
    rb.location = (0, 0, pose.get("loc", 0.0)) if True else rb.location
    rb.rotation_mode = "XYZ"; rb.rotation_euler = (0, 0, math.radians(pose.get("turn", 0.0)))
    rb.keyframe_insert("location", frame=frame); rb.keyframe_insert("rotation_euler", frame=frame)
    m = pose.get("mouth", 0.0)
    c["mouth"].scale = (0.045 - 0.008 * m, 0.02, 0.012 + 0.036 * m); c["mouth"].keyframe_insert("scale", frame=frame)
    bl = pose.get("blink", 0.0)
    for lid in c["lids"]:
        lid.rotation_euler = (math.radians(-100 + 100 * bl), 0, 0); lid.keyframe_insert("rotation_euler", frame=frame)
    bw = pose.get("brow", 0.0)
    for br in c["brows"]:
        if "_z0" not in br: br["_z0"] = br.location.z
        br.location.z = br["_z0"] + 0.015 * bw; br.keyframe_insert("location", frame=frame)
    lx, lz = pose.get("look", (0.0, 0.0))
    for e in c["eyes"]:
        e.rotation_euler = (math.radians(lz * 18), 0, math.radians(lx * 22)); e.keyframe_insert("rotation_euler", frame=frame)

# ---------------------------------------------------------------- poses de braco por direcao (espaco do personagem, frente = -Y)
ARM_POSES = {  # (dir_braco, dir_antebraco) para o braco L (+x); o R e espelhado
    "down":  ((0.3, 0.0, -1.0), (0.15, -0.15, -1.0)),
    "wave":  ((1.0, 0.0, 0.55), (0.15, -0.15, 1.0)),
    "up":    ((0.55, -0.1, 1.0), (0.35, -0.1, 1.0)),
    "point": ((0.25, -0.35, 1.0), (0.1, -0.2, 1.0)),
    "open":  ((1.0, -0.25, -0.05), (1.0, -0.4, 0.15)),
    "clap":  ((0.35, -0.8, -0.55), (-0.75, -0.6, 0.3)),
    "pray":  ((0.3, -0.7, -0.75), (-0.6, -0.55, 0.65)),
    "self":  ((0.45, -0.45, -0.75), (-0.85, -0.45, 0.35)),
    "hold":  ((0.75, -0.25, -0.6), (0.85, -0.25, -0.35)),
    "hip":   ((0.9, 0.1, -0.6), (-0.6, -0.1, -0.5)),
}
_qcache = {}
def arm_quats(arm, pose, side):
    """quaternions locais (upperarm, forearm) para a pose, calculados no repouso"""
    from mathutils import Quaternion
    key = (arm.name, pose, side)
    if key in _qcache: return _qcache[key]
    du, df = ARM_POSES[pose]
    sx = 1 if side == "L" else -1
    du = Vector((du[0] * sx, du[1], du[2])).normalized(); df = Vector((df[0] * sx, df[1], df[2])).normalized()
    bones = arm.data.bones
    out = []
    parent_posed = bones["spine"].matrix_local.to_3x3()
    for bn, target in (("upperarm." + side, du), ("forearm." + side, df)):
        b = bones[bn]; par = b.parent
        M_rp = parent_posed @ par.matrix_local.to_3x3().inverted() @ b.matrix_local.to_3x3()
        cur = (M_rp @ Vector((0, 1, 0))).normalized()
        qw = cur.rotation_difference(target)
        ql = (M_rp.inverted() @ qw.to_matrix() @ M_rp).to_quaternion()
        out.append(ql)
        parent_posed = M_rp @ ql.to_matrix()
    _qcache[key] = out
    return out
