"""lie_head: 'In this town, every time you lie, your head grows one block bigger.'
29 shots keyed to script word indices (see roblox-studio/lie_head/shotlist.json for the beat list)."""
from shotkit import *
from rbx import story
from rbx.story import *
from blocktopia import kai_, roblox_look, grow, head_at
import math, os, random

V = Video(__file__)
story.bind(V)
TEX = W.TEX
DOOR = (-1.8, 11.45)            # Kai's doorway (school_exterior door 1; columns at x=-3/3, y=5.6)


def L(i, a, b, desc=""):
    """Shot decorator: S() plus the BLOCKTOPIA look pass at the end of every shot."""
    def deco(fn):
        def run(t0, t1):
            fn(t0, t1)
            roblox_look()
        S(i, a, b, desc)(run)
        return fn
    return deco


def wt(i):
    return V.w(i)


def guy(name, t0, t1, expr="neutral", **kw):
    return story._live(chars.Char(name, **kw), t0, t1, expr)


def sister(t0, t1, expr="smile"):
    return guy("Sister", t0, t1, expr, skin="#F2C9A0", hair="bun", hair_color="#5A3A22", shirt="#F07AB0",
               pants="#6B5BD6", face="girl", sleeves="short", scale=0.8)


def teacher_(t0, t1, expr="neutral"):
    return guy("Teacher", t0, t1, expr, hair="bun", hair_color="#6b4a35", face="girl", shirt="#c0504d",
               pants="#2f3a56", skin="#f0dcc3", sleeves="long", vneck="#f4f4f4")


def principal_(t0, t1, expr="angry"):
    return guy("Principal", t0, t1, expr, skin="#e8c4a0", hair="bald", face="mustache", shirt="#5a6270",
               pants="#3a3f48", sleeves="long", extras=("glasses", "collar:#f4f4f4"))


def friend_(t0, t1, expr="joy"):
    return guy("Max", t0, t1, expr, skin="#C68B59", hair="cap", hair_color="#2F6BD8", shirt="#FFD21F",
               pants="#2B2F3A", face="kid", sleeves="short")


def weatherman_(t0, t1, expr="happy"):
    return guy("Weatherman", t0, t1, expr, skin="#f0d2b4", hair="slick", hair_color="#3a2a1e", shirt="#1F4FA8",
               pants="#1a1d24", face="hero", sleeves="long", extras=("collar:#f4f4f4",))


def plate_of_cookies(loc):
    cyl("plate", 0.9, 0.08, loc, mat("plate_w", hexc("#f4f4f4"), 0.6), 24)
    for k in range(4):
        cyl(f"cookie{k}", 0.3, 0.1, (loc[0] + (k - 1.5) * 0.35, loc[1] + (k % 2) * 0.2, loc[2] + 0.1),
            mat("cookie", hexc("#c8894a"), 0.8), 16)


def house_kitchen():
    R = locs.living_room()
    box("kit_counter", (8, 2.4, 3.2), (-10, 6.5, 1.6), mat("counter", hexc("#e8e2d6"), 0.7), 0.06)
    box("kit_top", (8.2, 2.6, 0.25), (-10, 6.5, 3.3), mat("countertop", hexc("#5a5f6a"), 0.6), 0.03)
    plate_of_cookies((-9.0, 6.2, 3.45))
    return R


def stuck_in_door(t0, t1, scale, expr="terror"):
    """Kai's body in the doorway, giant head jammed under the door frame, legs kicking."""
    town_scene()
    for ob in [o for o in bpy.data.objects if o.name.startswith(("se_col", "se_canopy", "se_sign"))]:
        bpy.data.objects.remove(ob, do_unlink=True)        # the canopy shades Kai's face and the columns block the lens
    K = kai_(t0, t1, expr)
    K.pose(t0, loc=(DOOR[0], DOOR[1], 0), rot=0, armL=(150, 30), armR=(150, 30))
    head_at(K, t0, scale)
    k = 0
    t = t0
    while t < t1:
        a = 14 * (-1) ** k
        K.pose(t, legL=(a, 4), legR=(-a, -4), torso=(a * 0.4, 6, 0), armL=(150 + a, 30), armR=(150 - a, 30))
        t += 0.16
        k += 1
    return K


def class_set(t0, t1, kids=8):
    return class_scene(t0, t1, kids=kids, board="chalkboard.png")


