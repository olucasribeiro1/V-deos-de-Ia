"""Crianca 3D humana cartunizada a partir da malha base do MakeHuman (CC0):
cabeca grande, olhos grandes, membros curtos e gordinhos, esqueleto nas articulacoes reais, boca que abre (shape key)."""
import bpy, bmesh, math, os
from mathutils import Vector, Matrix
import chars3d as C

BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "cache", "makehuman", "base.obj")
J = ["pelvis", "spine-3", "spine-1", "neck", "head", "l-shoulder", "l-elbow", "l-hand", "r-shoulder", "r-elbow", "r-hand",
     "l-upperleg", "l-knee", "l-ankle", "l-foot-1", "r-upperleg", "r-knee", "r-ankle", "r-foot-1", "l-eye", "r-eye", "head-2"]

def smoothstep(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)

STYLE = {
    "lulu": dict(skin=(0.96, 0.62, 0.46), hair=(0.25, 0.11, 0.05), iris=(0.38, 0.2, 0.07), top=(1.0, 0.32, 0.55), bottom=(1.0, 0.32, 0.55), shoe=(1.0, 0.8, 0.2), girl=True),
    "theo": dict(skin=(0.5, 0.3, 0.18), hair=(0.07, 0.04, 0.03), iris=(0.22, 0.12, 0.05), top=(0.1, 0.72, 0.55), bottom=(0.2, 0.42, 0.95), shoe=(1.0, 0.45, 0.2), girl=False),
}

