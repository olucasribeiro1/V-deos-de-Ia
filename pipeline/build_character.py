"""Constroi a personagem BIA (ativo permanente) -> assets/characters/bia.blend

Uso:  python pipeline/build_character.py

Principios tecnicos (o que corrige o aspecto 'massinha/bolinhas'):
  * Corpo, bracos e pernas sao UMA malha continua gerada por Skin modifier a
    partir de um esqueleto de vertices, depois aplicada e subdividida (quads).
  * Cabeca parte de uma esfera de QUADS (sem polos) deformada por funcoes
    anatomicas: bochechas, mandibula, cranio, nariz, cavidade dos olhos.
  * Olhos sao globos separados (como em producao profissional) com shader em
    camadas (esclera, iris com gradiente, pupila, brilho) e palpebras reais.
  * Maos com palma + 5 dedos com articulacoes, pesos rigidos por dedo.
  * Roupas sao cascas proprias (com espessura) que herdam pesos do corpo.
  * Rig humanoide (armature) com pesos automaticos (bone heat).
"""
import math
import os
import sys

import bpy  # noqa: E402  (bpy precisa ser importado antes de bmesh)
import bmesh
import bpy
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
from common import *  # noqa

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'characters', 'bia.blend')
C = 'BIA'

# ------------------------------------------------------------ paleta BIA
PAL = {
    'skin': '#C98B60', 'skin_blush': '#E5786E', 'lip': '#7A2630',
    'mouth': '#4A1218', 'tongue': '#E5707A', 'teeth': '#FFF8F0',
    'hair': '#3A2216', 'hair_hi': '#5A3826',
    'iris_in': '#B07A3E', 'iris_out': '#5A3315', 'pupil': '#120A06', 'sclera': '#FBF8F4',
    'brow': '#3A2216', 'lash': '#1E120C',
    'shirt': '#FFC52E', 'star': '#FFFFFF', 'shorts': '#3F86C6',
    'shoe': '#FF5E8E', 'sole': '#FFFFFF', 'sock': '#FFFFFF', 'tie': '#FF5E8E',
}

H = Vector((0.0, 0.0, 0.935))          # centro da cabeca
HR = Vector((0.200, 0.186, 0.190))     # raios da cabeca (x largura, y prof., z altura)


# ============================================================ materiais
def make_materials():
    m = {}
    skin = principled('BIA_skin', srgb(PAL['skin']), rough=0.48, sss=0.22,
                      sss_radius=(1.0, 0.35, 0.2), spec=0.35)
    m['skin'] = skin
    m['hair'] = principled('BIA_hair', srgb(PAL['hair']), rough=0.42, spec=0.45, sheen=0.25)
    m['brow'] = principled('BIA_brow', srgb(PAL['brow']), rough=0.6)
    m['lash'] = principled('BIA_lash', srgb(PAL['lash']), rough=0.5)
    m['mouth'] = principled('BIA_mouth', srgb(PAL['mouth']), rough=0.55)
    m['tongue'] = principled('BIA_tongue', srgb(PAL['tongue']), rough=0.35, sss=0.2)
    m['teeth'] = principled('BIA_teeth', srgb(PAL['teeth']), rough=0.25)
    m['shirt'] = principled('BIA_shirt', srgb(PAL['shirt']), rough=0.75, sheen=0.4, spec=0.3)
    m['star'] = principled('BIA_star', srgb(PAL['star']), rough=0.7, sheen=0.3)
    m['shorts'] = principled('BIA_shorts', srgb(PAL['shorts']), rough=0.8, sheen=0.3, spec=0.3)
    m['shoe'] = principled('BIA_shoe', srgb(PAL['shoe']), rough=0.45, coat=0.25, coat_rough=0.3)
    m['sole'] = principled('BIA_sole', srgb(PAL['sole']), rough=0.55)
    m['sock'] = principled('BIA_sock', srgb(PAL['sock']), rough=0.85, sheen=0.4)
    m['tie'] = principled('BIA_tie', srgb(PAL['tie']), rough=0.4, coat=0.4)
    # tecido: microvariacao de cor + relevo fino (evita o look 'plastico')
    for k, amt in (('shirt', 0.06), ('shorts', 0.10)):
        base = srgb(PAL[k])
        darker = tuple(c * 0.88 for c in base[:3]) + (1,)
        add_noise_color(m[k], darker, base, scale=60, detail=6, bump=amt, bump_scale=400)
    return m