def kai_at_desk(t0, t1, expr="neutral", scale=1.0):
    K = kai_(t0, t1, expr)
    W.sit(K, t0, E_DESK)
    head_at(K, t0, scale)
    return K


SEAT = tuple(W.seat_pos(E_DESK))
SZ = SEAT[2] if len(SEAT) > 2 else 0.0


def HEADZ(s):
    return SZ + 4.0 + 0.62 * s


# ================================================================== 1-7: the town and its rule
@L(1, 0, 18, "HOOK: giant head stuck in the school door")
def s01(t0, t1):
    stuck_in_door(t0, t1, 2.5)
    cam = Cam()
    cam.key(t0, (3.0, -6.5, 2.0), (DOOR[0], DOOR[1], 5.6), lens=20, focus=(DOOR[0], DOOR[1], 5.6), fstop=6)
    cam.key(t1, (1.2, 0.5, 3.2), (DOOR[0], DOOR[1], 5.6), lens=24, focus=(DOOR[0], DOOR[1], 5.6), fstop=6)
    cam.crash(wt(13), 24, 34, 0.12)
    cam.handheld(1.4)


@L(2, 18, 32, "Town square: a man lies, his head pops bigger")
def s02(t0, t1):
    town_scene()
    rnd = random.Random(2)
    for i in range(5):
        p = (-14 + i * 6 + rnd.uniform(-1, 1), -36 + rnd.uniform(-3, 3), 0)
        k = townie(20 + i, t0, t1, "happy")
        k.walk(t0, t1, p, (p[0] + rnd.choice((-1, 1)) * 6, p[1], 0))
    M = townie(30, t0, t1, "smug", shirt="#2f8f5a")
    M.pose(t0, loc=(0, -28, 0), rot=0)
    M.act(t0 + 0.1, "shrug")
    head_at(M, t0, 1.0)
    tg = wt(28)
    grow(M, tg, 2.0)
    M.face(tg, "shock")
    cam = Cam()
    cam.key(t0, (10, -60, 26), (0, -28, 2), lens=24)
    cam.key(tg - 0.15, (3, -40, 6), (0, -28, 4.5), lens=26)
    cam.key(t1, (2, -38, 5.5), (0, -28, 5.5), lens=30, focus=(0, -28, 5.5), fstop=5)
    cam.crash(tg, 30, 40, 0.1)
    cam.handheld(0.8)


@L(3, 32, 48, "Kitchen: sister with cookie crumbs lies, BOOP, her head grows")
def s03(t0, t1):
    house_kitchen()
    Sis = sister(t0, t1, "smug")
    Sis.pose(t0, loc=(-6.5, 3.0, 0), rot=-20)
    Sis.act(t0 + 0.2, "cross")
    Mc = mat("cookie", hexc("#c8894a"), 0.8)
    sphere("crumb1", 0.06, (0, -0.64, -0.3), Mc, parent=Sis.head)
    sphere("crumb2", 0.05, (0.2, -0.64, -0.38), Mc, parent=Sis.head)
    lips(Sis, wt(36), wt(44))
    tb = wt(44)
    head_at(Sis, t0, 1.0)
    grow(Sis, tb, 1.8)
    Sis.face(tb, "gasp")
    cam = Cam()
    cam.push(t0, tb, (-6.5, 3.0, 3.6), 9.0, 7.0, yaw=-10, pitch=4, lens=30, yaw1=4, fstop=3.5)
    cam.key(t1, orbit_pos((-6.5, 3.0, 4.6), 7.5, 6, 2), (-6.5, 3.0, 4.6), lens=28, focus=(-6.5, 3.0, 4.6), fstop=3.5)
    cam.crash(tb, 28, 40, 0.1)
    cam.handheld(0.8)


