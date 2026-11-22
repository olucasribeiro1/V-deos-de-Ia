"""Utilidades compartilhadas do pipeline Animadinhos-style (Blender/bpy).

Tudo aqui e deterministico: rodar o mesmo script gera o mesmo ativo,
o que garante consistencia visual entre cenas.
"""
import math
import bpy  # noqa: E402  (bpy precisa ser importado antes de bmesh)
import bmesh
import bpy
from mathutils import Vector, Matrix, Quaternion


# ----------------------------------------------------------------- cena

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def link(obj, coll_name=None):
    coll = bpy.context.scene.collection
    if coll_name:
        coll = bpy.data.collections.get(coll_name)
        if coll is None:
            coll = bpy.data.collections.new(coll_name)
            bpy.context.scene.collection.children.link(coll)
    coll.objects.link(obj)
    return obj


def new_obj(name, mesh, coll=None):
    obj = bpy.data.objects.new(name, mesh)
    link(obj, coll)
    return obj


def set_active(obj):
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)


def apply_modifiers(obj):
    set_active(obj)
    for m in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


def shade_smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True


def add_subsurf(obj, levels=2, render=None):
    m = obj.modifiers.new("Subsurf", 'SUBSURF')
    m.levels = levels
    m.render_levels = render if render is not None else levels
    return m


# -------------------------------------------------------------- cores

def srgb(hexstr):
    """'#RRGGBB' -> RGBA linear (o Blender trabalha em linear)."""
    hexstr = hexstr.lstrip('#')
    out = []
    for i in (0, 2, 4):
        c = int(hexstr[i:i + 2], 16) / 255.0
        c = c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
        out.append(c)
    return (*out, 1.0)


# ---------------------------------------------------------- materiais

def principled(name, color, rough=0.5, sss=0.0, sss_radius=(1.0, 0.45, 0.3),
               coat=0.0, coat_rough=0.05, sheen=0.0, spec=0.5, emission=None):
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Specular IOR Level'].default_value = spec
    if sss:
        bsdf.inputs['Subsurface Weight'].default_value = sss
        bsdf.inputs['Subsurface Radius'].default_value = sss_radius
        bsdf.inputs['Subsurface Scale'].default_value = 0.02
    if coat:
        bsdf.inputs['Coat Weight'].default_value = coat
        bsdf.inputs['Coat Roughness'].default_value = coat_rough
    if sheen:
        bsdf.inputs['Sheen Weight'].default_value = sheen
    if emission:
        bsdf.inputs['Emission Color'].default_value = emission[0]
        bsdf.inputs['Emission Strength'].default_value = emission[1]
    mat.diffuse_color = color
    return mat


def set_mat(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)


def nodes_of(mat):
    return mat.node_tree.nodes, mat.node_tree.links


def add_noise_color(mat, color_a, color_b, scale=4.0, detail=3.0, coord='Object',
                    contrast=(0.35, 0.65), bump=0.0, bump_scale=None):
    """Mistura duas cores com ruido procedural (variacao organica de superficie)."""
    nodes, links = nodes_of(mat)
    bsdf = nodes['Principled BSDF']
    tc = nodes.new('ShaderNodeTexCoord')
    noise = nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = scale
    noise.inputs['Detail'].default_value = detail
    links.new(tc.outputs[coord], noise.inputs['Vector'])
    ramp = nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = contrast[0]
    ramp.color_ramp.elements[1].position = contrast[1]
    ramp.color_ramp.elements[0].color = color_a
    ramp.color_ramp.elements[1].color = color_b
    links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
    links.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    if bump:
        bn = nodes.new('ShaderNodeBump')
        bn.inputs['Strength'].default_value = bump
        src = noise
        if bump_scale:
            src = nodes.new('ShaderNodeTexNoise')
            src.inputs['Scale'].default_value = bump_scale
            src.inputs['Detail'].default_value = 4
            links.new(tc.outputs[coord], src.inputs['Vector'])
        links.new(src.outputs['Fac'], bn.inputs['Height'])
        links.new(bn.outputs['Normal'], bsdf.inputs['Normal'])
    return mat


# ------------------------------------------------------- geometria base

def quad_sphere(name, level=4):
    """Esfera de quads (cubo subdividido e projetado). Topologia limpa,
    sem polos triangulares - essencial para deformacao e subdivisao suaves."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=2.0)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=2 ** level - 1, use_grid_fill=True)
    for v in bm.verts:
        v.co = v.co.normalized()
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return me


def deform_mesh(me, fn):
    for v in me.vertices:
        v.co = fn(Vector(v.co))
    me.update()


def gauss(d, sigma):
    return math.exp(-(d * d) / (2 * sigma * sigma))


def skin_mesh(name, verts, edges, radii, coll=None, root=0, smooth=True):
    """Malha continua a partir de um 'esqueleto' de vertices (Skin modifier).
    Gera tubos organicos conectados (sem bolinhas emendadas)."""
    me = bpy.data.meshes.new(name)
    me.from_pydata([Vector(v) for v in verts], edges, [])
    obj = new_obj(name, me, coll)
    sk = obj.modifiers.new("Skin", 'SKIN')
    sk.use_smooth_shade = smooth
    sk.branch_smoothing = 0.6
    for i, r in enumerate(radii):
        sv = me.skin_vertices[0].data[i]
        sv.radius = r if isinstance(r, (tuple, list)) else (r, r)
        sv.use_root = (i == root)
    return obj


def look_at(obj, target, roll=0.0):
    d = Vector(target) - obj.location
    q = d.to_track_quat('-Z', 'Y')
    obj.rotation_euler = (q @ Quaternion((0, 0, 1), roll)).to_euler()


def bezier_tube(name, points, radius, radii=None, coll=None, res=12, mat=None):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = radius
    cu.bevel_resolution = 4
    cu.resolution_u = res
    cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(points) - 1)
    for i, p in enumerate(points):
        bp = sp.bezier_points[i]
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
        if radii:
            bp.radius = radii[i]
    obj = bpy.data.objects.new(name, cu)
    link(obj, coll)
    if mat:
        cu.materials.append(mat)
    return obj


def to_mesh(obj):
    set_active(obj)
    bpy.ops.object.convert(target='MESH')
    return bpy.context.view_layer.objects.active
