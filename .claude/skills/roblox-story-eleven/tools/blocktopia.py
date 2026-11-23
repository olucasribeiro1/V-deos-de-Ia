"""Blocktopia house style (runs inside Blender; import from a video's shots.py).

    from blocktopia import zip_, bt_look
    Z = zip_(t0, t1, "happy")      # the channel's fixed protagonist
    ...build the set and camera...
    bt_look()                      # call LAST in every shot: crisp sun shadows like a blocky-game sandbox
"""
import math
import bpy
from rbx import story, chars

ZIP = dict(skin="#F5CD2F", hair="spiky", hair_color="#7CFF3A", shirt="#FF7A1A", pants="#5B2A86",
           face="hero", sleeves="short", bolt="#FFE234")


def zip_(t0, t1, expr="happy", name="Zip", **kw):
    """Zip, the Blocktopia protagonist. kw overrides any Char argument for one shot."""
    a = dict(ZIP)
    a.update(kw)
    if "extras" in a:
        a["extras"] = tuple(a["extras"])
    return story._live(chars.Char(name, **a), t0, t1, expr)


def bt_look(sun_angle=1.0, sun_boost=1.25):
    """Hard-edged sun shadows and a slightly stronger sun: the bright sandbox daylight of the format."""
    for o in bpy.data.objects:
        if o.type == "LIGHT" and o.data.type == "SUN":
            o.data.angle = math.radians(sun_angle)
            o.data.energy *= sun_boost