@L(4, 48, 63, "Mayor promises roads; his head ends up bigger than his car")
def s04(t0, t1):
    town_scene()
    card("cityhall", 10, 2.6, (8, -22.5, 9), img_mat("bt_cityhall", os.path.join(TEX, "bt_cityhall.png"), 0.6), "-Y")
    box("podium", (2.4, 1.4, 3.2), (1.5, -30.9, 1.6), mat("podium", hexc("#7a4a2a"), 0.7), 0.05)
    for k in range(5):
        cyl(f"pothole{k}", 0.9, 0.06, (-8 + k * 4, -34 + (k % 2) * 2, 0.05), mat("hole", hexc("#2a2a2a"), 0.9), 16)
    M = mayor(t0, t1, "joy")
    M.pose(t0, loc=(1.5, -30, 0), rot=0)
    M.act(t0 + 0.1, "point")
    lips(M, wt(48), wt(55))
    head_at(M, t0, 1.0)
    tb = wt(55)
    grow(M, tb, 3.2)
    M.face(tb, "shock")
    W.car("mayor_car", (-4.2, -31.0, 0), "#2b2f3a", rot=90)
    cam = Cam()
    cam.key(t0, (2.2, -36.5, 2.2), (1.5, -30, 5.0), lens=24, focus=(1.5, -30, 5), fstop=5)
    cam.key(tb - 0.05, (2.0, -36.0, 2.4), (1.5, -30, 5.2), lens=24, focus=(1.5, -30, 5), fstop=5)
    cam.key(tb + 0.35, (-0.5, -46, 5.5), (-1.0, -30, 4.5), lens=24, focus=(-1, -30, 4.5), fstop=7)
    cam.key(t1, (-0.8, -47, 5.5), (-1.0, -30, 4.5), lens=24, focus=(-1, -30, 4.5), fstop=7)
    cam.handheld(0.9)


@L(5, 63, 73, "Weatherman promises sunshine; his head blocks the sun")
def s05(t0, t1):
    town_scene()
    card("weather_board", 7, 4, (4.5, -27.5, 3.8), img_mat("bt_weather", os.path.join(TEX, "bt_weather.png"), 0.5, emit=0.3), "-Y")
    Wm = weatherman_(t0, t1, "happy")
    Wm.pose(t0, loc=(-1.0, -30, 0), rot=-15)
    Wm.act(t0 + 0.15, "point_l")
    lips(Wm, wt(63), wt(67))
    head_at(Wm, t0, 1.0)
    tb = wt(67)
    grow(Wm, tb, 4.0)
    Wm.face(tb, "gasp")
    cam = Cam()
    cam.key(t0, (1.5, -41, 2.5), (1.5, -28.5, 3.2), lens=26, focus=(1.5, -28.5, 3.2), fstop=5)
    cam.key(tb, (1.0, -42, 2.0), (0.0, -29, 4.5), lens=24, focus=(0, -29, 4.5), fstop=5)
    cam.key(t1, (0.5, -44, 1.2), (-1.0, -30, 9.5), lens=20, focus=(-1, -30, 9), fstop=6)
    cam.handheld(0.8)


@L(6, 73, 82, "Kai's dog with a giant head; Kai shrugs at camera")
def s06(t0, t1):
    town_scene()
    d = W.dog("dog", (-2.2, -30, 0))
    d.rotation_euler[2] = math.radians(20)
    for ob in d.children_recursive:
        if any(k in ob.name.lower() for k in ("head", "ear", "snout", "nose", "eye")):
            ob.scale = tuple(v * 2.2 for v in ob.scale)
    K = kai_(t0, t1, "smug")
    K.pose(t0, loc=(1.8, -30, 0), rot=-10)
    K.act(wt(80), "shrug")
    cam = Cam()
    cam.push(t0, t1, (0, -30, 3.4), 13, 11.5, yaw=6, pitch=6, lens=26, yaw1=-4, fstop=5)
    cam.crash(t0 + 0.05, 20, 26, 0.12)
    cam.handheld(0.7)


@L(7, 82, 93, "Everyone honest and smiling; Kai sweating, side-eye")
def s07(t0, t1):
    town_scene()
    rnd = random.Random(7)
    for i in range(7):
        k = townie(40 + i, t0, t1, "smile")
        k.pose(t0, loc=(-9 + i * 3 + rnd.uniform(-0.4, 0.4), -24 + rnd.uniform(-2, 2), 0), rot=rnd.uniform(-20, 20))
        k.act(t0 + rnd.uniform(0, 0.4), "wave")
    K = kai_(t0, t1, "worried")
    K.pose(t0, loc=(0.5, -33, 0), rot=0)
    K.face(wt(90), "side_l")
    K.face(wt(91), "sus")
    cam = Cam()
    cam.push(t0, t1, (0.5, -33, 4.6), 12, 5.5, yaw=4, pitch=4, lens=28, fstop=3.5)
    cam.handheld(0.7)