def hair_material(mat):
    """Cabelo estilizado: mechas (wave bands) + brilho anisotropico suave."""
    nodes, links = nodes_of(mat)
    bsdf = nodes['Principled BSDF']
    tc = nodes.new('ShaderNodeTexCoord')
    wave = nodes.new('ShaderNodeTexWave')
    wave.wave_type = 'BANDS'
    wave.bands_direction = 'X'
    wave.inputs['Scale'].default_value = 9.0
    wave.inputs['Distortion'].default_value = 6.0
    wave.inputs['Detail'].default_value = 2.0
    links.new(tc.outputs['Object'], wave.inputs['Vector'])
    ramp = nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = srgb(PAL['hair'])
    ramp.color_ramp.elements[1].color = srgb(PAL['hair_hi'])
    links.new(wave.outputs['Fac'], ramp.inputs['Fac'])
    links.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.25
    links.new(wave.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    bsdf.inputs['Anisotropic'].default_value = 0.5


def eye_material(radius):
    """Olho em camadas, coordenadas do proprio globo (eixo -Y = frente)."""
    mat = bpy.data.materials.new('BIA_eye')
    mat.use_nodes = True
    nodes, links = nodes_of(mat)
    bsdf = nodes['Principled BSDF']
    bsdf.inputs['Roughness'].default_value = 0.35
    bsdf.inputs['Coat Weight'].default_value = 1.0
    bsdf.inputs['Coat Roughness'].default_value = 0.02
    bsdf.inputs['Coat IOR'].default_value = 1.45
    tc = nodes.new('ShaderNodeTexCoord')
    sep = nodes.new('ShaderNodeSeparateXYZ')
    links.new(tc.outputs['Object'], sep.inputs['Vector'])
    # r = distancia radial em XZ, normalizada pelo raio do globo
    comb = nodes.new('ShaderNodeCombineXYZ')
    links.new(sep.outputs['X'], comb.inputs['X'])
    links.new(sep.outputs['Z'], comb.inputs['Y'])
    vl = nodes.new('ShaderNodeVectorMath'); vl.operation = 'LENGTH'
    links.new(comb.outputs['Vector'], vl.inputs[0])
    div = nodes.new('ShaderNodeMath'); div.operation = 'DIVIDE'
    div.inputs[1].default_value = radius
    links.new(vl.outputs['Value'], div.inputs[0])
    # hemisferio traseiro vira esclera (r forcado a 1)
    back = nodes.new('ShaderNodeMath'); back.operation = 'GREATER_THAN'
    back.inputs[1].default_value = 0.0
    links.new(sep.outputs['Y'], back.inputs[0])
    mx = nodes.new('ShaderNodeMath'); mx.operation = 'MAXIMUM'
    links.new(div.outputs['Value'], mx.inputs[0])
    links.new(back.outputs['Value'], mx.inputs[1])
    ramp = nodes.new('ShaderNodeValToRGB')
    cr = ramp.color_ramp
    cr.interpolation = 'LINEAR'
    stops = [(0.0, PAL['pupil']), (0.255, PAL['pupil']), (0.29, PAL['iris_in']),
             (0.50, PAL['iris_in']), (0.60, PAL['iris_out']), (0.635, '#2A160A'),
             (0.665, PAL['sclera']), (1.0, PAL['sclera'])]
    cr.elements[0].position, cr.elements[0].color = stops[0][0], srgb(stops[0][1])
    cr.elements[1].position, cr.elements[1].color = stops[-1][0], srgb(stops[-1][1])
    for pos, col in stops[1:-1]:
        e = cr.elements.new(pos)
        e.color = srgb(col)
    links.new(mx.outputs['Value'], ramp.inputs['Fac'])
    links.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    # brilho principal (catchlight) - fixo no espaco do olho => consistente
    def spot(cx, cz, rad, strength):
        cmb = nodes.new('ShaderNodeCombineXYZ')
        cmb.inputs['X'].default_value = cx * radius
        cmb.inputs['Z'].default_value = cz * radius
        cmb.inputs['Y'].default_value = -radius
        d = nodes.new('ShaderNodeVectorMath'); d.operation = 'DISTANCE'
        links.new(tc.outputs['Object'], d.inputs[0])
        links.new(cmb.outputs['Vector'], d.inputs[1])
        mr = nodes.new('ShaderNodeMapRange')
        mr.inputs['From Min'].default_value = rad * radius * 0.75
        mr.inputs['From Max'].default_value = rad * radius
        mr.inputs['To Min'].default_value = strength
        mr.inputs['To Max'].default_value = 0.0
        links.new(d.outputs['Value'], mr.inputs['Value'])
        return mr
    s1 = spot(-0.28, 0.30, 0.16, 6.0)
    s2 = spot(0.22, -0.20, 0.07, 3.0)
    add = nodes.new('ShaderNodeMath'); add.operation = 'ADD'
    links.new(s1.outputs['Result'], add.inputs[0])
    links.new(s2.outputs['Result'], add.inputs[1])
    bsdf.inputs['Emission Color'].default_value = (1, 1, 1, 1)
    links.new(add.outputs['Value'], bsdf.inputs['Emission Strength'])
    return mat


def blush(skin_mat, empties):
    """Bochechas rosadas procedurais, ancoradas em empties presos a cabeca."""
    nodes, links = nodes_of(skin_mat)
    bsdf = nodes['Principled BSDF']
    acc = None
    for e in empties:
        tc = nodes.new('ShaderNodeTexCoord'); tc.object = e
        ln = nodes.new('ShaderNodeVectorMath'); ln.operation = 'LENGTH'
        links.new(tc.outputs['Object'], ln.inputs[0])
        mr = nodes.new('ShaderNodeMapRange')
        mr.inputs['From Min'].default_value = 0.0
        mr.inputs['From Max'].default_value = 0.042
        mr.inputs['To Min'].default_value = 0.55
        mr.inputs['To Max'].default_value = 0.0
        mr.interpolation_type = 'SMOOTHSTEP'
        links.new(ln.outputs['Value'], mr.inputs['Value'])
        if acc is None:
            acc = mr.outputs['Result']
        else:
            mx = nodes.new('ShaderNodeMath'); mx.operation = 'MAXIMUM'
            links.new(acc, mx.inputs[0]); links.new(mr.outputs['Result'], mx.inputs[1])
            acc = mx.outputs['Value']
    mix = nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
    mix.inputs['A'].default_value = srgb(PAL['skin'])
    mix.inputs['B'].default_value = srgb(PAL['skin_blush'])
    links.new(acc, mix.inputs['Factor'])
    links.new(mix.outputs['Result'], bsdf.inputs['Base Color'])


# ============================================================== cabeca
def head_shape(p):
    """p: ponto na esfera unitaria. Retorna ponto deformado (sem escala)."""
    x, y, z = p.x, p.y, p.z
    front = max(0.0, -y)
    # bochechas fofas (parte baixa/lateral do rosto)
    x *= 1.0 + 0.10 * gauss(z + 0.32, 0.26) * (0.55 + 0.45 * front)
    # mandibula/queixo pequeno e arredondado
    if z < -0.25:
        t = (-z - 0.25) / 0.75
        x *= 1.0 - 0.20 * t * t
        y *= 1.0 - 0.10 * t * (1 if y > 0 else 0.4)
    # cranio volumoso atras e em cima (proporcao infantil)
    if y > 0:
        y *= 1.0 + 0.07 * y * max(0.0, z + 0.3)
    if z > 0:
        x *= 1.0 + 0.03 * z
    # plano facial levemente achatado (evita 'cara de bola')
    y = y * (1.0 - 0.07 * front * gauss(z + 0.05, 0.45))
    return Vector((x, y, z))


def bump_dir(p, center, amp, sigma):
    d = (p.normalized() - center.normalized()).length
    return amp * gauss(d, sigma)


def build_head(mats):
    me = quad_sphere('BIA_head', level=4)
    nose_c = Vector((0, -1, -0.16))
    muzzle_c = Vector((0, -1, -0.45))
    eye_cs = [Vector((s * 0.40, -0.86, 0.10)) for s in (1, -1)]

    def fn(p):
        u = p.normalized()
        q = head_shape(u)
        push = bump_dir(u, nose_c, 0.085, 0.085)          # nariz de botao
        push += bump_dir(u, muzzle_c, 0.035, 0.22)        # regiao da boca
        for ec in eye_cs:
            push -= bump_dir(u, ec, 0.045, 0.15)          # cavidade dos olhos
        q = q + u * push
        return Vector((q.x * HR.x, q.y * HR.y, q.z * HR.z))
    deform_mesh(me, fn)
    obj = new_obj('BIA_head', me, C)
    obj.location = H
    add_subsurf(obj, 2)
    apply_modifiers(obj)
    shade_smooth(obj)
    set_mat(obj, mats['skin'])
    return obj, eye_cs


def surface_point(head, direction, offset=0.0):
    """Raio do centro da cabeca na direcao dada -> ponto da superficie."""
    bvh = BVHTree.FromObject(head, bpy.context.evaluated_depsgraph_get())
    d = Vector(direction).normalized()
    hit, normal, _, _ = bvh.ray_cast(Vector((0, 0, 0)) + d * 0.5, -d)
    # BVH esta no espaco local do objeto (origem = centro da cabeca)
    return hit + normal * offset, normal


def build_ears(head, mats):
    ears = []
    for s in (1, -1):
        me = quad_sphere('BIA_ear', level=3)

        def fn(p, s=s):
            q = Vector((p.x * 0.018, p.y * 0.036, p.z * 0.048))
            # concha interna (concavidade da orelha)
            if p.x * s > 0:
                q.x -= s * 0.012 * gauss(p.y, 0.45) * gauss(p.z + 0.1, 0.5)
            return q
        deform_mesh(me, fn)
        ob = new_obj('BIA_ear.' + ('L' if s > 0 else 'R'), me, C)
        pt, _ = surface_point(head, (s * 1.0, 0.05, -0.05), -0.006)
        ob.location = H + pt
        ob.rotation_euler = (0, s * -0.15, s * -0.30)
        add_subsurf(ob, 2)
        shade_smooth(ob)
        set_mat(ob, mats['skin'])
        ears.append(ob)
    return ears


def build_eyes(head, eye_cs, mats):
    R = 0.054
    emat = eye_material(R)
    eyes, lids = [], []
    target = bpy.data.objects.new('BIA_eye_target', None)
    target.empty_display_type = 'SPHERE'
    target.empty_display_size = 0.03
    target.location = H + Vector((0, -1.2, 0.0))
    link(target, C)
    for ec, side in zip(eye_cs, ('L', 'R')):
        pt, nrm = surface_point(head, ec)
        center = H + pt - ec.normalized() * (R * 0.62)
        me = quad_sphere('BIA_eye.' + side, level=4)
        deform_mesh(me, lambda p: p * R)
        eye = new_obj('BIA_eye.' + side, me, C)
        eye.location = center
        shade_smooth(eye)
        add_subsurf(eye, 1)
        set_mat(eye, emat)
        c = eye.constraints.new('DAMPED_TRACK')
        c.target = target
        c.track_axis = 'TRACK_NEGATIVE_Y'
        eyes.append(eye)

        # palpebra superior: calota com espessura, rotaciona p/ piscar
        lme = quad_sphere('BIA_lid.' + side, level=4)
        bm = bmesh.new(); bm.from_mesh(lme)
        cut = 0.30
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < cut], context='VERTS')
        for v in bm.verts:
            v.co *= R * 1.07
        bm.to_mesh(lme); bm.free()
        lid = new_obj('BIA_lid.' + side, lme, C)
        lid.location = center
        lid.rotation_euler = (math.radians(-12), 0, 0)
        sol = lid.modifiers.new('Solid', 'SOLIDIFY'); sol.thickness = 0.004; sol.offset = 1
        add_subsurf(lid, 2)
        shade_smooth(lid)
        set_mat(lid, mats['skin'])
        lids.append(lid)

        # linha dos cilios (borda da palpebra) + cilios externos
        sgn = 1 if side == 'L' else -1
        rr = R * 1.085
        zc = rr * cut
        ring = math.sqrt(rr * rr - zc * zc)
        pts = []
        for i in range(9):
            a = math.radians(-70 + i * 17.5)   # arco frontal
            pts.append(Vector((math.sin(a) * ring, -math.cos(a) * ring, zc)))
        rot = Matrix.Rotation(math.radians(-12), 4, 'X')
        pts = [center + (rot @ p) for p in pts]
        lash = bezier_tube('BIA_lashline.' + side, pts, 0.0026, mat=mats['lash'], coll=C)
        lash.data.splines[0].bezier_points[0].radius = 0.3
        lash.data.splines[0].bezier_points[-1].radius = 0.6
        outer = pts[-1] if sgn > 0 else pts[0]
        for k, (dx, dz) in enumerate(((0.010, 0.006), (0.012, 0.000))):
            p0 = outer - Vector((sgn * 0.004, 0, 0))
            p1 = outer + Vector((sgn * dx * 0.6, -0.002, dz * 0.4 + 0.002))
            p2 = outer + Vector((sgn * dx, -0.001, dz + 0.004))
            fl = bezier_tube('BIA_lash.%s%d' % (side, k), [p0, p1, p2], 0.0022,
                             mat=mats['lash'], coll=C)
            sp = fl.data.splines[0]
            sp.bezier_points[0].radius = 1.0
            sp.bezier_points[2].radius = 0.15
        lids.append(lash)
    return eyes, lids, target


