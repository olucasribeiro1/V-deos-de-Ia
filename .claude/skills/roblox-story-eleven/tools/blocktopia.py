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


# Kai: tan skin, messy brown hair, big red/white headphones, teal hoodie, blue jeans.
KAI = dict(skin="#F2C9A0", hair="messy", hair_color="#5A3A22", shirt="#16A99A", pants="#3F6FC4",
           face="kid", sleeves="long", vneck="#F4F4F4")


def headphones(ch, cup="#E0231C", band="#F4F4F4"):
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
    return story._live(ch, t0, t1, expr)