# ================================================================== 8-15: the classroom ladder of lies
@L(8, 93, 99, "Classroom morning: Kai digs in an empty backpack")
def s08(t0, t1):
    class_set(t0, t1)
    K = kai_at_desk(t0, t1, "worried")
    story.backpack("kai_bag", (SEAT[0] + 1.2, SEAT[1] - 0.6, 3.2), "#6B2BD9")
    K.pose(t0 + 0.1, armR=(70, -20), armL=(60, 10))
    K.face(wt(96), "scared")
    cam = Cam()
    cam.push(t0, t1, (SEAT[0], SEAT[1], 4.8), 6.5, 5.0, yaw=200, pitch=20, lens=28, yaw1=190, fstop=4)
    cam.handheld(0.8)


@L(9, 99, 109, "Teacher: 'Kai, where is your homework?'")
def s09(t0, t1):
    class_set(t0, t1)
    kai_at_desk(t0, t1, "worried")
    T = teacher_(t0, t1, "angry")
    T.pose(t0, loc=(1.5, 11.2, 0), rot=0)
    T.act(t0 + 0.2, "cross")
    lips(T, wt(104), t1)
    sx, sy = SEAT[:2]
    cam = Cam()
    cam.key(t0, (sx + 3.4, sy - 4.0, 7.4), (1.5, 11.2, 4.4), lens=28, focus=(1.5, 11.2, 4.4), fstop=3.2)
    cam.key(t1, (sx + 2.8, sy - 2.8, 7.0), (1.5, 11.2, 4.7), lens=32, focus=(1.5, 11.2, 4.7), fstop=3.2)
    cam.handheld(0.8)


@L(10, 109, 116, "Kai, fake smile: 'My dog ate it'")
def s10(t0, t1):
    class_set(t0, t1, kids=4)
    K = kai_at_desk(t0, t1, "grin")
    lips(K, wt(112), wt(116))
    K.act(wt(112), "shrug")
    cam = Cam()
    cam.push(t0, t1, (SEAT[0], SEAT[1], HEADZ(1.0)), 5.5, 4.2, yaw=180, pitch=2, lens=34, yaw1=172, fstop=2.8)
    cam.handheld(0.6)


def bonk_shot(t0, t1, sizes, gasp=False, laugh_all=False):
    """Kai at his desk, head growing on each (time, scale); class reacts."""
    R, ks = class_set(t0, t1)
    K = kai_at_desk(t0, t1, "shock", sizes[0][1])
    for t, s in sizes[1:]:
        grow(K, t, s)
        K.face(t, "scream")
        K.act(t, "hands_head")
    for i, k in enumerate(ks):
        if gasp:
            k.face(sizes[1][0] + 0.1, "gasp")
            k.act(sizes[1][0] + 0.1 + i * 0.03, "recoil")
        if laugh_all:
            k.face(t0 + 0.1, "joy")
            laugh(k, t0 + 0.1, t1, rate=4 + i % 3)
    return K, ks


@L(11, 116, 126, "BONK! head grows one block; whole class gasps")
def s11(t0, t1):
    tb = wt(116)
    bonk_shot(t0, t1, [(t0, 1.0), (tb, 1.4)], gasp=True)
    sx, sy = SEAT[:2]
    tw = wt(122)
    a0 = orbit_pos((sx, sy, HEADZ(1.2)), 6.0, 180, 4)
    cam = Cam()
    cam.key(t0, a0, (sx, sy, HEADZ(1.2)), lens=26)
    cam.crash(tb, 26, 40, 0.1)
    cam.whip(tw, tw + 0.14, a0, (sx, sy, HEADZ(1.4)), (sx + 6, sy + 5, 6.5), (-2, -2, 4.0), lens=22)
    cam.key(t1, (sx + 6.5, sy + 5.5, 6.8), (-2, -2, 4.0), lens=22)
    cam.handheld(1.0)


@L(12, 126, 134, "'A dinosaur ate it!' BONK, bigger")
def s12(t0, t1):
    tb = wt(132)
    bonk_shot(t0, t1, [(t0, 1.4), (tb, 1.9)])
    cam = Cam()
    cam.push(t0, t1, (SEAT[0], SEAT[1], HEADZ(1.7)), 7.0, 6.0, yaw=165, pitch=2, lens=26, yaw1=175, fstop=4)
    cam.crash(tb, 26, 36, 0.1)
    cam.handheld(1.3)