def build_brows(head, mats):
    brows = []
    for s in (1, -1):
        pts = []
        for i, (ax, az) in enumerate(((0.18, 0.40), (0.33, 0.45), (0.50, 0.42))):
            pt, nrm = surface_point(head, (s * ax, -0.88, az), 0.004)
            pts.append(H + pt)
        if s < 0:
            pts.reverse()
        b = bezier_tube('BIA_brow.' + ('L' if s > 0 else 'R'), pts, 0.0055, mat=mats['brow'], coll=C)
        sp = b.data.splines[0]
        radii = (0.55, 1.0, 0.45) if s > 0 else (0.45, 1.0, 0.55)
        for bp, r in zip(sp.bezier_points, radii):
            bp.radius = r
        b.scale = (1, 1, 1)
        brows.append(b)
    return brows


def build_mouth(head, mats):
    """Sorriso aberto: decal com malha propria projetada na superficie do rosto."""
    w, h = 0.040, 0.030
    ns, nt = 28, 10
    verts, faces, kinds = [], [], []
    for j in range(nt + 1):
        t = j / nt
        for i in range(ns + 1):
            s = i / ns
            u = (2 * s - 1)
            top = 0.004 - 0.010 * u * u            # labio superior levemente curvo
            bot = -h * math.sqrt(max(0.0, 1 - u ** 2)) * (1 - 0.15 * u * u) + top * 0.3
            v = top + t * (bot - top)
            verts.append((u * w, 0.0, v))
    for j in range(nt):
        for i in range(ns):
            a = j * (ns + 1) + i
            faces.append((a, a + 1, a + ns + 2, a + ns + 1))
            s = (i + 0.5) / ns; t = (j + 0.5) / nt
            if t < 0.22 and abs(s - 0.5) < 0.30:
                kinds.append(2)  # dentes
            elif ((s - 0.5) / 0.36) ** 2 + ((t - 1.05) / 0.55) ** 2 < 1:
                kinds.append(1)  # lingua
            else:
                kinds.append(0)
    me = bpy.data.meshes.new('BIA_mouth')
    me.from_pydata(verts, [], faces)
    ob = new_obj('BIA_mouth', me, C)
    for mk in ('mouth', 'tongue', 'teeth'):
        ob.data.materials.append(mats[mk])
    for p, k in zip(me.polygons, kinds):
        p.material_index = k
    mpt, _ = surface_point(head, (0, -1, -0.47), 0)
    ob.location = H + Vector((0, mpt.y - 0.05, mpt.z + 0.008))
    sw = ob.modifiers.new('Proj', 'SHRINKWRAP')
    sw.target = head
    sw.wrap_method = 'PROJECT'
    sw.use_project_y = True
    sw.use_negative_direction = True
    sw.use_positive_direction = True
    sw.offset = 0.0009
    apply_modifiers(ob)
    shade_smooth(ob)
    return ob


