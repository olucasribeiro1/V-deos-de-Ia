"""Blocktopia house style (runs inside Blender; import from a video's shots.py).

    from blocktopia import zip_, bt_look
    Z = zip_(t0, t1, "happy")      # the channel's fixed protagonist
    ...build the set and camera...
    bt_look()                      # call LAST in every shot: crisp sun shadows like a blocky-game sandbox
"""
import math
import bpy
from rbx import story, chars

from rbx.core import sphere, box, mat, hexc

# Zip: white skin, red backwards baseball cap, black tee with a yellow bolt, dark pants, no glasses.
ZIP = dict(skin="#F7F5F2", hair="bald", hair_color="#F7F5F2", shirt="#1C1C1E", pants="#2B2F3A",
           face="hero", sleeves="short", bolt="#FFD21F")
CAP_RED = "#E0231C"


def red_cap(ch, color=CAP_RED):
    """Baseball cap worn backwards (bill at the back), parented to the head (head-local: radius 0.62, top z=0.6)."""
    M = mat("zipcap_red", hexc(color), 0.45)
    n, h = ch.name, ch.head
    sphere(n + "_capdome", 0.66, (0, 0.02, 0.34), M, (1.0, 1.0, 0.68), parent=h, coll=ch.coll, seg=32)
    box(n + "_capbill", (1.0, 0.62, 0.07), (0, 0.86, 0.33), M, 0.03, rot=(8, 0, 0), parent=h, coll=ch.coll)
    sphere(n + "_capbutton", 0.07, (0, 0.02, 0.79), M, parent=h, coll=ch.coll, seg=12)


def zip_(t0, t1, expr="happy", name="Zip", **kw):
    """Zip, the Blocktopia protagonist. kw overrides any Char argument for one shot."""
    a = dict(ZIP)
    a.update(kw)
    if "extras" in a:
        a["extras"] = tuple(a["extras"])
    cap = a.pop("cap", True)
    ch = chars.Char(name, **a)
    if cap:
        red_cap(ch)
    return story._live(ch, t0, t1, expr)


def bt_look(sun_angle=1.0, sun_boost=1.25):
    """Hard-edged sun shadows and a slightly stronger sun: the bright sandbox daylight of the format."""
    for o in bpy.data.objects:
        if o.type == "LIGHT" and o.data.type == "SUN":
            o.data.angle = math.radians(sun_angle)
            o.data.energy *= sun_boost


# Kai: tan skin, messy brown hair, black/white headphones, split purple|orange hoodie with crossed
# sleeves and a hood, black pants, white sneakers.
KAI_A, KAI_B = "#6B2BD9", "#FF8A00"
KAI = dict(skin="#F2C9A0", hair="messy", hair_color="#5A3A22", shirt=KAI_A, pants="#1F1F24",
           face="kid", sleeves="long")