@L(13, 134, 142, "'A dinosaur riding a dragon!' BONK BONK BONK")
def s13(t0, t1):
    sizes = [(t0, 1.9), (wt(139), 2.4), (wt(140), 2.9), (wt(141), 3.5)]
    bonk_shot(t0, t1, sizes)
    sx, sy = SEAT[:2]
    cam = Cam()
    for k, (t, s) in enumerate(sizes):
        cam.key(t, orbit_pos((sx, sy, HEADZ(s)), 5.5 + k * 1.6, 180 + (-1) ** k * 8, -2 - k * 3),
                (sx, sy, HEADZ(s)), lens=26, focus=(sx, sy, HEADZ(s)), fstop=5)
    cam.key(t1, orbit_pos((sx, sy, HEADZ(3.5)), 11, 180, -12), (sx, sy, HEADZ(3.5)), lens=22)
    cam.handheld(1.2)


@L(14, 142, 157, "Head as big as a fridge; headphones snap off; kids laugh and point")
def s14(t0, t1):
    K, ks = bonk_shot(t0, t1, [(t0, 3.5)], laugh_all=True)
    K.face(t0, "cry")
    ts = wt(153)
    O = bpy.data.objects
    for nm in [o.name for o in O if o.name.startswith(("Kai_hpcup", "Kai_hppad"))]:
        ob = O[nm]
        ob.keyframe_insert("location", frame=F(ts))
        sx_ = 1 if ob.location[0] > 0 else -1
        ob.location = (ob.location[0] + sx_ * 2.5, ob.location[1] - 1.0, ob.location[2] + 1.2)
        ob.keyframe_insert("location", frame=F(ts + 0.35))
    for k in ks[:4]:
        k.act(wt(154) + 0.1, "point")
    cam = Cam()
    cam.push(t0, t1, (SEAT[0], SEAT[1], 6.8), 6.6, 6.0, yaw=170, pitch=-10, lens=15, yaw1=182, fstop=8)
    cam.crash(ts, 18, 22, 0.1)
    cam.handheld(1.0)
    sfx(ts, "pop")


@L(15, 157, 171, "'It's not that big!' BONK: head smashes through the ceiling")
def s15(t0, t1):
    tb = wt(163)
    K, ks = bonk_shot(t0, t1, [(t0, 3.5), (tb, 4.6)], laugh_all=True)
    K.face(t0, "furious")
    lips(K, wt(157), wt(162))
    sx, sy = SEAT[:2]
    rnd = random.Random(15)
    Md = mat("ceil_bits", hexc("#e8e4da"), 0.8)
    for i in range(10):
        ob = box(f"debris{i}", (0.6, 0.6, 0.15), (sx + rnd.uniform(-2.5, 2.5), sy + rnd.uniform(-2.5, 2.5), 12.3), Md, 0.02)
        ob.keyframe_insert("location", frame=F(tb))
        ob.keyframe_insert("rotation_euler", frame=F(tb))
        ob.location = (ob.location[0] + rnd.uniform(-1.5, 1.5), ob.location[1] + rnd.uniform(-1.5, 1.5), 0.2)
        ob.rotation_euler = (rnd.uniform(-2, 2), rnd.uniform(-2, 2), 0)
        ob.keyframe_insert("location", frame=F(tb + 0.7))
        ob.keyframe_insert("rotation_euler", frame=F(tb + 0.7))
    cam = Cam()
    cam.push(t0, t1, (sx, sy, 7.5), 6.6, 5.8, yaw=166, pitch=-14, lens=15, yaw1=178, fstop=8)
    cam.crash(tb, 12, 15, 0.12)
    cam.handheld(1.6)


# ================================================================== 16-20: the town sees it; stuck again
def giant_on_roof(t0, t1):
    town_scene()
    K = kai_(t0, t1, "cry")
    K.pose(t0, loc=(0, 18, 17.0), rot=0)
    head_at(K, t0, 9.0)
    return K