def build_hair(head, mats):
    hair_mat = mats['hair']
    hair_material(hair_mat)
    me = quad_sphere('BIA_hair', level=5)
    bm = bmesh.new(); bm.from_mesh(me)

    def hairline(u):
        a = abs(math.atan2(u.x, -u.y))           # 0 = testa, pi = nuca
        keys = [(0.0, 0.47), (0.55, 0.40), (0.95, 0.20), (1.45, 0.10), (1.9, -0.25), (2.4, -0.62), (3.2, -0.62)]
        for (a0, z0), (a1, z1) in zip(keys, keys[1:]):
            if a <= a1:
                t = (a - a0) / (a1 - a0)
                t = t * t * (3 - 2 * t)
                return z0 + (z1 - z0) * t
        return keys[-1][1]
    kill = [v for v in bm.verts if v.co.normalized().z < hairline(v.co.normalized())]
    bmesh.ops.delete(bm, geom=kill, context='VERTS')
    for v in bm.verts:
        u = v.co.normalized()
        q = head_shape(u)
        # o cabelo segue o cranio, com volume extra no topo
        k = 1.045 + 0.035 * max(0.0, u.z) ** 2
        v.co = Vector((q.x * HR.x * k, q.y * HR.y * k, q.z * HR.z * k))
    bm.to_mesh(me); bm.free()
    cap = new_obj('BIA_hair', me, C)
    cap.location = H
    sol = cap.modifiers.new('Solid', 'SOLIDIFY'); sol.thickness = 0.012; sol.offset = -1
    add_subsurf(cap, 2)
    shade_smooth(cap)
    set_mat(cap, hair_mat)

    parts = [cap]
    # dois 'puffs' cacheados (marca registrada da personagem)
    tex = bpy.data.textures.new('BIA_curls', 'CLOUDS')
    tex.noise_scale = 0.035
    tex.noise_depth = 2
    for s in (1, -1):
        pme = quad_sphere('BIA_puff', level=5)
        deform_mesh(pme, lambda p: Vector((p.x * 0.105, p.y * 0.095, p.z * 0.100)))
        puff = new_obj('BIA_puff.' + ('L' if s > 0 else 'R'), pme, C)
        puff.location = H + Vector((s * 0.185, 0.045, 0.135))
        puff.rotation_euler = (0, s * 0.45, 0)
        dp = puff.modifiers.new('Curls', 'DISPLACE')
        dp.texture = tex
        dp.texture_coords = 'OBJECT'
        dp.strength = 0.022
        dp.mid_level = 0.5
        add_subsurf(puff, 1)
        shade_smooth(puff)
        set_mat(puff, hair_mat)
        parts.append(puff)
        # elastico de cabelo
        bpy.ops.mesh.primitive_torus_add(major_radius=0.042, minor_radius=0.013,
                                         major_segments=32, minor_segments=12)
        tie = bpy.context.active_object
        tie.name = 'BIA_tie.' + ('L' if s > 0 else 'R')
        for coll in tie.users_collection:
            coll.objects.unlink(tie)
        link(tie, C)
        base = H + Vector((s * 0.135, 0.035, 0.105))
        tie.location = base
        d = (puff.location - base).normalized()
        tie.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
        shade_smooth(tie)
        set_mat(tie, mats['tie'])
        parts.append(tie)
    # cachinho na testa (baby hair)
    p0, _ = surface_point(head, (0.10, -0.80, 0.62), 0.008)
    p1, _ = surface_point(head, (0.03, -0.92, 0.50), 0.010)
    p2, _ = surface_point(head, (0.09, -0.92, 0.44), 0.010)
    p3 = p2 + Vector((-0.012, -0.004, 0.012))
    curl = bezier_tube('BIA_curl', [H + p0, H + p1, H + p2, H + p3], 0.009, mat=hair_mat, coll=C)
    rad = (1.2, 1.0, 0.7, 0.25)
    for bp, r in zip(curl.data.splines[0].bezier_points, rad):
        bp.radius = r
    parts.append(curl)
    return parts