def split_mat(name, left, right):
    """Two-tone material split at object-space x = 0 (left = +X, the character's left)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    N, L = m.node_tree.nodes, m.node_tree.links
    b = N.get("Principled BSDF")
    b.inputs["Roughness"].default_value = 0.55
    tc, sep = N.new("ShaderNodeTexCoord"), N.new("ShaderNodeSeparateXYZ")
    gt = N.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.0
    mx = N.new("ShaderNodeMix"); mx.data_type = "RGBA"
    mx.inputs[6].default_value = (*hexc(right), 1)
    mx.inputs[7].default_value = (*hexc(left), 1)
    L.new(tc.outputs["Object"], sep.inputs[0]); L.new(sep.outputs["X"], gt.inputs[0])
    L.new(gt.outputs[0], mx.inputs[0]); L.new(mx.outputs[2], b.inputs["Base Color"])
    m.diffuse_color = (*hexc(left), 1)
    return m


def _swap_shirt(obj, newm):
    for sl in obj.material_slots:
        if sl.material and sl.material.name.split(".")[0].endswith("_shirt"):
            sl.material = newm


def kai_outfit(ch, a=KAI_A, b=KAI_B):
    n, O = ch.name, bpy.data.objects
    _swap_shirt(O[n + "_torso"], split_mat(n + "_split", a, b))      # character's left half = purple
    _swap_shirt(O[n + "_armL"], mat(n + "_sleeveL", hexc(b), 0.55))   # crossed sleeves
    _swap_shirt(O[n + "_armR"], mat(n + "_sleeveR", hexc(a), 0.55))
    box(n + "_hood", (1.5, 0.42, 0.5), (0, 0.62, 1.95), split_mat(n + "_hoodm", a, b), 0.16,
        parent=ch.hip, coll=ch.coll)
    Ms = mat(n + "_shoe", hexc("#F4F4F4"), 0.4)
    for piv, side in ((ch.hpL, "L"), (ch.hpR, "R")):
        box(f"{n}_shoe{side}", (1.04, 1.08, 0.34), (0, -0.04, -1.86), Ms, 0.08, parent=piv, coll=ch.coll)


def headphones(ch, cup="#1A1A1E", band="#F4F4F4"):
    """Over-ear headphones on the head (head-local: radius 0.62, top z=0.6)."""
    import math as _m
    Mc, Mb = mat("kai_cup", hexc(cup), 0.35), mat("kai_band", hexc(band), 0.4)
    n, h = ch.name, ch.head
    r, cz = 0.9, 0.0
    for i, a in enumerate(range(-84, 85, 12)):
        t = _m.radians(a)
        box(f"{n}_hpb{i}", (0.22, 0.28, 0.14), (r * _m.sin(t), 0.05, cz + r * _m.cos(t)), Mb, 0.04,
            rot=(0, a, 0), parent=h, coll=ch.coll)
    from rbx.core import cyl
    for sx in (-1, 1):
        cyl(f"{n}_hpcup{sx}", 0.32, 0.2, (sx * 0.8, 0.05, 0.0), Mc, 32, bev=0.05, rot=(0, 90, 0), parent=h, coll=ch.coll)
        cyl(f"{n}_hppad{sx}", 0.24, 0.06, (sx * 0.92, 0.05, 0.0), Mb, 32, rot=(0, 90, 0), parent=h, coll=ch.coll)


def kai_(t0, t1, expr="happy", name="Kai", **kw):
    """Kai, the Blocktopia protagonist."""
    a = dict(KAI)
    a.update(kw)
    if "extras" in a:
        a["extras"] = tuple(a["extras"])
    phones = a.pop("phones", True)
    ch = chars.Char(name, **a)
    if phones:
        headphones(ch)
    kai_outfit(ch)
    return story._live(ch, t0, t1, expr)


# ------------------------------------------------------------------ Roblox fidelity pass (v2)
def roblox_materials(min_rough=0.62, spec=0.3):
    """SmoothPlastic look: matte, no clearcoat, controlled specular, on every material in the scene."""
    for m in bpy.data.materials:
        if not m.use_nodes:
            continue
        for n in m.node_tree.nodes:
            if n.type != "BSDF_PRINCIPLED":
                continue
            r = n.inputs["Roughness"]
            if not r.is_linked and r.default_value < min_rough:
                r.default_value = min_rough
            for key in ("Coat Weight", "Clearcoat"):
                if key in n.inputs:
                    n.inputs[key].default_value = 0.0
            for key in ("Specular IOR Level", "Specular"):
                if key in n.inputs and not n.inputs[key].is_linked:
                    n.inputs[key].default_value = min(n.inputs[key].default_value, spec)
            mt = n.inputs["Metallic"]
            if not mt.is_linked and mt.default_value > 0.3:
                mt.default_value = 0.3


def roblox_look(sun_angle=3.0, sun_boost=1.05, exposure=-0.15):
    """Call LAST in every shot. Bright saturated 'studio day': soft-edged sun shadows, matte plastic,
    neutral tone mapping (no washed-out AgX), slight exposure trim to keep whites from clipping."""
    roblox_materials()
    for o in bpy.data.objects:
        if o.type == "LIGHT" and o.data.type == "SUN":
            o.data.angle = math.radians(sun_angle)
            o.data.energy *= sun_boost
    sc = bpy.context.scene
    for vt in ("Khronos PBR Neutral", "AgX"):
        try:
            sc.view_settings.view_transform = vt
            break
        except TypeError:
            continue
    sc.view_settings.exposure = exposure
    import os as _os
    if _os.environ.get("BT_PCT"):
        sc.render.resolution_percentage = int(_os.environ["BT_PCT"])
    if _os.environ.get("BT_SAMPLES"):
        sc.eevee.taa_render_samples = int(_os.environ["BT_SAMPLES"])
    try:
        sc.eevee.use_fast_gi = True
        sc.eevee.fast_gi_method = "GLOBAL_ILLUMINATION"
    except Exception:
        pass


def grow(ch, t, s, settle=0.18):
    """Head grows/shrinks from the neck (so it grows UP, never into the torso), with a little overshoot."""
    n = ch.neck
    if t - 0.01 > 0:
        n.keyframe_insert("scale", frame=max(1, int(round((t - 0.01) * 30))))
    for dt, k in ((0.0, None), (settle * 0.6, 1.12), (settle, 1.0)):
        if k is None:
            continue
        n.scale = (s * k,) * 3
        n.keyframe_insert("scale", frame=int(round((t + dt) * 30)))


def head_at(ch, t, s):
    ch.neck.scale = (s,) * 3
    ch.neck.keyframe_insert("scale", frame=max(1, int(round(t * 30))))


# ------------------------------------------------------------------ channel host: the owner's knight avatar
TEX_DIR = None


def _tex(name):
    import os
    from rbx import world as W
    return os.path.join(W.TEX, name)


def host_(t0, t1, expr=None, name="Host"):
    """The BLOCKTOPIA host (owner's avatar): white hood with a black void face and a golden blade crown,
    black studded pauldrons, worn grey tabard with a red ringed cross and drip, chainmail sleeves,
    black gauntlets, belts, black legs with gold greave bands. R6."""
    from rbx.core import img_mat, card, cyl
    ch = chars.Char(name, skin="#141414", shirt="#8f8d87", pants="#151517", hair="bald", hair_color="#141414",
                    face=None, sleeves="long")
    O, n, c = bpy.data.objects, ch.name, ch.coll
    M_white, M_void = mat("host_hood", hexc("#ECEAE4"), 0.7), mat("host_void", hexc("#050505"), 0.9)
    M_gold = mat("host_gold", hexc("#D9A441"), 0.45, metal=0.3)
    M_iron = mat("host_iron", hexc("#2A2B2E"), 0.6, metal=0.25)
    M_belt = mat("host_belt", hexc("#1B1714"), 0.75)
    M_mail = img_mat("host_mail", _tex("host_chainmail.png"), 0.65, proj_box=True)
    h = ch.head
    # hood + void face opening
    box(n + "_hood", (1.46, 1.42, 1.5), (0, 0.05, 0.06), M_white, 0.34, parent=h, coll=c)
    sphere(n + "_hoodtip", 0.42, (0, 0.18, 0.62), M_white, (1.0, 1.0, 0.7), parent=h, coll=c, seg=20)
    cyl(n + "_void", 0.5, 0.04, (0, -0.665, -0.06), M_void, 40, rot=(90, 0, 0), parent=h, coll=c).scale = (1.0, 1.32, 1.0)
    # golden blade crown fanned behind the hood
    for i, a in enumerate((-62, -36, -12, 12, 36, 62)):
        t = math.radians(a)
        cyl(f"{n}_blade{i}", 0.16, 0.85, (0.78 * math.sin(t), 0.4, 0.3 + 0.7 * math.cos(t)), M_gold, 4,
            r2=0.0, rot=(-20, a, 0), parent=h, coll=c)
    # tabard front/back over torso and down over the thighs
    tab = img_mat("host_tabard", _tex("host_tabard.png"), 0.8)
    card(n + "_tabF", 1.7, 3.0, (0, -0.53, 0.55), tab, "-Y", parent=ch.hip, coll=c)
    card(n + "_tabB", 1.7, 3.0, (0, 0.53, 0.55), tab, "+Y", parent=ch.hip, coll=c)
    # belts
    box(n + "_belt", (2.06, 1.06, 0.2), (0, 0, 0.3), M_belt, 0.02, parent=ch.hip, coll=c)
    box(n + "_strap", (0.22, 1.08, 2.5), (0, 0, 1.0), M_belt, 0.02, rot=(0, 38, 0), parent=ch.hip, coll=c)
    sphere(n + "_ring", 0.13, (0.0, -0.58, 0.3), M_gold, (1, 0.4, 1), parent=ch.hip, coll=c, seg=12)
    # gold collar wings
    for sx in (-1, 1):
        for k, (a, ln) in enumerate(((25, 0.9), (45, 0.75), (65, 0.6))):
            cyl(f"{n}_wing{sx}{k}", 0.11, ln, (sx * (0.75 + 0.18 * k), 0.15, 2.25 + 0.12 * k), M_gold, 4, r2=0.0,
                rot=(0, sx * a, 0), parent=ch.hip, coll=c)
    # arms: chainmail sleeves, black gauntlets (skin), studded iron pauldrons
    for piv, side in ((ch.shL, "L"), (ch.shR, "R")):
        arm = O[f"{n}_arm{side}"]
        for sl in arm.material_slots:
            if sl.material and sl.material.name.split(".")[0].endswith("_shirt"):
                sl.material = M_mail
        sx = 1 if side == "L" else -1
        box(f"{n}_paul{side}", (1.3, 1.3, 0.8), (sx * 0.08, 0, 0.32), M_iron, 0.05, parent=piv, coll=c)
        for k in range(3):
            sphere(f"{n}_rivet{side}{k}", 0.06, (sx * 0.08 + (k - 1) * 0.4, -0.66, 0.32), M_gold, parent=piv, coll=c, seg=8)
    # legs: gold greave bands
    for piv, side in ((ch.hpL, "L"), (ch.hpR, "R")):
        for k, z in enumerate((-1.25, -1.55, -1.85)):
            box(f"{n}_grv{side}{k}", (1.02, 1.04, 0.14), (0, 0, z), M_gold if k % 2 == 0 else M_iron, 0.01,
                parent=piv, coll=c)
    ch.blink = lambda *a, **k: None       # no face to blink
    if expr:
        pass
    ch.breathe(0.6)
    return ch