@L(16, 171, 182, "Giant head out of the school roof; birds land; airplane swerves")
def s16(t0, t1):
    giant_on_roof(t0, t1)
    for i in range(3):
        b = W.pigeon(f"bird{i}", (-2 + i * 2, 17 + i * 0.5, 40))
        b.scale = (2.0,) * 3
        b.keyframe_insert("location", frame=F(t0))
        b.location = (-2 + i * 2.2, 17.5, 29.6)
        b.keyframe_insert("location", frame=F(t0 + 1.0 + i * 0.3))
    pl = W2.airliner("plane", (60, 90, 48), rot=200, scale=0.8)
    pl.keyframe_insert("location", frame=F(wt(176)))
    pl.keyframe_insert("rotation_euler", frame=F(wt(176)))
    pl.location = (95, 40, 58)
    pl.rotation_euler = (0, math.radians(-45), math.radians(250))
    pl.keyframe_insert("location", frame=F(t1))
    pl.keyframe_insert("rotation_euler", frame=F(t1))
    cam = Cam()
    cam.orbit(t0, t1, (0, 18, 26), 34, -35, 25, pitch=10, lens=24, fstop=11)
    cam.handheld(0.6)


@L(17, 182, 195, "Best friend takes a selfie with the giant head: a million likes")
def s17(t0, t1):
    giant_on_roof(t0, t1)
    Fr = friend_(t0, t1, "joy")
    Fr.pose(t0, loc=(2.0, -2.0, 0), rot=180)
    Fr.act(t0 + 0.1, "phone")
    ph = card("phone_scr", 1.6, 2.85, (3.0, -6.5, 6.0), img_mat("bt_phone", os.path.join(TEX, "bt_phone_likes.png"), 0.4, emit=1.2), "-Y")
    ph.scale = (0.01,) * 3
    ph.keyframe_insert("scale", frame=F(wt(192) - 0.05))
    ph.scale = (1,) * 3
    ph.keyframe_insert("scale", frame=F(wt(192) + 0.1))
    cam = Cam()
    cam.key(t0, (2.8, -12, 3.2), (1.0, 10, 18), lens=24, focus=(2, -2, 4.5), fstop=8)
    cam.key(t1, (3.0, -10.5, 4.6), (2.0, 6, 13), lens=24, focus=(3, -6.5, 6), fstop=8)
    cam.handheld(0.7)
    sfx(wt(192), "ding")


@L(18, 195, 208, "Kai runs home, but the head jams in the school door again")
def s18(t0, t1):
    stuck_in_door(t0, t1, 2.5, "scream")
    cam = Cam()
    cam.push(t0, t1, (DOOR[0], DOOR[1], 5.4), 15.5, 11.0, yaw=-10, pitch=4, lens=22, yaw1=-4, fstop=6)
    cam.crash(wt(203), 22, 30, 0.12)
    cam.handheld(1.2)


@L(19, 208, 217, "Principal runs up: 'Kai, just tell the truth!'")
def s19(t0, t1):
    stuck_in_door(t0, t1, 2.5, "worried")
    P = principal_(t0, t1, "angry")
    P.run(t0, wt(212), (12, -10, 0), (3.2, 7.5, 0))
    P.pose(wt(212) + 0.05, loc=(3.2, 7.5, 0), rot=facing((3.2, 7.5), DOOR))
    P.act(wt(212) + 0.05, "point")
    lips(P, wt(212), t1)
    cam = Cam()
    cam.key(t0, (14, -14, 4.5), (8, -2, 3.5), lens=24)
    cam.key(wt(212), (8, -2, 5.0), (0.5, 9.5, 4.5), lens=26, focus=(3.2, 7.5, 4.6), fstop=5)
    cam.key(t1, (7.4, -1.2, 5.0), (0.5, 9.5, 4.8), lens=28, focus=(3.2, 7.5, 4.6), fstop=5)
    cam.handheld(1.0)


@L(20, 217, 232, "Kai scared, eyes shaking: 'I'd be in SO much trouble'")
def s20(t0, t1):
    K = stuck_in_door(t0, t1, 2.5, "scared")
    for k in range(int((t1 - t0) / 0.12)):
        K.face(t0 + k * 0.12, "scared" if k % 2 else "worried")
    hz = 4.0 + 0.62 * 2.5
    cam = Cam()
    cam.push(t0, t1, (DOOR[0], DOOR[1] - 1.0, hz), 10.0, 8.0, yaw=0, pitch=0, lens=40, fstop=2.8)
    cam.handheld(1.8)