# ============================================================ corpo
SIDE = {'L': 1, 'R': -1}


def body_skeleton():
    V, E, R = [], [], []

    def add(p, r):
        V.append(p); R.append(r); return len(V) - 1
    pel = add((0, 0.005, 0.430), (0.098, 0.078))
    bel = add((0, -0.004, 0.515), (0.104, 0.086))
    che = add((0, 0.004, 0.610), (0.094, 0.070))
    nk = add((0, 0.010, 0.705), (0.040, 0.040))
    nk2 = add((0, 0.012, 0.790), (0.042, 0.042))
    E += [(pel, bel), (bel, che), (che, nk), (nk, nk2)]
    ends = {}
    for sd, s in SIDE.items():
        hip = add((s * 0.060, 0.004, 0.405), 0.052)
        kne = add((s * 0.070, 0.000, 0.235), 0.040)
        ank = add((s * 0.076, 0.010, 0.075), 0.032)
        toe = add((s * 0.078, -0.045, 0.045), (0.030, 0.026))
        E += [(pel, hip), (hip, kne), (kne, ank), (ank, toe)]
        sh = add((s * 0.098, 0.006, 0.655), 0.040)
        el = add((s * 0.185, 0.010, 0.560), 0.032)
        wr = add((s * 0.262, 0.004, 0.474), 0.026)
        E += [(che, sh), (sh, el), (el, wr)]
        ends[sd] = dict(sh=V[sh], el=V[el], wr=V[wr], hip=V[hip], kne=V[kne], ank=V[ank], toe=V[toe])
    return V, E, R, ends


