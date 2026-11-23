"""_cast: one portrait shot per protagonist option (hero_A/B/C) on the town street."""
from shotkit import *
from rbx import story
from rbx.story import *

V = Video(__file__)
story.bind(V)
OPTS = ["hero_A", "hero_B", "hero_C"]


def portrait(key, t0, t1):
    town_scene()
    E = from_sheet(key, t0, t1, "happy")
    E.pose(t0, loc=(0, -30, 0), rot=0)
    E.act(t0 + 0.2, "wave")
    cam = Cam()
    cam.key(t0, (1.6, -42.5, 3.4), (0, -30, 2.9), lens=32, focus=12.5, fstop=5)
    cam.key(t1, (0.8, -42.0, 3.4), (0, -30, 2.9), lens=32, focus=12.0, fstop=5)


for i, key in enumerate(OPTS):
    V.shot(i + 1, i * 2.0, i * 2.0 + 2.0, key)(lambda key=key, i=i: portrait(key, i * 2.0, i * 2.0 + 2.0))
