"""lie_head: 'In this town, every time you lie, your head grows one block bigger.' Shots keyed to script words."""
from shotkit import *
from rbx import story
from rbx.story import *
from blocktopia import kai_, roblox_look, grow, head_at
import math, random

V = Video(__file__)
story.bind(V)
DOORS = [(-5.4 + i * 3.6, 11.9) for i in range(4)]   # school_exterior entrance (town)


def teacher_(t0, t1, expr="neutral"):
    return story._live(chars.teacher("Teacher", hair="bun", hair_color="#6b4a35", face="girl", shirt="#c0504d",
                                     pants="#2f3a56", skin="#f0dcc3"), t0, t1, expr)


# ------------------------------------------------------------------ HOOK: giant head stuck in the school door
@S(1, 0, 18, "HOOK: Kai's giant head jammed in the school entrance")
def s01(t0, t1):
    town_scene()
    K = kai_(t0, t1, "terror")
    p = (-1.8, 8.6, 0)
    K.pose(t0, loc=p, rot=0, armL=(150, 25), armR=(150, 25), torso=(0, 12, 0))
    head_at(K, t0, 2.6)
    wiggle = [(t0 + k * 0.18, 8 * (-1) ** k) for k in range(int((t1 - t0) / 0.18))]
    for tt, a in wiggle:
        K.pose(tt, torso=(a, 12, 0))
    cam = Cam()
    cam.push(t0, t1, (-1.8, 8.6, 5.0), 17.0, 13.0, yaw=-12, pitch=6, lens=24, yaw1=6, fstop=6)
    cam.crash(t0, 18, 24, 0.15)
    cam.handheld(1.2)
    sfx(t0, "boing")
    roblox_look()


# ------------------------------------------------------------------ the mayor and his giant head next to his car
@S(9, 48, 63, "Mayor promises roads; his head dwarfs his car")
def s09(t0, t1):
    town_scene()
    M = mayor(t0, t1, "joy")
    M.pose(t0, loc=(1.5, -30, 0), rot=10)
    M.act(t0 + 0.1, "wave")
    head_at(M, t0, 1.0)
    tb = V.t("Now", 1, 50)
    grow(M, tb, 3.2)
    M.face(tb, "shock")
    W.car("mayor_car", (-3.2, -31.0, 0), "#2b2f3a", rot=90)
    cam = Cam()
    cam.push(t0, t1, (0, -30, 4.5), 17.0, 13.0, yaw=-8, pitch=4, lens=26, yaw1=6, fstop=6)
    cam.crash(tb, 26, 20, 0.12)
    cam.handheld(0.9)
    sfx(tb, "boing")
    roblox_look()


# ------------------------------------------------------------------ teacher asks for the homework
@S(14, 99, 109, "Teacher: 'Kai, where is your homework?' over Kai's shoulder")
def s14(t0, t1):
    R, ks = class_scene(t0, t1, kids=8)
    K = kai_(t0, t1, "worried")
    W.sit(K, t0, E_DESK)
    T = teacher_(t0, t1, "angry")
    T.pose(t0, loc=(1.5, 11.2, 0), rot=0)
    T.act(t0 + 0.2, "point")
    lips(T, V.t("Kai,", 1, 100), t1)
    sx, sy = W.seat_pos(E_DESK)[:2]
    cam = Cam()
    cam.key(t0, (sx + 3.4, sy - 4.0, 7.4), (1.5, 11.2, 4.4), lens=28, focus=(1.5, 11.2, 4.4), fstop=3.2)
    cam.key(t1, (sx + 3.0, sy - 3.3, 7.2), (1.5, 11.2, 4.6), lens=30, focus=(1.5, 11.2, 4.6), fstop=3.2)
    cam.handheld(0.8)
    roblox_look()


# ------------------------------------------------------------------ 'It's not that big!' Bonk: head through the ceiling
@S(21, 163, 171, "BONK: Kai's head smashes through the classroom ceiling, kids laughing")
def s21(t0, t1):
    R, ks = class_scene(t0, t1, kids=8)
    K = kai_(t0, t1, "scream")
    W.sit(K, t0, E_DESK)
    head_at(K, t0, 1.9)
    grow(K, t0 + 0.05, 2.6)
    for i, k in enumerate(ks):
        k.face(t0 + 0.2, "joy")
        laugh(k, t0 + 0.2, t1, rate=4 + i % 3)
    sx, sy = W.seat_pos(E_DESK)[:2]
    cam = Cam()
    cam.push(t0, t1, (sx, sy, 7.5), 6.6, 5.8, yaw=166, pitch=-14, lens=15, yaw1=178, fstop=8)
    cam.crash(t0 + 0.05, 12, 15, 0.12)
    cam.handheld(1.3)
    sfx(t0 + 0.05, "bonk")
    sfx(t0 + 0.1, "kids_laugh", 0.6, dur=1.5)
    roblox_look()