def build_hand(side, wrist, elbow, mats):
    """Mao canonica (dedos em +X, palma em -Z, polegar em -Y), depois alinhada ao braco."""
    s = SIDE[side]
    pieces = []
    # palma
    palm = skin_mesh('hand_palm', [(0.0, 0, 0), (0.030, 0, 0), (0.042, 0, 0)], [(0, 1), (1, 2)],
                     [0.022, 0.026, 0.024], C)
    apply_modifiers(palm)
    for v in palm.data.vertices:
        v.co.z *= 0.62
    pieces.append(('hand', palm))
    fingers = {  # nome: (y na base, comprimentos, raio, curvatura)
        'index': (-0.0165, (0.019, 0.014, 0.012), 0.0088, 0.12),
        'middle': (-0.0055, (0.021, 0.016, 0.013), 0.0090, 0.14),
        'ring': (0.0055, (0.019, 0.014, 0.012), 0.0086, 0.16),
        'pinky': (0.0160, (0.015, 0.011, 0.010), 0.0078, 0.20),
    }
    for name, (y, lens, r, curl) in fingers.items():
        pts = [Vector((0.036, y, 0.0))]
        ang = 0.0
        for L in lens:
            ang += curl
            pts.append(pts[-1] + Vector((math.cos(ang) * L, y * 0.12, -math.sin(ang) * L)))
        radii = [r * 1.05, r, r * 0.94, r * 0.86]
        f = skin_mesh('finger_' + name, [tuple(p) for p in pts], [(0, 1), (1, 2), (2, 3)], radii, C)
        apply_modifiers(f)
        pieces.append((name, f))
    tpts = [Vector((0.010, -0.016, -0.004)), Vector((0.022, -0.030, -0.010)),
            Vector((0.034, -0.038, -0.012)), Vector((0.044, -0.042, -0.012))]
    th = skin_mesh('finger_thumb', [tuple(p) for p in tpts], [(0, 1), (1, 2), (2, 3)],
                   [0.0115, 0.0105, 0.0095, 0.0085], C)
    apply_modifiers(th)
    pieces.append(('thumb', th))

    # alinhamento ao antebraco (calculado para o lado esquerdo e espelhado p/ o direito)
    wl = Vector(wrist); el = Vector(elbow)
    if s < 0:
        wl.x, el.x = -wl.x, -el.x
    d = (wl - el).normalized()
    xh = d
    n_in = Vector((-abs(d.z), 0, -abs(d.x))).normalized()   # palma voltada p/ o corpo
    zh = -n_in
    zh = (zh - xh * zh.dot(xh)).normalized()
    yh = zh.cross(xh)
    M = Matrix((xh, yh, zh)).transposed().to_4x4()
    M.translation = wl - d * 0.004
    if s < 0:
        M = Matrix.Scale(-1, 4, (1, 0, 0)) @ M
    result = []
    for name, ob in pieces:
        me = ob.data
        me.transform(M)
        if s < 0:
            me.flip_normals()
        ob.name = 'BIA_%s.%s' % (name, side)
        result.append((name, ob))
    return result, M


def bisect(obj, co, no, keep_side):
    """Corta a malha num plano; keep_side=+1 mantem o lado da normal."""
    bm = bmesh.new(); bm.from_mesh(obj.data)
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=no,
                           clear_inner=keep_side > 0, clear_outer=keep_side < 0)
    bm.to_mesh(obj.data); bm.free()


