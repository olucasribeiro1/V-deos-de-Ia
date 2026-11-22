"""Padrao visual v2 de personagens infantis 3D (substitui chars3d).
- Rosto esculpido (bochechas, queixo, nariz), olhos com cornea transparente, iris texturizada, pupila e brilho,
  palpebra com linha de cilios, sobrancelhas, labios, interior da boca, dentes e lingua.
- Cabelo em MECHAS (curvas com volume que afinam na ponta), nao uma massa unica.
- Maos com palma, 4 dedos e polegar.
- Roupas como pecas 3D separadas (gola, mangas com barra, saia rodada com barrado, estampa), sapatos com sola.
- Materiais PBR por parte (pele com variacao de tom, tecido com sheen e trama, cabelo brilhante, borracha).
Os controles de animacao (ossos, boca, palpebras, olhos, sobrancelhas) seguem o mesmo contrato do chars3d."""
import bpy, bmesh, math, random
from mathutils import Vector, Matrix, Euler
import chars3d as C

# ------------------------------------------------------------------ materiais
def _bsdf(m): return m.node_tree.nodes["Principled BSDF"]
def mat_skin(name, col):
    if name in bpy.data.materials: return bpy.data.materials[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = _bsdf(m)
    noise = nt.nodes.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 18; noise.inputs["Detail"].default_value = 3
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.inputs["Factor"].default_value = 0.12
    mix.inputs[6].default_value = (*col, 1); mix.inputs[7].default_value = (col[0] * 1.05, col[1] * 0.85, col[2] * 0.8, 1)
    nt.links.new(noise.outputs["Fac"], mix.inputs["Factor"]); nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.48; b.inputs["Subsurface Weight"].default_value = 0.12
    b.inputs["Subsurface Radius"].default_value = (1.0, 0.4, 0.25); b.inputs["Subsurface Scale"].default_value = 0.012
    b.inputs["Sheen Weight"].default_value = 0.15; b.inputs["Coat Weight"].default_value = 0.08
    return m

def mat_fabric(name, col, pattern=None, col2=(1, 1, 1), scale=40.0):
    """tecido: sheen + trama (bump) + estampa opcional ('dots' | 'stripes')"""
    if name in bpy.data.materials: return bpy.data.materials[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = _bsdf(m)
    b.inputs["Roughness"].default_value = 0.75; b.inputs["Sheen Weight"].default_value = 0.6; b.inputs["Sheen Roughness"].default_value = 0.4
    tc = nt.nodes.new("ShaderNodeTexCoord")
    wave = nt.nodes.new("ShaderNodeTexWave"); wave.inputs["Scale"].default_value = 400; wave.inputs["Distortion"].default_value = 1
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.08
    nt.links.new(tc.outputs["Object"], wave.inputs["Vector"]); nt.links.new(wave.outputs["Fac"], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    if pattern == "dots":
        vor = nt.nodes.new("ShaderNodeTexVoronoi"); vor.inputs["Scale"].default_value = scale; vor.feature = "F1"
        lt = nt.nodes.new("ShaderNodeMath"); lt.operation = "LESS_THAN"; lt.inputs[1].default_value = 0.22
        mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
        mix.inputs[6].default_value = (*col, 1); mix.inputs[7].default_value = (*col2, 1)
        nt.links.new(tc.outputs["Object"], vor.inputs["Vector"]); nt.links.new(vor.outputs["Distance"], lt.inputs[0])
        nt.links.new(lt.outputs[0], mix.inputs["Factor"]); nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    elif pattern == "stripes":
        wv = nt.nodes.new("ShaderNodeTexWave"); wv.wave_type = "BANDS"; wv.bands_direction = "Z"; wv.inputs["Scale"].default_value = scale * 0.25
        wv.inputs["Distortion"].default_value = 0
        lt = nt.nodes.new("ShaderNodeMath"); lt.operation = "GREATER_THAN"; lt.inputs[1].default_value = 0.6
        mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
        mix.inputs[6].default_value = (*col, 1); mix.inputs[7].default_value = (*col2, 1)
        nt.links.new(tc.outputs["Object"], wv.inputs["Vector"]); nt.links.new(wv.outputs["Fac"], lt.inputs[0])
        nt.links.new(lt.outputs[0], mix.inputs["Factor"]); nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    else:
        b.inputs["Base Color"].default_value = (*col, 1)
    return m

def mat_hair(name, col):
    if name in bpy.data.materials: return bpy.data.materials[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = _bsdf(m)
    b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Roughness"].default_value = 0.35
    b.inputs["Coat Weight"].default_value = 0.35; b.inputs["Coat Roughness"].default_value = 0.25
    b.inputs["Sheen Weight"].default_value = 0.3; b.inputs["Anisotropic"].default_value = 0.6 if "Anisotropic" in b.inputs else 0
    return m

def mat_glass(name):
    if name in bpy.data.materials: return bpy.data.materials[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; b = _bsdf(m)
    b.inputs["Transmission Weight"].default_value = 1.0; b.inputs["Roughness"].default_value = 0.0; b.inputs["IOR"].default_value = 1.34
    b.inputs["Base Color"].default_value = (1, 1, 1, 1)
    return m

def mat_iris(name, col, rscale=31.0):
    if name in bpy.data.materials: return bpy.data.materials[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = _bsdf(m)
    b.inputs["Roughness"].default_value = 0.3
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(tc.outputs["Object"], sep.inputs[0])
    # raio no plano XZ
    l = nt.nodes.new("ShaderNodeVectorMath"); l.operation = "LENGTH"
    comb = nt.nodes.new("ShaderNodeCombineXYZ"); nt.links.new(sep.outputs["X"], comb.inputs["X"]); nt.links.new(sep.outputs["Z"], comb.inputs["Z"])
    nt.links.new(comb.outputs[0], l.inputs[0])
    noise = nt.nodes.new("ShaderNodeTexWave"); noise.wave_type = "RINGS"; noise.rings_direction = "SPHERICAL"; noise.inputs["Scale"].default_value = 3
    noise.inputs["Distortion"].default_value = 8; nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB"); cr = ramp.color_ramp
    cr.elements[0].position = 0.0; cr.elements[0].color = (0.01, 0.01, 0.015, 1)
    # 0-0.40 pupila | 0.45-0.95 iris | borda escura
    cr.elements[1].position = 1.0; cr.elements[1].color = (*[c * 0.45 for c in col], 1)
    e = cr.elements.new(0.42); e.color = (0.01, 0.01, 0.015, 1)
    e = cr.elements.new(0.47); e.color = (*[min(1, c * 1.5) for c in col], 1)
    e = cr.elements.new(0.8); e.color = (*col, 1)
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = rscale
    nt.links.new(l.outputs["Value"], mul.inputs[0])
    nt.links.new(mul.outputs[0], ramp.inputs[0])
    mixn = nt.nodes.new("ShaderNodeMix"); mixn.data_type = "RGBA"; mixn.blend_type = "MULTIPLY"; mixn.inputs["Factor"].default_value = 0.35
    nt.links.new(ramp.outputs[0], mixn.inputs[6]); nt.links.new(noise.outputs["Color"], mixn.inputs[7])
    nt.links.new(mixn.outputs[2], b.inputs["Base Color"])
    return m

def M(name, col, rough=0.5, coat=0.0, emit=0.0, sheen=0.0): return C.mat(name, col, rough, coat=coat, emit=emit, sheen=sheen)

# ------------------------------------------------------------------ geometria utilitaria
def icosphere(name, loc, r, m, sub=4, scale=(1, 1, 1)):
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=1.0)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.transform(Matrix.Diagonal((r * scale[0], r * scale[1], r * scale[2], 1)))
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o); o.location = loc
    o.data.materials.append(m); C.smooth(o); return o

def capsule(name, a, b, r0, r1, m, seg=24):
    """tubo arredondado entre a e b (dedos, alcas)"""
    a, b = Vector(a), Vector(b); d = b - a; L = d.length
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r0, radius2=r1, depth=L)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    o.location = (a + b) / 2; o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    sd = o.modifiers.new("s", "SUBSURF"); sd.levels = 2; sd.render_levels = 2
    o.data.materials.append(m); C.smooth(o)
    bpy.context.view_layer.update()
    for p_, r_ in ((a, r0), (b, r1)):
        s = icosphere(name + "_cap", p_, r_, m, sub=3); s.parent = o; s.matrix_parent_inverse = o.matrix_world.inverted()
    return o

def lock(name, pts, r0, r1, m, res=5):
    """mecha de cabelo: curva com volume que afina na ponta"""
    cu = bpy.data.curves.new(name, "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = 1.0; cu.bevel_resolution = 3
    cu.use_fill_caps = True; cu.resolution_u = res
    sp = cu.splines.new("NURBS"); sp.points.add(len(pts) - 1); sp.use_endpoint_u = True; sp.order_u = 3
    n = len(pts)
    for i, p in enumerate(pts):
        sp.points[i].co = (*p, 1); sp.points[i].radius = r0 + (r1 - r0) * (i / (n - 1)) ** 1.3
    o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o); cu.materials.append(m)
    return o

def sph(c, R, theta, phi):
    """ponto na esfera (theta: 0 = topo; phi: 0 = frente -Y)"""
    return Vector((c.x + R * math.sin(theta) * math.sin(phi), c.y - R * math.sin(theta) * math.cos(phi), c.z + R * math.cos(theta)))

# ------------------------------------------------------------------ cabeca esculpida
def sculpt_head(name, c, R, skin):
    o = icosphere(name + "_head", (0, 0, 0), 1.0, skin, sub=6)
    for v in o.data.vertices:
        p = v.co.copy()
        x, y, z = p
        s = Vector((1.0, 0.94, 0.97))
        if z < 0:  # queixo mais estreito e curto (rosto de bebe)
            k = -z; s.x *= 1 - 0.1 * k * k; s.z *= 1 - 0.12 * k
        q = Vector((x * s.x, y * s.y, z * s.z))
        for sx in (-1, 1):  # bochechas
            cc = Vector((sx * 0.5, -0.72, -0.32)); d = (p - cc).length
            if d < 0.45: q += Vector((sx * 0.25, -1, 0.05)).normalized() * 0.07 * (1 - d / 0.45) ** 2
            ec = Vector((sx * 0.38, -0.85, 0.08)); d2 = (p - ec).length  # leve concavidade dos olhos
            if d2 < 0.3: q += Vector((0, 1, 0)) * 0.035 * (1 - d2 / 0.3) ** 2
        nc = Vector((0, -1, -0.22)); d3 = (p - nc).length  # nariz pequeno
        if d3 < 0.18: q += Vector((0, -1, 0.15)).normalized() * 0.08 * (1 - d3 / 0.18) ** 2
        v.co = q * R
    o.location = c
    return o

# ------------------------------------------------------------------ personagem
STYLE = {
    "lulu": dict(skin=(0.88, 0.56, 0.4), hair=(0.32, 0.13, 0.05), iris=(0.45, 0.25, 0.08), girl=True,
                 dress=(1.0, 0.18, 0.42), dress2=(1.0, 0.92, 0.95), collar=(1, 1, 1), sock=(1, 1, 1), shoe=(1.0, 0.75, 0.05), bow=(0.25, 0.55, 1.0)),
    "theo": dict(skin=(0.42, 0.24, 0.14), hair=(0.05, 0.03, 0.025), iris=(0.3, 0.17, 0.06), girl=False,
                 shirt=(0.15, 0.65, 1.0), shirt2=(1.0, 0.85, 0.1), shorts=(1.0, 0.45, 0.1), sock=(1, 1, 1), shoe=(0.95, 0.15, 0.15)),
}

def build(name, x=0.0):
    st = STYLE[name]
    skin = mat_skin(name + "_skin2", st["skin"])
    # corpo base (pele) reaproveitando o esqueleto de pele do chars3d, mas so pele
    kid = C.build_kid(name, 0.0)
    arm = kid["arm"]; body = bpy.data.objects[name + "_body"]
    for o in list(bpy.data.objects):  # remove rosto/cabelo/saia/sapatos antigos (serao refeitos no padrao v2)
        if o.name.startswith(name + "_") and o.name not in (name + "_body", name + "_rig"):
            bpy.data.objects.remove(o, do_unlink=True)
    body.data.materials.clear(); body.data.materials.append(skin)
    for f in body.data.polygons: f.material_index = 0
    P = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in arm.data.bones}
    head_parts = []; hand_parts = {"L": [], "R": []}; body_parts = []
    # ---------------- cabeca
    HC = Vector((0, 0, 0.845)); R = 0.205
    head = sculpt_head(name, HC, R, skin); head_parts.append(head)
    for sx in (-1, 1):
        ear = icosphere(name + "_ear", (sx * R * 0.97, 0.01, HC.z - 0.01), 1.0, skin, sub=4, scale=(0.028, 0.045, 0.055)); head_parts.append(ear)
        inner = icosphere(name + "_earin", (sx * R * 0.99, -0.005, HC.z - 0.01), 1.0, M("earin", (0.8, 0.4, 0.35), 0.6), sub=3, scale=(0.012, 0.028, 0.035)); head_parts.append(inner)
    # bochechas coradas (decalque suave)
    for sx in (-1, 1):
        bl = icosphere(name + "_blush", (sx * 0.112, -0.162, HC.z - 0.055), 1.0, M("blush", (1.0, 0.55, 0.55), 0.6), sub=3, scale=(0.032, 0.009, 0.019)); head_parts.append(bl)
    # olhos
    ctrl = {"eyes": [], "lids": [], "brows": []}
    sclera = M("sclera", (0.98, 0.97, 0.96), 0.25, coat=0.0)
    for sx in (-1, 1):
        ec = Vector((sx * 0.07, -0.142, HC.z + 0.02)); er = 0.052
        eye = icosphere(name + "_eye", ec, er, sclera, sub=4); eye.scale = (1, 1, 1.08)
        iris = icosphere(name + "_iris", (0, -er * 0.88, 0), 1.0, mat_iris(name + "_irism", st["iris"]), sub=4, scale=(er * 0.62, er * 0.18, er * 0.68))
        iris.parent = eye; iris.location = (0, -er * 0.86, 0)
        cornea = icosphere(name + "_cornea", (0, 0, 0), er * 1.03, mat_glass("cornea"), sub=4); cornea.parent = eye; cornea.location = (0, 0, 0)
        hl = icosphere(name + "_hl", (0, 0, 0), er * 0.14, M("eye_hl", (1, 1, 1), emit=4.0), sub=2); hl.parent = eye; hl.location = (er * 0.28, -er * 1.04, er * 0.34)
        hl2 = icosphere(name + "_hl2", (0, 0, 0), er * 0.06, M("eye_hl", (1, 1, 1), emit=4.0), sub=2); hl2.parent = eye; hl2.location = (-er * 0.22, -er * 1.02, -er * 0.25)
        ctrl["eyes"].append(eye); head_parts.append(eye)
        lid = C.half_sphere(name + "_lid", tuple(ec), er * 1.07, skin, keep="top"); lid.scale = (1.02, 1.02, 1.1)
        lid.rotation_euler = (math.radians(-118), 0, 0); ctrl["lids"].append(lid); head_parts.append(lid)
        # linha de cilios superior
        lash = C.arc_mesh(name + "_lashline", (ec.x, ec.y - er * 0.35, ec.z + er * 0.62), er * 0.78, er * 0.07, M("lash_dark", (0.05, 0.03, 0.03), 0.5), frac=0.55, rot=(math.radians(90), 0, 0))
        lash.scale = (1.0, 1.0, 0.7); head_parts.append(lash)
        if st["girl"]:
            for i in range(3):
                fl = capsule(name + "_flick", (ec.x + sx * er * (0.55 + 0.12 * i), ec.y - er * 0.5, ec.z + er * (0.55 - 0.18 * i)),
                             (ec.x + sx * er * (0.85 + 0.12 * i), ec.y - er * 0.55, ec.z + er * (0.75 - 0.2 * i)), er * 0.05, er * 0.015, M("lash_dark", (0.05, 0.03, 0.03), 0.5), seg=8)
                head_parts.append(fl)
        br = capsule(name + "_brow", (ec.x - sx * er * 0.55, ec.y - er * 0.25, ec.z + er * 1.55), (ec.x + sx * er * 0.7, ec.y - er * 0.1, ec.z + er * 1.5),
                     er * 0.1, er * 0.06, M(name + "_browm", tuple(c * 0.9 for c in st["hair"]), 0.6), seg=12)
        ctrl["brows"].append(br); head_parts.append(br)
    # boca: interior, labios, dentes, lingua (sorriso aberto)
    mc = Vector((0, -0.178, HC.z - 0.092))
    inner = C.half_sphere(name + "_mouthin", tuple(mc + Vector((0, 0.016, 0.006))), 1.0, M("mouth_in", (0.32, 0.04, 0.07), 0.7), keep="bottom")
    inner.data.transform(Matrix.Diagonal((0.036, 0.024, 0.03, 1)))  # tamanho gravado na malha (a animacao so escala relativo)
    head_parts.append(inner)
    lipm = M(name + "_lip", (st["skin"][0] * 0.95, st["skin"][1] * 0.55, st["skin"][2] * 0.55), 0.35, coat=0.2)
    lol = C.arc_mesh(name + "_liplo", (mc.x, mc.y + 0.004, mc.z + 0.03), 0.037, 0.0045, lipm, frac=0.52, rot=(math.radians(90), 0, 0))
    head_parts += [lol]
    teeth = M("teeth", (0.98, 0.97, 0.93), 0.25, coat=0.4)
    for sx in (-1, 1):
        t = icosphere(name + "_tooth", (sx * 0.0078, mc.y + 0.006, mc.z + 0.001), 1.0, teeth, sub=3, scale=(0.0072, 0.004, 0.0068)); head_parts.append(t)
    tongue = icosphere(name + "_tongue", (0, mc.y + 0.01, mc.z - 0.016), 1.0, M("tongue", (1.0, 0.38, 0.42), 0.45), sub=3, scale=(0.021, 0.012, 0.007)); head_parts.append(tongue)
    ctrl["mouth"] = inner; ctrl["tongue"] = tongue; ctrl["liplo"] = lol
    # ---------------- cabelo em mechas
    hairm = mat_hair(name + "_hair2", st["hair"]); rnd = random.Random(11 if st["girl"] else 5)
    HR = R * 1.04
    nlock = 0
    if st["girl"]:
        # cobertura do couro cabeludo (mechas do topo para tras/lados)
        for k in range(26):
            phi = math.radians(70 + k * (220 / 25))
            pts = [sph(HC + Vector((0, 0.01, 0.0)), HR * (1.0 + 0.04 * i / 5), math.radians(8 + i * 18), phi + math.radians(rnd.uniform(-4, 4))) for i in range(6)]
            lock(name + "_lock%d" % nlock, pts, 0.034, 0.012, hairm); nlock += 1
        # franja (mechas curvas na testa)
        for k in range(9):
            phi = math.radians(-58 + k * 14.5)
            pts = [sph(HC, HR * 1.03, math.radians(10), phi * 0.3), sph(HC, HR * 1.06, math.radians(32), phi), sph(HC, HR * 1.06, math.radians(50), phi * 1.05),
                   sph(HC, HR * 1.02, math.radians(60), phi * 1.15 + 0.1)]
            lock(name + "_lock%d" % nlock, pts, 0.03, 0.008, hairm); nlock += 1
        # maria-chiquinha: tufos cacheados dos dois lados
        for sx in (-1, 1):
            base = HC + Vector((sx * R * 0.92, 0.04, R * 0.55))
            for k in range(16):
                a = k / 16 * math.pi * 2
                d1 = Vector((sx * 0.6, math.cos(a) * 0.6, math.sin(a) * 0.6 + 0.2)).normalized()
                pts = [base, base + d1 * 0.05, base + d1 * 0.09 + Vector((sx * 0.03, 0, -0.02)), base + d1 * 0.1 + Vector((sx * 0.06, 0, -0.06)),
                       base + d1 * 0.08 + Vector((sx * 0.08, 0, -0.1))]
                lock(name + "_lock%d" % nlock, pts, 0.03, 0.01, hairm); nlock += 1
            # laco
            bowm = mat_fabric(name + "_bow", st["bow"])
            for d in (-1, 1):
                lp = icosphere(name + "_bowl", base + Vector((0, d * 0.035, 0.03)), 1.0, bowm, sub=4, scale=(0.018, 0.035, 0.022)); head_parts.append(lp)
            head_parts.append(icosphere(name + "_bowk", base + Vector((sx * 0.005, 0, 0.03)), 0.014, bowm, sub=3))
    else:
        # cabelo curto cacheado: muitas mechas curtas enroladas
        for k in range(70):
            th = math.radians(rnd.uniform(5, 75)); ph = rnd.uniform(-math.pi * 0.55, math.pi * 1.55)
            if th > math.radians(50) and -0.9 < ph < 0.9: th = math.radians(rnd.uniform(5, 45))
            p0 = sph(HC, HR * 0.99, th, ph); n = (p0 - HC).normalized()
            t1 = n.cross(Vector((0, 0, 1))).normalized() if abs(n.z) < 0.95 else Vector((1, 0, 0))
            pts = [p0, p0 + n * 0.022 + t1 * 0.012, p0 + n * 0.03 - t1 * 0.005, p0 + n * 0.02 - t1 * 0.018]
            lock(name + "_lock%d" % nlock, pts, 0.024, 0.012, hairm, res=4); nlock += 1
    locks = [o for o in bpy.data.objects if o.name.startswith(name + "_lock")]
    head_parts += locks
    # ---------------- maos com dedos
    for S in ("L", "R"):
        sx = 1 if S == "L" else -1
        wr = P["forearm." + S][1]; el = P["forearm." + S][0]
        d = (wr - el).normalized(); side = Vector((0, -1, 0)).cross(d).normalized() * -1 if S == "R" else Vector((0, -1, 0)).cross(d).normalized()
        fwd = Vector((0, -1, 0))
        palm_c = wr + d * 0.03
        palm = icosphere(name + "_palm", palm_c, 1.0, skin, sub=4, scale=(0.032, 0.022, 0.035)); palm.rotation_mode = "QUATERNION"
        palm.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d); hand_parts[S].append(palm)
        for i, off in enumerate((-0.016, -0.0055, 0.0055, 0.016)):
            base = palm_c + d * 0.025 + fwd * off
            L = 0.03 - abs(off) * 0.4
            f = capsule(name + "_finger", base, base + d * L + fwd * off * 0.15, 0.0072, 0.0062, skin, seg=12); hand_parts[S].append(f)
        tb = palm_c + fwd * 0.022 + d * 0.0
        th = capsule(name + "_thumb", tb, tb + (fwd * 0.6 + d * 0.8).normalized() * 0.024, 0.0085, 0.0068, skin, seg=12); hand_parts[S].append(th)
    # ---------------- roupas
    if st["girl"]:
        dm = mat_fabric(name + "_dress", st["dress"], "dots", st["dress2"], 90)
        bod = C.skin_mesh(name + "_bodice", [(0, 0, 0.37), (0, 0, 0.47), (0, 0, 0.56), (0, 0, 0.6)], [(0, 1), (1, 2), (2, 3)],
                          [(0.14, 0.125), (0.168, 0.15), (0.145, 0.13), (0.085, 0.075)], dm, subdiv=2); body_parts.append(bod)
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=False, segments=64, radius1=0.27, radius2=0.15, depth=0.2)
        for v in bm.verts:  # barra ondulada
            if v.co.z < -0.05:
                a = math.atan2(v.co.y, v.co.x); v.co.z += 0.012 * math.sin(a * 12)
        me = bpy.data.meshes.new(name + "_skirt2"); bm.to_mesh(me); bm.free()
        sk = bpy.data.objects.new(name + "_skirt2", me); bpy.context.collection.objects.link(sk); sk.location = (0, 0, 0.335); sk.data.materials.append(dm)
        so = sk.modifiers.new("s", "SOLIDIFY"); so.thickness = 0.01; sd = sk.modifiers.new("d", "SUBSURF"); sd.levels = 2; C.apply_mods(sk); C.smooth(sk); body_parts.append(sk)
        trim = M(name + "_trim", (1, 1, 1), 0.6, sheen=0.5)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.268, minor_radius=0.009, major_segments=64, location=(0, 0, 0.237)); tr = bpy.context.object; tr.data.materials.append(trim); C.smooth(tr); body_parts.append(tr)
        for sx in (-1, 1):  # gola bebe (duas abas)
            col_ = icosphere(name + "_collar", (sx * 0.045, -0.085, 0.585), 1.0, trim, sub=4, scale=(0.055, 0.03, 0.022)); body_parts.append(col_)
        heart = icosphere(name + "_btn", (0, -0.155, 0.5), 0.012, M("btn", (1.0, 0.85, 0.1), 0.3, coat=0.6), sub=3); body_parts.append(heart)
        sleevem = dm
    else:
        sm = mat_fabric(name + "_shirt", st["shirt"], "stripes", (1, 1, 1), 60)
        tee = C.skin_mesh(name + "_tee", [(0, 0, 0.37), (0, 0, 0.47), (0, 0, 0.56), (0, 0, 0.6)], [(0, 1), (1, 2), (2, 3)],
                          [(0.142, 0.128), (0.17, 0.152), (0.147, 0.132), (0.085, 0.075)], sm, subdiv=2); body_parts.append(tee)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.07, minor_radius=0.01, major_segments=48, location=(0, -0.0, 0.6)); cl = bpy.context.object
        cl.scale = (1, 0.95, 1); cl.data.materials.append(M(name + "_collar", st["shirt2"], 0.6, sheen=0.5)); C.smooth(cl); body_parts.append(cl)
        star = C.star_mesh((0, -0.165, 0.49), 0.045, M(name + "_print", st["shirt2"], 0.5), depth=0.006, rot=(math.radians(90), 0, 0)) if hasattr(C, "star_mesh") else None
        shm = mat_fabric(name + "_shorts", st["shorts"])
        sh = C.skin_mesh(name + "_shorts2", [(0, 0, 0.37), (0.075, 0, 0.32), (0.08, 0, 0.25), (-0.075, 0, 0.32), (-0.08, 0, 0.25)], [(0, 1), (1, 2), (0, 3), (3, 4)],
                         [(0.148, 0.132), 0.082, 0.078, 0.082, 0.078], shm, subdiv=2); body_parts.append(sh)
        sleevem = sm
    for S in ("L", "R"):  # mangas com barra
        a, b = P["upperarm." + S]
        mid = a + (b - a) * 0.45
        slv = capsule(name + "_sleeve", a + (b - a) * 0.05, mid, 0.066, 0.06, sleevem, seg=24); body_parts.append(slv)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.058, minor_radius=0.008, major_segments=40, location=mid); rg = bpy.context.object
        rg.rotation_mode = "QUATERNION"; rg.rotation_quaternion = Vector((0, 0, 1)).rotation_difference((b - a).normalized())
        rg.name = name + "_hem"; rg.data.materials.append(M(name + "_hem", (1, 1, 1) if st["girl"] else st["shirt2"], 0.6, sheen=0.5)); C.smooth(rg); body_parts.append(rg)
    # meias e sapatos
    sockm = mat_fabric(name + "_sock", st["sock"]); shoem = M(name + "_shoe2", st["shoe"], 0.3, coat=0.7); sole = M("sole", (0.97, 0.97, 0.95), 0.6)
    for S in ("L", "R"):
        an, to = P["foot." + S]
        bpy.ops.mesh.primitive_torus_add(major_radius=0.05, minor_radius=0.012, major_segments=40, location=an + Vector((0, 0, 0.035))); fr = bpy.context.object
        fr.data.materials.append(sockm); C.smooth(fr); body_parts.append(fr)
        c = (an + to) / 2 + Vector((0, -0.012, -0.008))
        up = icosphere(name + "_shoeup", c + Vector((0, 0, 0.008)), 1.0, shoem, sub=4, scale=(0.058, 0.09, 0.045)); body_parts.append(up)
        so_ = icosphere(name + "_sole", c + Vector((0, 0, -0.022)), 1.0, sole, sub=4, scale=(0.062, 0.095, 0.018)); body_parts.append(so_)
        strap = capsule(name + "_strap", c + Vector((-0.055, -0.02, 0.03)), c + Vector((0.055, -0.02, 0.03)), 0.008, 0.008, shoem if not st["girl"] else M("strap", (1.0, 0.2, 0.4), 0.3, coat=0.6), seg=10)
        body_parts.append(strap)
    # ---------------- parentesco no esqueleto
    bpy.context.view_layer.update()
    def bone_pivot(bname, at):
        e = bpy.data.objects.new(name + "_piv_" + bname, None); bpy.context.collection.objects.link(e)
        e.parent = arm; e.parent_type = "BONE"; e.parent_bone = bname
        bpy.context.view_layer.update(); e.matrix_world = Matrix.Translation(at); bpy.context.view_layer.update()
        return e
    face = bone_pivot("head", HC); inv = face.matrix_world.inverted()
    for o in head_parts:
        if o.parent is None: o.parent = face; o.matrix_parent_inverse = inv
    ctrl["face"] = face
    for S in ("L", "R"):
        hp = bone_pivot("hand." + S, P["hand." + S][0]); inv2 = hp.matrix_world.inverted()
        for o in hand_parts[S]:
            if o.parent is None: o.parent = hp; o.matrix_parent_inverse = inv2
    for o in body_parts:
        if o is None: continue
        if o.name.startswith(name + "_shoeup") or o.name.startswith(name + "_sole") or o.name.startswith(name + "_strap"):
            S = "L" if o.location.x > 0 else "R"; fp = bone_pivot("foot." + S, P["foot." + S][0]); o.parent = fp; o.matrix_parent_inverse = fp.matrix_world.inverted(); continue
        if "_sleeve" in o.name or o.name.startswith(name + "_hem") or "Torus" in o.name and o.location.z > 0.4 and abs(o.location.x) > 0.1:
            S = "L" if o.location.x > 0 else "R"; bp_ = bone_pivot("upperarm." + S, P["upperarm." + S][0])
            o.parent = bp_; o.matrix_parent_inverse = bp_.matrix_world.inverted(); continue
        if o.location.z < 0.15 and abs(o.location.x) > 0.03:  # babadinho das meias
            S = "L" if o.location.x > 0 else "R"; bp_ = bone_pivot("shin." + S, P["shin." + S][0])
            o.parent = bp_; o.matrix_parent_inverse = bp_.matrix_world.inverted(); continue
        hp_ = bone_pivot("hips", P["hips"][0]) if o.location.z < 0.42 else bone_pivot("spine", P["spine"][0])
        o.parent = hp_; o.matrix_parent_inverse = hp_.matrix_world.inverted()
    arm.location = (x, 0, 0)
    kid["ctrl"] = ctrl
    return kid

def key_face(kid, frame, mouth=0.0, blink=0.0, brow=0.0, look=(0, 0)):
    c = kid["ctrl"]
    for o, base in ((c["mouth"], (0.034, 0.02, 0.02)),):
        o.scale = (1 - 0.15 * mouth, 1, 0.6 + 1.2 * mouth); o.keyframe_insert("scale", frame=frame)
    for o in (c["tongue"], c["liplo"]):
        if "_z0" not in o: o["_z0"] = o.location.z
        o.location.z = o["_z0"] - 0.016 * mouth; o.keyframe_insert("location", frame=frame)
    for lid in c["lids"]:
        lid.rotation_euler = (math.radians(-118 + 118 * blink), 0, 0); lid.keyframe_insert("rotation_euler", frame=frame)
    for br in c["brows"]:
        if "_z0" not in br: br["_z0"] = br.location.z
        br.location.z = br["_z0"] + 0.012 * brow; br.keyframe_insert("location", frame=frame)
    for e in c["eyes"]:
        e.rotation_euler = (math.radians(look[1] * 15), 0, math.radians(look[0] * 20)); e.keyframe_insert("rotation_euler", frame=frame)
