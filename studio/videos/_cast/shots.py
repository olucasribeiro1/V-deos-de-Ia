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


from blocktopia import zip_, bt_look


def zip_portrait(t0, t1, **kw):
    town_scene()
    E = zip_(t0, t1, "happy", **kw)
    E.pose(t0, loc=(0, -30, 0), rot=0)
    E.act(t0 + 0.2, "wave")
    cam = Cam()
    cam.key(t0, (1.6, -42.5, 3.4), (0, -30, 2.9), lens=32, focus=12.5, fstop=5)
    cam.key(t1, (0.8, -42.0, 3.4), (0, -30, 2.9), lens=32, focus=12.0, fstop=5)
    bt_look()


V.shot(4, 6.0, 8.0, "Zip front")(lambda: zip_portrait(6.0, 8.0))
def zip_three_q(t0, t1):
    town_scene()
    E = zip_(t0, t1, "smile")
    E.pose(t0, loc=(0, -30, 0), rot=-25)
    cam = Cam()
    cam.key(t0, (2.6, -38.6, 4.3), (0, -30, 3.9), lens=42, focus=9.0, fstop=4)
    cam.key(t1, (2.4, -38.2, 4.3), (0, -30, 3.9), lens=42, focus=8.6, fstop=4)
    bt_look()


V.shot(5, 8.0, 10.0, "Zip close 3/4")(lambda: zip_three_q(8.0, 10.0))


from blocktopia import kai_


def kai_front(t0, t1):
    town_scene()
    E = kai_(t0, t1, "happy")
    E.pose(t0, loc=(0, -30, 0), rot=0)
    E.act(t0 + 0.2, "wave")
    cam = Cam()
    cam.key(t0, (1.6, -42.5, 3.4), (0, -30, 2.9), lens=32, focus=12.5, fstop=5)
    cam.key(t1, (0.8, -42.0, 3.4), (0, -30, 2.9), lens=32, focus=12.0, fstop=5)
    bt_look()


def kai_close(t0, t1):
    town_scene()
    E = kai_(t0, t1, "smile")
    E.pose(t0, loc=(0, -30, 0), rot=150)
    cam = Cam()
    cam.key(t0, (2.2, -41.5, 3.6), (0, -30, 2.9), lens=34, focus=11.7, fstop=5)
    cam.key(t1, (1.8, -41.0, 3.6), (0, -30, 2.9), lens=34, focus=11.2, fstop=5)
    bt_look()


V.shot(6, 10.0, 12.0, "Kai front")(lambda: kai_front(10.0, 12.0))
V.shot(7, 12.0, 14.0, "Kai back 3/4")(lambda: kai_close(12.0, 14.0))


from blocktopia import host_, roblox_look


def host_view(t0, t1, yaw, dist=11.0, lens=40, tz=2.6, scene="studio"):
    if scene == "studio":
        world((0.92, 0.93, 0.95), 0.9)
        box("studio_floor", (60, 60, 0.2), (0, -30, -0.1), mat("studio_floor", hexc("#D8D8DA"), 0.8), 0)
        W.sun(3.0, rot=(50, 0, 30))
    else:
        town_scene()
    H = host_(t0, t1)
    H.pose(t0, loc=(0, -30, 0), rot=0)
    tgt = (0, -30, tz)
    cam = Cam()
    cam.push(t0, t1, tgt, dist, dist * 0.97, yaw=yaw, pitch=4, lens=lens, fstop=8)
    roblox_look()


V.shot(8, 14.0, 16.0, "host front")(lambda: host_view(14.0, 16.0, 0))
V.shot(9, 16.0, 18.0, "host side")(lambda: host_view(16.0, 18.0, 90))
V.shot(10, 18.0, 20.0, "host back")(lambda: host_view(18.0, 20.0, 180))
V.shot(11, 20.0, 22.0, "host in town")(lambda: host_view(20.0, 22.0, -15, 15.0, 30, 2.8, "town"))
V.shot(12, 22.0, 24.0, "host close-up")(lambda: host_view(22.0, 24.0, -20, 5.0, 45, 4.7))