def build_clothes(ends, mats):
    # camiseta
    V = [(0, 0.004, 0.455), (0, -0.006, 0.525), (0, 0.004, 0.612), (0, 0.010, 0.700)]
    R = [(0.122, 0.100), (0.118, 0.098), (0.107, 0.084), (0.056, 0.054)]
    E = [(0, 1), (1, 2), (2, 3)]
    for sd, s in SIDE.items():
        e = ends[sd]
        sh = Vector(e['sh']); el = Vector(e['el'])
        a = len(V)
        V += [tuple(sh), tuple(sh + (el - sh) * 0.48)]
        R += [0.052, 0.046]
        E += [(2, a), (a, a + 1)]
    shirt = skin_mesh('BIA_shirt', V, E, R, C)
    apply_modifiers(shirt)
    bisect(shirt, (0, 0, 0.462), (0, 0, 1), +1)          # barra
    bisect(shirt, (0, 0, 0.688), (0, 0, -1), +1)         # gola
    for sd, s in SIDE.items():
        e = ends[sd]
        sh = Vector(e['sh']); el = Vector(e['el'])
        cut = sh + (el - sh) * 0.44
        bisect(shirt, tuple(cut), tuple(-(el - sh).normalized()), +1)  # mangas
    sol = shirt.modifiers.new('Solid', 'SOLIDIFY'); sol.thickness = 0.007; sol.offset = 1
    sol.use_rim = True
    add_subsurf(shirt, 2)
    shade_smooth(shirt)
    set_mat(shirt, mats['shirt'])

    # shorts
    V = [(0, 0.006, 0.505), (0, 0.006, 0.425)]
    R = [(0.110, 0.091), (0.106, 0.084)]
    E = [(0, 1)]
    for sd, s in SIDE.items():
        e = ends[sd]
        hip = Vector(e['hip']); kne = Vector(e['kne'])
        a = len(V)
        V += [tuple(hip + Vector((0, 0, 0.0))), tuple(hip + (kne - hip) * 0.42)]
        R += [0.060, 0.056]
        E += [(1, a), (a, a + 1)]
    shorts = skin_mesh('BIA_shorts', V, E, R, C)
    apply_modifiers(shorts)
    bisect(shorts, (0, 0, 0.500), (0, 0, -1), +1)
    for sd, s in SIDE.items():
        e = ends[sd]
        hip = Vector(e['hip']); kne = Vector(e['kne'])
        cut = hip + (kne - hip) * 0.38
        bisect(shorts, tuple(cut), tuple((kne - hip).normalized()), -1)
    sol = shorts.modifiers.new('Solid', 'SOLIDIFY'); sol.thickness = 0.008; sol.offset = 1
    add_subsurf(shorts, 2)
    shade_smooth(shorts)
    set_mat(shorts, mats['shorts'])

    # estampa: estrela na camiseta (decal projetado)
    pts = []
    for i in range(10):
        a = math.pi / 2 + i * math.pi / 5
        r = 0.030 if i % 2 == 0 else 0.013
        pts.append((math.cos(a) * r, 0.0, math.sin(a) * r))
    me = bpy.data.meshes.new('BIA_star')
    me.from_pydata([(0, 0, 0)] + pts, [], [(0, i + 1, (i + 1) % 10 + 1) for i in range(10)])
    star = new_obj('BIA_star', me, C)
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=3, use_grid_fill=True)
    bm.to_mesh(me); bm.free()
    star.location = (0.0, -0.2, 0.575)
    sw = star.modifiers.new('Proj', 'SHRINKWRAP'); sw.target = shirt
    sw.wrap_method = 'PROJECT'; sw.use_project_y = True
    sw.use_negative_direction = True; sw.use_positive_direction = True
    sw.offset = 0.0012
    apply_modifiers(star)
    shade_smooth(star)
    set_mat(star, mats['star'])

    # tenis (um objeto por pe, preso ao osso do pe)
    shoes = []
    for sd, s in SIDE.items():
        x = s * 0.078
        V = [(x, 0.030, 0.050), (x, -0.010, 0.048), (x, -0.062, 0.043)]
        R = [(0.040, 0.038), (0.042, 0.040), (0.038, 0.034)]
        sh = skin_mesh('BIA_shoe.' + sd, V, [(0, 1), (1, 2)], R, C)
        apply_modifiers(sh)
        for v in sh.data.vertices:          # sola plana apoiada no chao
            if v.co.z < 0.022:
                v.co.z = 0.004 + (v.co.z - 0.004) * 0.15
        sh.data.materials.append(mats['shoe'])
        sh.data.materials.append(mats['sole'])
        for p in sh.data.polygons:
            p.material_index = 1 if p.center.z < 0.020 else 0
        add_subsurf(sh, 2)
        shade_smooth(sh)
        shoes.append(sh)
    return shirt, shorts, star, shoes


# ============================================================ rig
def build_rig(ends):
    arm = bpy.data.armatures.new('BIA_rig')
    rig = new_obj('BIA_rig', arm, C)
    rig.show_in_front = True
    set_active(rig)
    bpy.ops.object.mode_set(mode='EDIT')
    eb = arm.edit_bones

    def bone(name, head, tail, parent=None, connect=False, deform=True):
        b = eb.new(name)
        b.head = head; b.tail = tail
        if parent:
            b.parent = eb[parent]
            b.use_connect = connect
        b.use_deform = deform
        return b
    bone('root', (0, 0, 0), (0, 0.2, 0), deform=False)
    bone('pelvis', (0, 0.005, 0.40), (0, 0.005, 0.50), 'root')
    bone('spine', (0, 0.005, 0.50), (0, 0.004, 0.61), 'pelvis', True)
    bone('chest', (0, 0.004, 0.61), (0, 0.010, 0.705), 'spine', True)
    bone('neck', (0, 0.010, 0.705), (0, 0.012, 0.80), 'chest', True)
    bone('head', (0, 0.012, 0.80), (0, 0.012, 1.10), 'neck', True)
    for sd, s in SIDE.items():
        e = ends[sd]
        bone('thigh.' + sd, e['hip'], e['kne'], 'pelvis')
        bone('shin.' + sd, e['kne'], e['ank'], 'thigh.' + sd, True)
        bone('foot.' + sd, e['ank'], e['toe'], 'shin.' + sd, True)
        bone('clavicle.' + sd, (s * 0.02, 0.006, 0.66), e['sh'], 'chest')
        bone('upperarm.' + sd, e['sh'], e['el'], 'clavicle.' + sd, True)
        bone('forearm.' + sd, e['el'], e['wr'], 'upperarm.' + sd, True)
        d = (Vector(e['wr']) - Vector(e['el'])).normalized()
        bone('hand.' + sd, e['wr'], Vector(e['wr']) + d * 0.045, 'forearm.' + sd, True)
    # roll consistente: eixo Z local dos ossos apontando para tras (+Y)
    for b in eb:
        b.align_roll(Vector((0, 1, 0)) if abs(b.vector.normalized().y) < 0.9 else Vector((0, 0, 1)))
    bpy.ops.object.mode_set(mode='OBJECT')
    return rig