# ================================================================== 21-29: the truth
@L(21, 232, 249, "Flashback: sister says sorry, POP, her head shrinks back")
def s21(t0, t1):
    house_kitchen()
    Sis = sister(t0, t1, "cry")
    Sis.pose(t0, loc=(-6.5, 3.0, 0), rot=-20)
    head_at(Sis, t0, 1.8)
    lips(Sis, wt(236), wt(243))
    Sis.act(wt(238), "facepalm")
    tp = wt(248)
    grow(Sis, tp, 1.0)
    Sis.face(tp, "joy")
    Sis.act(tp, "cheer")
    cam = Cam()
    cam.push(t0, t1, (-6.5, 3.0, 4.2), 8.5, 7.0, yaw=8, pitch=4, lens=28, yaw1=-6, fstop=3.5)
    cam.crash(tp, 28, 22, 0.12)
    cam.handheld(0.7)


def truth_shot(t0, t1, s0, pops, expr="determined"):
    K = stuck_in_door(t0, t1, s0, expr)
    for t, s in pops:
        grow(K, t, s)
        K.face(t, "joy")
    return K


@L(22, 249, 254, "Lightbulb: 'The truth makes it smaller!'")
def s22(t0, t1):
    K = truth_shot(t0, t1, 2.5, [], "shock")
    K.face(t0 + 0.2, "joy")
    bulb = sphere("idea_bulb", 0.6, (DOOR[0], DOOR[1] - 0.5, 9.2),
                  mat("bulb", hexc("#ffe46a"), 0.3, emit=hexc("#ffe46a"), estr=6))
    bulb.scale = (0.01,) * 3
    bulb.keyframe_insert("scale", frame=F(t0 + 0.1))
    bulb.scale = (1.0,) * 3
    bulb.keyframe_insert("scale", frame=F(t0 + 0.3))
    cam = Cam()
    cam.push(t0, t1, (DOOR[0], DOOR[1], 6.5), 10.0, 7.0, yaw=0, pitch=4, lens=30, fstop=4)
    cam.handheld(0.6)


@L(23, 254, 260, "Kai takes a deep breath")
def s23(t0, t1):
    K = truth_shot(t0, t1, 2.5, [], "relief")
    K.pose(t0 + 0.2, torso=(0, -12, 0), armL=(20, 40), armR=(20, 40))
    cam = Cam()
    cam.push(t0, t1, (DOOR[0], DOOR[1], 5.2), 11.0, 9.5, yaw=12, pitch=6, lens=32, fstop=3.5)
    cam.handheld(0.5)


@L(24, 260, 272, "'I didn't do my homework, I played video games all night' POP")
def s24(t0, t1):
    K = truth_shot(t0, t1, 2.5, [(wt(271), 2.1)])
    lips(K, wt(260), wt(271))
    cam = Cam()
    cam.push(t0, t1, (DOOR[0], DOOR[1], 5.2), 9.0, 7.5, yaw=-14, pitch=4, lens=28, yaw1=-8, fstop=4)
    cam.crash(wt(271), 28, 22, 0.1)
    cam.handheld(0.7)


@L(25, 272, 281, "'I ate the last slice of pizza' POP")
def s25(t0, t1):
    K = truth_shot(t0, t1, 2.1, [(wt(280), 1.7)])
    lips(K, wt(272), wt(280))
    cam = Cam()
    cam.push(t0, t1, (DOOR[0], DOOR[1], 5.0), 8.0, 7.0, yaw=14, pitch=4, lens=28, yaw1=8, fstop=4)
    cam.crash(wt(280), 28, 22, 0.1)
    cam.handheld(0.7)


@L(26, 281, 292, "'I broke the window!' POP POP POP, he pops free")
def s26(t0, t1):
    K = truth_shot(t0, t1, 1.7, [(wt(289), 1.4), (wt(290), 1.2), (wt(291), 1.0)])
    lips(K, wt(281), wt(289))
    tf = wt(291) + 0.15
    K.pose(tf, loc=(DOOR[0], DOOR[1], 0))
    K.pose(min(t1, tf + 0.5), loc=(DOOR[0], DOOR[1] - 3.5, 0), armL=(120, 40), armR=(120, 40))
    cam = Cam()
    cam.push(t0, t1, (DOOR[0], DOOR[1] - 1.5, 4.0), 14.0, 12.0, yaw=0, pitch=6, lens=24, fstop=6)
    for t in (wt(289), wt(290), wt(291)):
        cam.crash(t, 24, 21, 0.08)
    cam.handheld(0.8)