def build(name, x=0.0, HS=2.3, height=1.0):
    st = STYLE[name]
    before = set(bpy.data.objects)
    bpy.ops.wm.obj_import(filepath=BASE, use_split_groups=True)
    new = [o for o in bpy.data.objects if o not in before]
    def get(prefix):
        c = [o for o in new if o.name.split(".")[0] == prefix]
        return max(c, key=lambda o: len(o.data.vertices)) if c else None
    def center(o): return o.matrix_world @ (sum((v.co for v in o.data.vertices), Vector()) / len(o.data.vertices))
    joints = {}
    for o in new:
        n = o.name.split(".")[0]
        if n.startswith("joint-"): joints[n[6:]] = center(o)
    body = get("body"); tights = get("helper-tights"); skirt = get("helper-skirt")
    tongue = get("helper-tongue"); upt = get("helper-upper-teeth"); lot = get("helper-lower-teeth")
    keep = [body, tights, tongue, upt, lot] + ([skirt] if st["girl"] else [])
    for o in new:
        if o not in keep: bpy.data.objects.remove(o, do_unlink=True)
    for o in keep:  # aplica transformacao (eixos ja Z-up)
        o.data.transform(o.matrix_world); o.matrix_world = Matrix.Identity(4)
    # ---------------- deformacao cartoon
    neck = joints["neck"]; head = joints["head"]; pelvis = joints["pelvis"]
    mouth_c = sum((v.co for v in tongue.data.vertices), Vector()) / len(tongue.data.vertices)
    feet_z = min(v.co.z for v in body.data.vertices)
    eyeZ = (joints["l-eye"].z + joints["r-eye"].z) / 2
    def deform(p):
        p = p.copy()
        for sd in (1, -1):  # bracos curtos e gordinhos
            sh = joints["l-shoulder" if sd > 0 else "r-shoulder"]
            if p.z > 0.5 and p.x * sd > 1.3:
                w = smoothstep(1.3, 1.85, p.x * sd)
                el = joints["l-hand" if sd > 0 else "r-hand"]
                axis = (el - sh).normalized(); rel = p - sh; along = rel.dot(axis); perp = rel - axis * along
                q = sh + axis * along * 0.66 + perp * 1.35
                p = p.lerp(q, w)
        if pelvis.z - 0.5 < p.z < neck.z:  # tronco mais curto e cheinho
            w = 1.0 - smoothstep(neck.z - 0.5, neck.z, p.z)
            p.x *= 1 + 0.2 * w; p.y = (p.y - pelvis.y) * (1 + 0.25 * w) + pelvis.y
        if p.z > pelvis.z:
            p.z = pelvis.z + (p.z - pelvis.z) * 0.82
        else:  # pernas curtas e gordinhas
            p.z = pelvis.z + (p.z - pelvis.z) * 0.5
            cx = 1.0 if p.x > 0 else -1.0
            p.x = cx * (abs(p.x) * 0.9) + (p.x - cx * abs(p.x) * 0.9) * 0 ; p.x *= 1.0
            p.y = (p.y - pelvis.y) * 1.3 + pelvis.y
        nz = pelvis.z + (neck.z - pelvis.z) * 0.82
        w = smoothstep(nz - 0.3, nz + 0.35, p.z)
        if w > 0:  # cabeca grande com rosto de bebe
            piv = Vector((0, neck.y, nz))
            q = piv + (p - piv) * HS
            ez = pelvis.z + (eyeZ - pelvis.z) * 0.82
            ezq = nz + (ez - nz) * HS
            q.x *= 1.16
            if q.z < ezq: q.z = ezq + (q.z - ezq) * 0.62          # rosto inferior curto (bebe)
            else:                                                   # cranio/testa grandes
                k2 = q.z - ezq; q.z = ezq + k2 * 1.3; q.x *= 1 + 0.12 * min(1, k2 / 1.5); q.y = q.y + (q.y - neck.y) * 0.12 * min(1, k2 / 1.5)
            p = p.lerp(q, w)
        return p
    for o in keep:
        for v in o.data.vertices: v.co = deform(v.co)
    J2 = {k: deform(v) for k, v in joints.items()}
    # regiao dos olhos maior (estilo desenho)
    for sd in ("l", "r"):
        ec = J2[sd + "-eye"]
        R = 0.95 * HS * sc0 if False else 1.6
        for v in body.data.vertices:
            d = Vector((v.co.x - ec.x, 0, v.co.z - ec.z)); dist = d.length
            if dist < R and v.co.y < ec.y + 0.8 and abs(v.co.x) > 0.02:
                f = (1 - dist / R) ** 1.5 * 0.25
                v.co.x += d.x * f; v.co.z += d.z * f
    mouth_c = deform(mouth_c)
    # normaliza altura e chao
    zmin = min(v.co.z for v in body.data.vertices); zmax = max(v.co.z for v in body.data.vertices)
    sc = height / (zmax - zmin)
    T = Matrix.Scale(sc, 4) @ Matrix.Translation((0, 0, -zmin))
    for o in keep: o.data.transform(T)
    J2 = {k: T @ v for k, v in J2.items()}; mouth_c = T @ mouth_c
    # ---------------- materiais
    skin = C.mat(name + "_mskin", st["skin"], 0.42, sss=0.08, sheen=0.15)
    body.data.materials.clear(); body.data.materials.append(skin)
    for o in keep: C.smooth(o)
    sub = body.modifiers.new("sub", "SUBSURF"); sub.levels = 1; sub.render_levels = 2
    top = C.mat(name + "_mtop", st["top"], 0.6, sheen=0.5); bot = C.mat(name + "_mbot", st["bottom"], 0.65, sheen=0.4)
    shoe = C.mat(name + "_mshoe", st["shoe"], 0.35, coat=0.6)
    tights.data.materials.clear(); tights.data.materials.append(top); tights.data.materials.append(bot); tights.data.materials.append(shoe)
    hip_z = J2["pelvis"].z + 0.02 * 1
    knee_z = J2["l-knee"].z; ank_z = J2["l-ankle"].z
    elbow_z = J2["l-elbow"].z
    bm = bmesh.new(); bm.from_mesh(tights.data)
    kill = []
    for f in bm.faces:
        c = f.calc_center_median()
        if c.z < ank_z + 0.015: f.material_index = 2
        elif c.z < hip_z + 0.01: f.material_index = 1
        # mangas curtas: remove antebraco; calca ate o joelho (bermuda) para menino; vestido: remove pernas
        if abs(c.x) > abs(J2["l-shoulder"].x) + 0.06 and c.z > hip_z: kill.append(f)
        if c.z < (knee_z + hip_z) / 2 and c.z > ank_z + 0.015: kill.append(f)
        if st["girl"] and ank_z + 0.015 < c.z < hip_z: kill.append(f)
        if c.z > J2["neck"].z - 0.02: kill.append(f)
    bmesh.ops.delete(bm, geom=list(set(kill)), context="FACES"); bm.to_mesh(tights.data); bm.free()
    so = tights.modifiers.new("solid", "SOLIDIFY"); so.thickness = 0.006; so.offset = 1
    sd2 = tights.modifiers.new("sub", "SUBSURF"); sd2.levels = 1; sd2.render_levels = 2
    if st["girl"]:
        skirt.data.materials.clear(); skirt.data.materials.append(top)
        for v in skirt.data.vertices:
            c = Vector((0, J2["pelvis"].y, v.co.z)); d = v.co - Vector((0, J2["pelvis"].y, v.co.z))
            v.co = c + d * (1.05 + 0.25 * max(0, (J2["pelvis"].z - v.co.z)) / 0.2)
        s2 = skirt.modifiers.new("solid", "SOLIDIFY"); s2.thickness = 0.008
        s3 = skirt.modifiers.new("sub", "SUBSURF"); s3.levels = 1
    teeth = C.mat("teeth", (0.97, 0.96, 0.92), 0.3, coat=0.5)
    for o in (upt, lot):
        o.data.materials.clear(); o.data.materials.append(teeth)
    tongue.data.materials.clear(); tongue.data.materials.append(C.mat("tongue", (1.0, 0.4, 0.45), 0.5))
    # interior escuro da boca
    inner = C.sphere(name + "_mouthin", (mouth_c.x, mouth_c.y + 0.012, mouth_c.z), (0.03, 0.02, 0.022), C.mat("mouth_in", (0.35, 0.05, 0.08), 0.7))
    # ---------------- olhos grandes
    ctrl = {"eyes": [], "lids": [], "brows": []}
    head_r = (J2["head-2"].z - J2["neck"].z) if "head-2" in J2 else 0.25
    eye_parts = []
    for sd in ("l", "r"):
        ec = J2[sd + "-eye"]
        er = abs(J2["l-eye"].x - J2["r-eye"].x) * 0.5 * 0.92
        e = C.sphere(name + "_eye" + sd, (ec.x * 1.08, ec.y + er * 0.15, ec.z), er, C.eye_mat(name + "_eyem", st["iris"]))
        e.scale = (1, 1, 1.1); ctrl["eyes"].append(e); eye_parts.append(e)
        hl = C.sphere(name + "_hl" + sd, (ec.x * 1.08 + er * 0.3, ec.y - er * 0.78, ec.z + er * 0.4), er * 0.17, C.mat("eye_hl", (1, 1, 1), emit=3.0), seg=16)
        eye_parts.append(hl)
        lid = C.half_sphere(name + "_lid" + sd, (ec.x * 1.08, ec.y + er * 0.15, ec.z), er * 1.06, skin, keep="top")
        lid.scale = (1.02, 1.02, 1.12); lid.rotation_euler = (math.radians(-100), 0, 0)
        ctrl["lids"].append(lid); eye_parts.append(lid)
        br = C.arc_mesh(name + "_brow" + sd, (ec.x * 1.08, ec.y - er * 0.2, ec.z + er * 1.45), er * 0.7, er * 0.1, C.mat("lash_dark", (0.05, 0.03, 0.03), 0.5), frac=0.45, rot=(math.radians(90), 0, 0))
        ctrl["brows"].append(br); eye_parts.append(br)
    # ---------------- cabelo (volume estilizado sobre o cranio)
    hc = J2["head"]; top_z = max(v.co.z for v in body.data.vertices)
    hairm = C.mat(name + "_mhair", st["hair"], 0.35, coat=0.3, sheen=0.25)
    R = (top_z - hc.z) * 1.0
    if st["girl"]:
        el = [(0, hc.y + 0.02, hc.z + R * 0.35, R * 1.32, 1.0, 0.95, 0.85), (0, hc.y - R * 0.75, hc.z + R * 0.72, R * 0.5, 1.9, 0.55, 0.42),
              (R * 0.95, hc.y + 0.02, hc.z + R * 0.6, R * 0.45, 1, 1, 1), (-R * 0.95, hc.y + 0.02, hc.z + R * 0.6, R * 0.45, 1, 1, 1),
              (0, hc.y + R * 0.45, hc.z - R * 0.2, R * 0.9, 1.15, 0.8, 1.0)]
    else:
        el = [(0, hc.y + 0.02, hc.z + R * 0.35, R * 1.28, 1.0, 0.95, 0.85)]
        import random; r = random.Random(4)
        for i in range(18):
            a = i / 18 * math.pi * 2
            el.append((math.cos(a) * R * 0.6, hc.y + math.sin(a) * R * 0.5, hc.z + R * 0.85 + r.uniform(-0.01, 0.01), R * 0.32, 1, 1, 1))
    hair = C.metaball(name + "_hairmb", el, hairm, res=0.006)
    eye_parts.append(hair)
    if st["girl"]:
        bowm = C.mat("bow", (1.0, 0.25, 0.55), 0.35, coat=0.4)
        for s in (1, -1):
            for d in (-1, 1):
                eye_parts.append(C.sphere(name + "_bow", (s * R * 0.95 + d * R * 0.18, hc.y, hc.z + R * 1.15), (R * 0.2, R * 0.09, R * 0.13), bowm))
    # ---------------- esqueleto pelas articulacoes reais
    arm_d = bpy.data.armatures.new(name + "_rig"); arm = bpy.data.objects.new(name + "_rig", arm_d)
    bpy.context.collection.objects.link(arm); bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT"); eb = arm_d.edit_bones
    def bone(n, h, t, p=None):
        b = eb.new(n); b.head = h; b.tail = t
        if p: b.parent = eb[p]
    bone("root", (0, 0, 0), (0, 0, 0.1))
    bone("hips", J2["pelvis"], J2["spine-3"], "root")
    bone("spine", J2["spine-3"], J2["neck"], "hips")
    bone("neck", J2["neck"], J2["head"], "spine")
    bone("head", J2["head"], J2["head"] + Vector((0, 0, 0.2)), "neck")
    for s, S in (("l", "L"), ("r", "R")):
        bone("upperarm." + S, J2[s + "-shoulder"], J2[s + "-elbow"], "spine")
        bone("forearm." + S, J2[s + "-elbow"], J2[s + "-hand"], "upperarm." + S)
        bone("hand." + S, J2[s + "-hand"], J2[s + "-hand"] + (J2[s + "-hand"] - J2[s + "-elbow"]).normalized() * 0.06, "forearm." + S)
        bone("thigh." + S, J2[s + "-upper-leg"], J2[s + "-knee"], "hips")
        bone("shin." + S, J2[s + "-knee"], J2[s + "-ankle"], "thigh." + S)
        bone("foot." + S, J2[s + "-ankle"], J2[s + "-foot-1"], "shin." + S)
    bpy.ops.object.mode_set(mode="OBJECT")
    for o in [body, tights] + ([skirt] if st["girl"] else []):
        for ob in bpy.context.view_layer.objects: ob.select_set(False)
        o.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
        bpy.ops.object.parent_set(type="ARMATURE_AUTO")
    # bochechas fofas e cantos da boca para cima (sorriso permanente suave)
    hr0 = (top_z - J2["neck"].z)
    for v in body.data.vertices:
        for sx in (1, -1):
            cc = Vector((sx * hr0 * 0.36, mouth_c.y - hr0 * 0.02, mouth_c.z + hr0 * 0.14))
            d = (v.co - cc).length
            if d < hr0 * 0.3 and v.co.y < mouth_c.y + hr0 * 0.15:
                f = (1 - d / (hr0 * 0.3)) ** 2
                v.co += Vector((sx * 0.25, -1.0, 0.2)).normalized() * hr0 * 0.07 * f
            mc = Vector((sx * hr0 * 0.15, mouth_c.y, mouth_c.z))
            d2 = (v.co - mc).length
            if d2 < hr0 * 0.12:
                v.co.z += hr0 * 0.035 * (1 - d2 / (hr0 * 0.12)) ** 2
    # boca: shape key 'abrir' (mandibula/labio inferior desce)
    body.shape_key_add(name="Basis"); sk = body.shape_key_add(name="open")
    hr = (top_z - J2["neck"].z)
    for i, v in enumerate(body.data.vertices):
        d = v.co - mouth_c
        if v.co.z < mouth_c.z + 0.003 and v.co.y < mouth_c.y + 0.06 and abs(d.x) < hr * 0.5 and v.co.z > mouth_c.z - hr * 0.6:
            f = (1 - min(1, abs(d.x) / (hr * 0.5))) * (1 - min(1, (mouth_c.z - v.co.z) / (hr * 0.6)) * 0.5)
            sk.data[i].co = v.co + Vector((0, 0.004 * f, -0.028 * f))
    ctrl["mouth_key"] = sk
    # rosto preso ao osso da cabeca
    bpy.context.view_layer.update()
    face = bpy.data.objects.new(name + "_face", None); bpy.context.collection.objects.link(face)
    face.parent = arm; face.parent_type = "BONE"; face.parent_bone = "head"
    bpy.context.view_layer.update(); face.matrix_world = Matrix.Translation(J2["head"]); bpy.context.view_layer.update()
    inv = face.matrix_world.inverted()
    for o in eye_parts + [inner, tongue, upt, lot]:
        o.parent = face; o.matrix_parent_inverse = inv
    ctrl["face"] = face; ctrl["mouth_inner"] = inner; ctrl["lower_teeth"] = lot; ctrl["tongue"] = tongue
    arm.location = (x, 0, 0)
    return {"arm": arm, "ctrl": ctrl, "name": name, "body": body}

def key_face(kid, frame, mouth=0.0, blink=0.0, brow=0.0, look=(0, 0)):
    c = kid["ctrl"]
    c["mouth_key"].value = mouth; c["mouth_key"].keyframe_insert("value", frame=frame)
    for o in (c["lower_teeth"], c["tongue"]):
        if "_z0" not in o: o["_z0"] = o.location.z
        o.location.z = o["_z0"] - 0.028 * mouth * 0.8; o.keyframe_insert("location", frame=frame)
    for lid in c["lids"]:
        lid.rotation_euler = (math.radians(-100 + 100 * blink), 0, 0); lid.keyframe_insert("rotation_euler", frame=frame)
    for br in c["brows"]:
        if "_z0" not in br: br["_z0"] = br.location.z
        br.location.z = br["_z0"] + 0.012 * brow; br.keyframe_insert("location", frame=frame)
    for e in c["eyes"]:
        e.rotation_euler = (math.radians(look[1] * 18), 0, math.radians(look[0] * 22)); e.keyframe_insert("rotation_euler", frame=frame)