def add_finger_bones(rig, hand_frames):
    set_active(rig)
    bpy.ops.object.mode_set(mode='EDIT')
    eb = rig.data.edit_bones
    canon = {'index': (-0.0165, 0.036), 'middle': (-0.0055, 0.036), 'ring': (0.0055, 0.036),
             'pinky': (0.016, 0.036), 'thumb': (-0.016, 0.010)}
    for sd, M in hand_frames.items():
        for name, (y, x) in canon.items():
            b = eb.new('f_%s.%s' % (name, sd))
            if name == 'thumb':
                b.head = M @ Vector((x, y, -0.004))
                b.tail = M @ Vector((0.044, -0.042, -0.012))
            else:
                b.head = M @ Vector((x, y, 0))
                b.tail = M @ Vector((x + 0.045, y * 1.1, -0.01))
            b.parent = eb['hand.' + sd]
            b.align_roll(M.to_3x3() @ Vector((0, 0, 1)))
    bpy.ops.object.mode_set(mode='OBJECT')


def parent_to_bone(obj, rig, bone_name):
    bpy.context.view_layer.update()
    pb = rig.pose.bones[bone_name]
    mw = obj.matrix_world.copy()
    obj.parent = rig
    obj.parent_type = 'BONE'
    obj.parent_bone = bone_name
    pm = rig.matrix_world @ pb.matrix @ Matrix.Translation((0, pb.bone.length, 0))
    obj.matrix_parent_inverse = pm.inverted()
    obj.matrix_world = mw


def parent_keep(child, parent):
    mw = child.matrix_world.copy()
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()
    child.matrix_world = mw


def transfer_weights(src, dst):
    for g in src.vertex_groups:
        if dst.vertex_groups.get(g.name) is None:
            dst.vertex_groups.new(name=g.name)
    m = dst.modifiers.new('WT', 'DATA_TRANSFER')
    m.object = src
    m.use_vert_data = True
    m.data_types_verts = {'VGROUP_WEIGHTS'}
    m.vert_mapping = 'POLYINTERP_NEAREST'
    m.layers_vgroup_select_src = 'ALL'
    m.layers_vgroup_select_dst = 'NAME'
    # aplica o WT antes dos demais modificadores
    set_active(dst)
    bpy.ops.object.modifier_move_to_index(modifier='WT', index=0)
    bpy.ops.object.modifier_apply(modifier='WT')


def armature_mod(obj, rig):
    m = obj.modifiers.new('Armature', 'ARMATURE')
    m.object = rig
    set_active(obj)
    bpy.ops.object.modifier_move_to_index(modifier='Armature', index=0)
    obj.parent = rig
    obj.matrix_parent_inverse = rig.matrix_world.inverted()


# ============================================================ main
def main():
    reset_scene()
    bpy.context.scene.render.engine = 'CYCLES'
    mats = make_materials()

    V, E, R, ends = body_skeleton()
    body = skin_mesh('BIA_body', V, E, R, C)
    apply_modifiers(body)
    # meia branca no tornozelo (material por altura)
    body.data.materials.append(mats['skin'])
    body.data.materials.append(mats['sock'])
    for p in body.data.polygons:
        p.material_index = 1 if p.center.z < 0.115 else 0

    rig = build_rig(ends)

    # pesos automaticos (bone heat) no corpo continuo
    set_active(body)
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
    print('vgroups corpo:', [g.name for g in body.vertex_groups])

    # maos: pecas com pesos rigidos por dedo, unidas ao corpo
    hand_frames = {}
    hand_objs = []
    for sd in SIDE:
        e = ends[sd]
        pieces, M = build_hand(sd, e['wr'], e['el'], mats)
        hand_frames[sd] = M
        for name, ob in pieces:
            bone = 'hand.' + sd if name == 'hand' else 'f_%s.%s' % (name, sd)
            vg = ob.vertex_groups.new(name=bone)
            vg.add(list(range(len(ob.data.vertices))), 1.0, 'REPLACE')
            ob.data.materials.append(mats['skin'])
            hand_objs.append(ob)
    add_finger_bones(rig, hand_frames)
    set_active(body)
    for ob in hand_objs:
        ob.select_set(True)
    bpy.ops.object.join()
    body = bpy.context.view_layer.objects.active
    body.name = 'BIA_body'
    add_subsurf(body, 2)
    shade_smooth(body)

    shirt, shorts, star, shoes = build_clothes(ends, mats)
    for cl in (shirt, shorts, star):
        transfer_weights(body, cl)
        armature_mod(cl, rig)
    for sh, sd in zip(shoes, ('L', 'R')):
        parent_to_bone(sh, rig, 'foot.' + sd)

    # cabeca e componentes
    head, eye_cs = build_head(mats)
    ears = build_ears(head, mats)
    eyes, lids, target = build_eyes(head, eye_cs, mats)
    brows = build_brows(head, mats)
    mouth = build_mouth(head, mats)
    hair = build_hair(head, mats)
    bl = []
    for s in (1, -1):
        pt, _ = surface_point(head, (s * 0.60, -0.78, -0.25), 0.0)
        em = bpy.data.objects.new('BIA_blush.' + ('L' if s > 0 else 'R'), None)
        em.location = H + pt
        em.empty_display_size = 0.02
        link(em, C)
        bl.append(em)
    blush(mats['skin'], bl)

    parent_to_bone(head, rig, 'head')
    bpy.context.view_layer.update()
    for ob in ears + eyes + lids + brows + [mouth, target] + hair + bl:
        parent_keep(ob, head)

    # metadados de consistencia
    for ob in bpy.data.collections[C].all_objects:
        ob['asset'] = 'BIA'
        ob['asset_version'] = 1
    rig['height_m'] = 1.13

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=OUT, compress=True)
    print('SALVO', OUT)


if __name__ == '__main__':
    main()