@L(27, 292, 306, "Everybody cheers, confetti; sister hands him a cookie")
def s27(t0, t1):
    town_scene()
    K = kai_(t0, t1, "joy")
    K.pose(t0, loc=(0, -2, 0), rot=0)
    K.act(t0 + 0.1, "cheer")
    rnd = random.Random(27)
    for i in range(8):
        k = townie(60 + i, t0, t1, "joy")
        a = math.radians(-70 + i * 20)
        p = (math.sin(a) * 6, 5 - math.cos(a) * 6)
        k.pose(t0, loc=(p[0], p[1], 0), rot=facing(p, (0, -2)))
        k.act(t0 + rnd.uniform(0, 0.3), "cheer")
        k.jump(t0 + rnd.uniform(0.2, 0.8), 1.2)
    Sis = sister(t0, t1, "smile")
    Sis.pose(t0, loc=(2.2, -4.0, 0), rot=facing((2.2, -4.0), (0, -2)))
    Sis.act(wt(299), "reach")
    confetti("conf", (0, -2, 12), (8, 8, 2), t0 + 0.1)
    cam = Cam()
    cam.key(t0, (0.5, -14, 3.0), (0, -2, 4), lens=22, focus=(0, -2, 4), fstop=6)
    cam.key(t1, (0.5, -16, 11.0), (0, -2, 3), lens=22, focus=(0, -2, 4), fstop=6)
    cam.handheld(0.7)


@L(28, 306, 320, "Teacher: 'Thank you for the truth, Kai. Now you have double homework.'")
def s28(t0, t1):
    class_set(t0, t1)
    kai_at_desk(t0, t1, "happy")
    tp = (SEAT[0] - 0.5, SEAT[1] + 3.2)
    T = teacher_(t0, t1, "smile")
    T.pose(t0, loc=(tp[0], tp[1], 0), rot=facing(tp, SEAT[:2]))
    lips(T, wt(309), wt(320))
    td = wt(315)
    Mp = mat("paper", hexc("#f6f6f2"), 0.8)
    for i in range(10):
        ob = box(f"hw{i}", (1.6, 2.1, 0.12), (SEAT[0] + 0.2, SEAT[1] + 1.3, 14 + i * 0.13), Mp, 0.01)
        ob.keyframe_insert("location", frame=F(td))
        ob.location = (SEAT[0] + 0.2, SEAT[1] + 1.3, 3.0 + i * 0.13)
        ob.keyframe_insert("location", frame=F(td + 0.25))
    cam = Cam()
    cam.key(t0, (SEAT[0] + 4, SEAT[1] - 2.5, 6.0), (tp[0], tp[1], 4.4), lens=28, focus=(tp[0], tp[1], 4.4), fstop=4)
    cam.key(td, (SEAT[0] + 3.6, SEAT[1] - 2.0, 6.4), (tp[0], tp[1], 4.6), lens=28)
    cam.key(t1, (SEAT[0] + 3.4, SEAT[1] - 1.5, 7.4), (SEAT[0], SEAT[1] + 1.3, 3.2), lens=26)
    cam.handheld(0.7)
    sfx(td + 0.25, "thud")


@L(29, 320, None, "'I love homework!' BONK, head grows again, freeze")
def s29(t0, t1):
    class_set(t0, t1, kids=4)
    K = kai_at_desk(t0, t1, "grin", 1.0)
    lips(K, wt(320), wt(326))
    tb = wt(326)
    grow(K, tb, 1.4)
    K.face(tb, "shock")
    sx, sy = SEAT[:2]
    cam = Cam()
    cam.push(t0, tb, (sx, sy, HEADZ(1.0)), 5.5, 4.4, yaw=180, pitch=2, lens=32, fstop=2.8)
    cam.key(t1, orbit_pos((sx, sy, HEADZ(1.4)), 4.4, 180, 2), (sx, sy, HEADZ(1.4)), lens=32)
    cam.crash(tb, 32, 48, 0.1)
