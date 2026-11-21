"""Biblioteca de desenho 2D vetorial (Skia) do estudio: personagens fofos, bichinhos, objetos e cenarios.
Tudo e desenhado a cada quadro (animacao de verdade: bracos, piscadas, boca, pulinhos)."""
import math, os, random
import skia

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TF = skia.Typeface.MakeFromFile(os.path.join(ROOT, "assets", "fonts", "Baloo2.ttf"))
LINE = skia.Color(70, 45, 60)

def C(r, g, b, a=255): return skia.Color(int(r), int(g), int(b), int(a))

def fill(c, aa=True): return skia.Paint(AntiAlias=aa, Color=c, Style=skia.Paint.kFill_Style)
def stroke(c, w, cap=skia.Paint.kRound_Cap):
    return skia.Paint(AntiAlias=True, Color=c, Style=skia.Paint.kStroke_Style, StrokeWidth=w, StrokeCap=cap, StrokeJoin=skia.Paint.kRound_Join)

def _mix(c, f):
    r, g, b, a = skia.ColorGetR(c), skia.ColorGetG(c), skia.ColorGetB(c), skia.ColorGetA(c)
    if f > 0: r, g, b = r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f
    else: r, g, b = r * (1 + f), g * (1 + f), b * (1 + f)
    return skia.Color(int(r), int(g), int(b), a)

SHADE = True
def shape(cv, path, col, lw, shade=None):
    """preenchimento com degrade de luz (topo mais claro, base mais escura) + contorno"""
    b = path.getBounds()
    if (SHADE if shade is None else shade) and b.height() > 6 and skia.ColorGetA(col) == 255:
        p = skia.Paint(AntiAlias=True, Shader=skia.GradientShader.MakeLinear(
            [skia.Point(b.left(), b.top()), skia.Point(b.left() + b.width() * 0.25, b.bottom())], [_mix(col, 0.28), col, _mix(col, -0.12)], [0.0, 0.55, 1.0]))
        cv.drawPath(path, p)
    else:
        cv.drawPath(path, fill(col))
    if lw > 0: cv.drawPath(path, stroke(LINE, lw))

def oval(cv, cx, cy, rx, ry, col, lw=0):
    p = skia.Path(); p.addOval(skia.Rect(cx - rx, cy - ry, cx + rx, cy + ry)); shape(cv, p, col, lw)

def rrect(cv, x0, y0, x1, y1, r, col, lw=0):
    p = skia.Path(); p.addRRect(skia.RRect.MakeRectXY(skia.Rect(x0, y0, x1, y1), r, r)); shape(cv, p, col, lw)

def limb(cv, x0, y0, ang, length, w, col, lw, hand_col=None, hand_r=None):
    """membro arredondado; ang em graus: 0 = para baixo, 90 = para o lado (+x), 180 = para cima"""
    a = math.radians(ang)
    x1, y1 = x0 + math.sin(a) * length, y0 + math.cos(a) * length
    cv.drawLine(x0, y0, x1, y1, stroke(LINE, w + 2 * lw))
    cv.drawLine(x0, y0, x1, y1, stroke(col, w))
    if hand_col is not None:
        oval(cv, x1, y1, hand_r, hand_r, hand_col, lw)
    return x1, y1

# ------------------------------------------------------------------ rosto
def face(cv, s, eye_col, blink=False, mouth=0.0, look=0.0, happy=True, lashes=False):
    lw = s * 0.012
    for sx in (-1, 1):
        ex, ey = sx * s * 0.088 + look * s * 0.01, -s * 0.005
        if blink:
            p = skia.Path(); p.moveTo(ex - s * 0.035, ey); p.quadTo(ex, ey + s * 0.03, ex + s * 0.035, ey)
            cv.drawPath(p, stroke(LINE, lw * 1.2))
        else:
            oval(cv, ex, ey, s * 0.036, s * 0.048, C(40, 25, 35))
            oval(cv, ex, ey + s * 0.012, s * 0.026, s * 0.028, eye_col)
            oval(cv, ex + s * 0.012, ey - s * 0.02, s * 0.013, s * 0.015, C(255, 255, 255))
            oval(cv, ex - s * 0.012, ey + s * 0.018, s * 0.006, s * 0.006, C(255, 255, 255))
            if lashes:
                cv.drawLine(ex + sx * s * 0.03, ey - s * 0.035, ex + sx * s * 0.048, ey - s * 0.05, stroke(LINE, lw * 0.9))
        # sobrancelha
        p = skia.Path(); p.moveTo(ex - s * 0.03, ey - s * 0.075); p.quadTo(ex, ey - s * 0.09, ex + s * 0.03, ey - s * 0.075)
        cv.drawPath(p, stroke(LINE, lw * 0.9))
        oval(cv, sx * s * 0.15, s * 0.055, s * 0.035, s * 0.022, C(255, 120, 140, 150))
    # nariz
    oval(cv, 0, s * 0.04, s * 0.012, s * 0.009, C(200, 110, 100, 200))
    my = s * 0.085
    if mouth > 0.05:
        h = s * (0.02 + 0.045 * mouth); w = s * 0.045
        p = skia.Path(); p.moveTo(-w, my); p.quadTo(0, my - s * 0.01, w, my); p.quadTo(w, my + h * 1.6, 0, my + h * 1.6); p.quadTo(-w, my + h * 1.6, -w, my)
        shape(cv, p, C(150, 40, 60), lw * 0.8)
        oval(cv, 0, my + h * 1.15, w * 0.55, h * 0.35, C(255, 130, 150))
    else:
        p = skia.Path(); p.moveTo(-s * 0.04, my); p.quadTo(0, my + s * 0.045, s * 0.04, my)
        cv.drawPath(p, stroke(LINE, lw))

# ------------------------------------------------------------------ criancas
KIDS = {
    "lulu": dict(skin=C(255, 213, 178), hair=C(120, 62, 35), top=C(255, 105, 160), top2=C(255, 255, 255), bottom=None,
                 shoe=C(240, 70, 120), eye=C(110, 60, 30)),
    "theo": dict(skin=C(196, 136, 96), hair=C(45, 28, 22), top=C(60, 150, 255), top2=C(255, 215, 50), bottom=C(255, 170, 60),
                 shoe=C(240, 90, 60), eye=C(60, 120, 60)),
}

def kid(cv, who, x, y, s, armL=10, armR=10, mouth=0.0, blink=False, tilt=0.0, squash=1.0, look=0.0, legs=0.0):
    """x,y = ponto entre os pes; s = altura total em px. bracos em graus (0 baixo, 180 cima)."""
    k = KIDS[who]; lw = s * 0.012
    cv.save(); cv.translate(x, y); cv.rotate(tilt); cv.scale(1 / math.sqrt(squash), squash)
    # sombra
    cv.save(); cv.scale(1 / squash, 1 / squash * 0 + 1); oval(cv, 0, 0, s * 0.2, s * 0.035, C(0, 0, 0, 45)); cv.restore()
    # pernas
    for sx in (-1, 1):
        lx = sx * s * 0.06
        rrect(cv, lx - s * 0.035, -s * 0.17, lx + s * 0.035, -s * 0.03 - (legs if sx > 0 else 0) * s, s * 0.03, k["skin"], lw)
        oval(cv, lx + sx * s * 0.01, -s * 0.03 - (legs if sx > 0 else 0) * s, s * 0.055, s * 0.03, k["shoe"], lw)
    # bracos (atras do corpo nao; desenhados depois do corpo)
    # corpo
    if who == "lulu":
        p = skia.Path(); p.moveTo(-s * 0.1, -s * 0.44); p.lineTo(s * 0.1, -s * 0.44)
        p.quadTo(s * 0.2, -s * 0.25, s * 0.2, -s * 0.15); p.quadTo(0, -s * 0.12, -s * 0.2, -s * 0.15)
        p.quadTo(-s * 0.2, -s * 0.25, -s * 0.1, -s * 0.44); p.close()
        shape(cv, p, k["top"], lw)
        oval(cv, 0, -s * 0.43, s * 0.07, s * 0.025, k["top2"], lw * 0.7)
        for i in range(3): oval(cv, -s * 0.1 + i * s * 0.1, -s * 0.2, s * 0.018, s * 0.018, C(255, 255, 255, 220))
    else:
        rrect(cv, -s * 0.13, -s * 0.21, s * 0.13, -s * 0.13, s * 0.04, k["bottom"], lw)
        rrect(cv, -s * 0.14, -s * 0.45, s * 0.14, -s * 0.19, s * 0.07, k["top"], lw)
        star(cv, 0, -s * 0.32, s * 0.045, k["top2"], lw * 0.6)
    def arms(up):
        for side, ang in (("L", armL), ("R", armR)):
            if (ang > 95) != up: continue
            sx = 1 if side == "L" else -1
            a = ang if side == "L" else -ang
            limb(cv, sx * s * 0.12, -s * 0.41, a, s * 0.19, s * 0.055, k["skin"], lw, k["skin"], s * 0.037)
            limb(cv, sx * s * 0.12, -s * 0.41, a, s * 0.05, s * 0.075, k["top"], lw * 0.6)
    arms(False)
    # cabeca
    cv.save(); cv.translate(0, -s * 0.66); cv.rotate(-tilt * 0.6)
    hr = s * 0.25
    if who == "lulu":
        for sx in (-1, 1):  # marias-chiquinhas
            oval(cv, sx * hr * 1.05, -hr * 0.25, hr * 0.32, hr * 0.38, k["hair"], lw)
    for sx in (-1, 1):  # orelhas
        oval(cv, sx * hr * 0.98, hr * 0.05, hr * 0.13, hr * 0.16, k["skin"], lw)
    oval(cv, 0, 0, hr, hr * 0.95, k["skin"], lw)
    # cabelo
    p = skia.Path()
    if who == "lulu":
        p.moveTo(-hr * 0.98, hr * 0.05); p.cubicTo(-hr * 1.05, -hr * 1.25, hr * 1.05, -hr * 1.25, hr * 0.98, hr * 0.05)
        p.quadTo(hr * 0.85, -hr * 0.35, hr * 0.5, -hr * 0.42)
        p.quadTo(hr * 0.3, -hr * 0.28, hr * 0.12, -hr * 0.44); p.quadTo(-hr * 0.1, -hr * 0.28, -hr * 0.3, -hr * 0.44)
        p.quadTo(-hr * 0.55, -hr * 0.3, -hr * 0.75, -hr * 0.38); p.quadTo(-hr * 0.9, -hr * 0.2, -hr * 0.98, hr * 0.05)
    else:
        p.moveTo(-hr * 0.97, -hr * 0.05); p.cubicTo(-hr * 1.0, -hr * 1.2, hr * 1.0, -hr * 1.2, hr * 0.97, -hr * 0.05)
        p.quadTo(hr * 0.7, -hr * 0.5, hr * 0.3, -hr * 0.55); p.quadTo(0, -hr * 0.45, -hr * 0.3, -hr * 0.58)
        p.quadTo(-hr * 0.75, -hr * 0.5, -hr * 0.97, -hr * 0.05)
    p.close(); shape(cv, p, k["hair"], lw)
    hl = skia.Path(); hl.moveTo(-hr * 0.55, -hr * 0.72); hl.quadTo(-hr * 0.2, -hr * 0.95, hr * 0.25, -hr * 0.88)
    cv.drawPath(hl, stroke(C(255, 255, 255, 90), hr * 0.07))
    if who == "lulu":
        for sx in (-1, 1):  # lacinhos
            bx, by = sx * hr * 0.95, -hr * 0.62
            for d in (-1, 1): oval(cv, bx + d * hr * 0.13, by, hr * 0.13, hr * 0.09, C(255, 70, 140), lw * 0.7)
            oval(cv, bx, by, hr * 0.06, hr * 0.06, C(255, 200, 220), lw * 0.7)
    else:
        p = skia.Path(); p.moveTo(-hr * 0.05, -hr * 0.9); p.quadTo(hr * 0.15, -hr * 1.35, hr * 0.3, -hr * 1.05)
        p.quadTo(hr * 0.12, -hr * 1.05, hr * 0.1, -hr * 0.88); p.close(); shape(cv, p, k["hair"], lw)
    cv.scale(hr / (s * 0.25), hr / (s * 0.25))
    face(cv, s, k["eye"], blink=blink, mouth=mouth, look=look, lashes=(who == "lulu"))
    cv.restore()
    arms(True)
    cv.restore()

# ------------------------------------------------------------------ objetos
def star(cv, x, y, r, col, lw=0, n=5, rot=0):
    p = skia.Path()
    for i in range(n * 2):
        a = -math.pi / 2 + i * math.pi / n + rot
        rr = r if i % 2 == 0 else r * 0.5
        (p.moveTo if i == 0 else p.lineTo)(x + math.cos(a) * rr, y + math.sin(a) * rr)
    p.close()
    cv.drawPath(p, fill(col))
    if lw: cv.drawPath(p, stroke(LINE, lw))

def cute_face(cv, x, y, r, mouth=0.0):
    lw = r * 0.06
    for sx in (-1, 1):
        oval(cv, x + sx * r * 0.32, y - r * 0.05, r * 0.11, r * 0.14, C(40, 25, 35))
        oval(cv, x + sx * r * 0.32 + r * 0.04, y - r * 0.1, r * 0.04, r * 0.045, C(255, 255, 255))
        oval(cv, x + sx * r * 0.55, y + r * 0.2, r * 0.12, r * 0.07, C(255, 120, 140, 140))
    p = skia.Path(); p.moveTo(x - r * 0.16, y + r * 0.22); p.quadTo(x, y + r * (0.42 + 0.2 * mouth), x + r * 0.16, y + r * 0.22)
    cv.drawPath(p, stroke(LINE, lw))

def sun(cv, x, y, r, t):
    cv.save(); cv.translate(x, y); cv.rotate(t * 20)
    for i in range(12):
        cv.save(); cv.rotate(i * 30)
        p = skia.Path(); p.moveTo(-r * 0.12, -r * 1.1); p.lineTo(0, -r * 1.45); p.lineTo(r * 0.12, -r * 1.1); p.close()
        shape(cv, p, C(255, 170, 40), r * 0.04)
        cv.restore()
    cv.restore()
    g = skia.Paint(AntiAlias=True, Shader=skia.GradientShader.MakeRadial(skia.Point(x, y), r * 2.4, [C(255, 240, 150, 150), C(255, 240, 150, 0)]))
    cv.drawCircle(x, y, r * 2.4, g)
    oval(cv, x, y, r, r, C(255, 215, 60), r * 0.05)
    cute_face(cv, x, y, r)

def moon(cv, x, y, r):
    p = skia.Path(); p.addCircle(x, y, r)
    q = skia.Path(); q.addCircle(x + r * 0.45, y - r * 0.25, r * 0.85)
    m = skia.Op(p, q, skia.PathOp.kDifference_PathOp)
    shape(cv, m, C(255, 236, 150), r * 0.05)
    oval(cv, x - r * 0.45, y + r * 0.05, r * 0.07, r * 0.09, C(40, 25, 35))
    p2 = skia.Path(); p2.moveTo(x - r * 0.6, y + r * 0.35); p2.quadTo(x - r * 0.45, y + r * 0.5, x - r * 0.3, y + r * 0.38)
    cv.drawPath(p2, stroke(LINE, r * 0.05))

def cloud(cv, x, y, w, alpha=255):
    p = skia.Path()
    for dx, dy, r in ((-0.3, 0.05, 0.22), (0, -0.1, 0.32), (0.32, 0.03, 0.24), (-0.1, 0.12, 0.2), (0.15, 0.12, 0.2)):
        q = skia.Path(); q.addCircle(x + dx * w, y + dy * w, r * w); p = skia.Op(p, q, skia.PathOp.kUnion_PathOp)
    shape(cv, p, C(255, 255, 255, alpha), w * 0.012)

def flower(cv, x, y, r, col, sway=0.0):
    cv.drawLine(x, y, x + sway * r, y + r * 2.6, stroke(C(70, 170, 70), r * 0.25))
    for i in range(6):
        a = i / 6 * math.pi * 2
        oval(cv, x + math.cos(a) * r * 0.55, y + math.sin(a) * r * 0.55, r * 0.42, r * 0.42, col, r * 0.06)
    oval(cv, x, y, r * 0.42, r * 0.42, C(255, 215, 60), r * 0.06)

def tree(cv, x, y, s):
    rrect(cv, x - s * 0.08, y - s * 0.55, x + s * 0.08, y, s * 0.04, C(150, 95, 60), s * 0.012)
    p = skia.Path()
    for dx, dy, r in ((0, -0.75, 0.3), (-0.22, -0.6, 0.22), (0.22, -0.6, 0.22), (0, -0.95, 0.2)):
        q = skia.Path(); q.addCircle(x + dx * s, y + dy * s, r * s); p = skia.Op(p, q, skia.PathOp.kUnion_PathOp)
    shape(cv, p, C(90, 200, 90), s * 0.012)
    for dx, dy in ((-0.15, -0.7), (0.12, -0.82), (0.18, -0.6), (-0.05, -0.55)):
        oval(cv, x + dx * s, y + dy * s, s * 0.035, s * 0.035, C(255, 80, 80), s * 0.008)

def heart(cv, x, y, r, col=C(255, 70, 110)):
    p = skia.Path(); p.moveTo(x, y + r * 0.9)
    p.cubicTo(x - r * 1.4, y - r * 0.1, x - r * 0.6, y - r * 1.1, x, y - r * 0.35)
    p.cubicTo(x + r * 0.6, y - r * 1.1, x + r * 1.4, y - r * 0.1, x, y + r * 0.9); p.close()
    shape(cv, p, col, r * 0.06)
    oval(cv, x - r * 0.35, y - r * 0.35, r * 0.12, r * 0.08, C(255, 255, 255, 180))

def rainbow(cv, x, y, r, a=1.0):
    cols = [(255, 90, 90), (255, 160, 60), (255, 225, 70), (100, 210, 100), (80, 160, 255), (170, 110, 240)]
    for i, c in enumerate(cols):
        rr = r * (1 - i * 0.07)
        cv.drawArc(skia.Rect(x - rr, y - rr, x + rr, y + rr), 180, 180, False, stroke(C(*c, 255 * a), r * 0.07, cap=skia.Paint.kButt_Cap))

def sparkle(cv, x, y, r, col=C(255, 245, 150)):
    p = skia.Path(); p.moveTo(x, y - r); p.quadTo(x, y, x + r, y); p.quadTo(x, y, x, y + r); p.quadTo(x, y, x - r, y); p.quadTo(x, y, x, y - r); p.close()
    cv.drawPath(p, fill(col))

# ------------------------------------------------------------------ bichinhos (s = altura aprox.)
def animal(cv, kind, x, y, s, t=0.0, mouth=0.0):
    lw = s * 0.015
    if kind == "sheep":
        for sx in (-1, 1):
            rrect(cv, x + sx * s * 0.15 - s * 0.04, y - s * 0.25, x + sx * s * 0.15 + s * 0.04, y, s * 0.03, C(90, 80, 90), lw)
        p = skia.Path()
        for dx, dy, r in ((-0.2, -0.45, 0.2), (0, -0.55, 0.22), (0.2, -0.45, 0.2), (0, -0.35, 0.22), (-0.15, -0.3, 0.17), (0.15, -0.3, 0.17)):
            q = skia.Path(); q.addCircle(x + dx * s, y + dy * s, r * s); p = skia.Op(p, q, skia.PathOp.kUnion_PathOp)
        shape(cv, p, C(255, 255, 255), lw)
        oval(cv, x, y - s * 0.62, s * 0.17, s * 0.15, C(120, 110, 120), lw)
        for sx in (-1, 1): oval(cv, x + sx * s * 0.2, y - s * 0.66, s * 0.08, s * 0.04, C(120, 110, 120), lw)
        cute_face(cv, x, y - s * 0.62, s * 0.16, mouth)
    elif kind == "lion":
        body(cv, x, y, s, C(255, 190, 70), lw)
        mane = skia.Path()
        for i in range(12):
            a = i / 12 * math.pi * 2; q = skia.Path(); q.addCircle(x + math.cos(a) * s * 0.22, y - s * 0.62 + math.sin(a) * s * 0.22, s * 0.1)
            mane = skia.Op(mane, q, skia.PathOp.kUnion_PathOp)
        shape(cv, mane, C(230, 120, 40), lw)
        oval(cv, x, y - s * 0.62, s * 0.2, s * 0.19, C(255, 200, 90), lw); cute_face(cv, x, y - s * 0.62, s * 0.18, mouth)
    elif kind == "giraffe":
        body(cv, x, y, s * 0.7, C(255, 205, 90), lw)
        rrect(cv, x - s * 0.06, y - s * 0.95, x + s * 0.06, y - s * 0.4, s * 0.05, C(255, 205, 90), lw)
        for dy in (0.5, 0.65, 0.8): oval(cv, x, y - s * dy, s * 0.03, s * 0.025, C(200, 120, 50))
        oval(cv, x, y - s * 1.0, s * 0.14, s * 0.12, C(255, 205, 90), lw)
        for sx in (-1, 1):
            limb(cv, x + sx * s * 0.06, y - s * 1.1, 180 - sx * 15, s * 0.08, s * 0.02, C(200, 120, 50), lw, C(200, 120, 50), s * 0.025)
        cute_face(cv, x, y - s * 1.0, s * 0.13, mouth)
    elif kind == "capybara":
        oval(cv, x, y - s * 0.3, s * 0.38, s * 0.26, C(170, 115, 70), lw)
        oval(cv, x - s * 0.25, y - s * 0.45, s * 0.2, s * 0.18, C(180, 125, 80), lw)
        for sx in (-1, 1): oval(cv, x - s * 0.25 + sx * s * 0.12, y - s * 0.6, s * 0.04, s * 0.04, C(150, 100, 60), lw)
        cute_face(cv, x - s * 0.25, y - s * 0.45, s * 0.17, mouth)
    elif kind == "monkey":
        body(cv, x, y, s, C(150, 95, 60), lw)
        for sx in (-1, 1): oval(cv, x + sx * s * 0.2, y - s * 0.62, s * 0.08, s * 0.08, C(255, 210, 170), lw)
        oval(cv, x, y - s * 0.62, s * 0.2, s * 0.19, C(150, 95, 60), lw)
        oval(cv, x, y - s * 0.58, s * 0.15, s * 0.13, C(255, 210, 170)); cute_face(cv, x, y - s * 0.6, s * 0.16, mouth)
    elif kind == "armadillo":
        oval(cv, x, y - s * 0.25, s * 0.32, s * 0.22, C(190, 170, 160), lw)
        for i in range(4):
            cv.drawLine(x - s * 0.15 + i * s * 0.1, y - s * 0.44, x - s * 0.15 + i * s * 0.1, y - s * 0.08, stroke(C(140, 120, 110), lw))
        oval(cv, x - s * 0.33, y - s * 0.22, s * 0.13, s * 0.11, C(210, 185, 170), lw); cute_face(cv, x - s * 0.33, y - s * 0.22, s * 0.11)
    elif kind == "macaw":
        oval(cv, x, y - s * 0.35, s * 0.15, s * 0.22, C(240, 50, 50), lw)
        p = skia.Path(); p.moveTo(x - s * 0.05, y - s * 0.2); p.lineTo(x, y + s * 0.15); p.lineTo(x + s * 0.05, y - s * 0.2); p.close(); shape(cv, p, C(60, 120, 255), lw)
        flap = math.sin(t * 12) * 30
        for sx in (-1, 1):
            cv.save(); cv.translate(x + sx * s * 0.12, y - s * 0.4); cv.rotate(sx * (20 + flap))
            oval(cv, sx * s * 0.08, 0, s * 0.11, s * 0.05, C(60, 120, 255), lw); cv.restore()
        oval(cv, x, y - s * 0.62, s * 0.14, s * 0.13, C(240, 50, 50), lw)
        oval(cv, x, y - s * 0.6, s * 0.09, s * 0.07, C(255, 255, 255)); cute_face(cv, x, y - s * 0.62, s * 0.12)
        p = skia.Path(); p.moveTo(x - s * 0.03, y - s * 0.56); p.quadTo(x, y - s * 0.45, x + s * 0.03, y - s * 0.56); p.close(); shape(cv, p, C(60, 50, 50), lw)
    elif kind == "bird":  # bem-te-vi
        flap = math.sin(t * 14) * 35
        for sx in (-1, 1):
            cv.save(); cv.translate(x + sx * s * 0.1, y - s * 0.3); cv.rotate(sx * (10 + flap))
            oval(cv, sx * s * 0.13, 0, s * 0.15, s * 0.06, C(150, 100, 60), lw); cv.restore()
        oval(cv, x, y - s * 0.28, s * 0.2, s * 0.18, C(255, 215, 40), lw)
        oval(cv, x, y - s * 0.5, s * 0.15, s * 0.14, C(40, 35, 40), lw)
        cv.drawLine(x - s * 0.13, y - s * 0.5, x + s * 0.13, y - s * 0.5, stroke(C(255, 255, 255), s * 0.03))
        oval(cv, x + s * 0.06, y - s * 0.53, s * 0.03, s * 0.035, C(255, 255, 255)); oval(cv, x + s * 0.06, y - s * 0.53, s * 0.016, s * 0.02, C(30, 20, 30))
        p = skia.Path(); p.moveTo(x + s * 0.13, y - s * 0.52); p.lineTo(x + s * 0.24, y - s * 0.48); p.lineTo(x + s * 0.13, y - s * 0.45); p.close(); shape(cv, p, C(60, 50, 50), lw * 0.6)
    elif kind == "whale":
        p = skia.Path(); p.moveTo(x - s * 0.5, y - s * 0.2); p.cubicTo(x - s * 0.5, y - s * 0.65, x + s * 0.35, y - s * 0.65, x + s * 0.45, y - s * 0.25)
        p.lineTo(x + s * 0.7, y - s * 0.45); p.lineTo(x + s * 0.62, y - s * 0.15); p.lineTo(x + s * 0.7, y + s * 0.0); p.lineTo(x + s * 0.42, y - s * 0.1)
        p.cubicTo(x + s * 0.3, y + s * 0.05, x - s * 0.5, y + s * 0.1, x - s * 0.5, y - s * 0.2); p.close(); shape(cv, p, C(80, 150, 240), lw)
        oval(cv, x - s * 0.1, y - s * 0.08, s * 0.32, s * 0.1, C(200, 230, 255))
        cute_face(cv, x - s * 0.25, y - s * 0.3, s * 0.18, mouth)
        for i, dx in enumerate((-0.05, 0, 0.05)):
            oval(cv, x + dx * s - s * 0.1, y - s * (0.75 + (0.06 if dx == 0 else 0)) - math.sin(t * 6) * s * 0.02, s * 0.035, s * 0.05, C(150, 210, 255), lw * 0.6)
    elif kind == "fish":
        p = skia.Path(); p.moveTo(x + s * 0.2, y); p.lineTo(x + s * 0.4, y - s * 0.15); p.lineTo(x + s * 0.4, y + s * 0.15); p.close(); shape(cv, p, C(255, 140, 40), lw)
        oval(cv, x, y, s * 0.25, s * 0.17, C(255, 160, 50), lw)
        cv.drawLine(x + s * 0.05, y - s * 0.15, x + s * 0.05, y + s * 0.15, stroke(C(255, 255, 255), s * 0.04))
        oval(cv, x - s * 0.12, y - s * 0.04, s * 0.035, s * 0.04, C(40, 25, 35)); oval(cv, x - s * 0.11, y - s * 0.055, s * 0.012, s * 0.012, C(255, 255, 255))

def body(cv, x, y, s, col, lw):
    for sx in (-1, 1):
        rrect(cv, x + sx * s * 0.13 - s * 0.045, y - s * 0.3, x + sx * s * 0.13 + s * 0.045, y, s * 0.03, col, lw)
    oval(cv, x, y - s * 0.32, s * 0.24, s * 0.18, col, lw)

# ------------------------------------------------------------------ cenarios
def grad(cv, w, h, top, bot):
    p = skia.Paint(Shader=skia.GradientShader.MakeLinear([skia.Point(0, 0), skia.Point(0, h)], [top, bot]))
    cv.drawRect(skia.Rect(0, 0, w, h), p)

def hill(cv, w, h, y0, amp, col, ph, lw):
    p = skia.Path(); p.moveTo(-10, h + 10); p.lineTo(-10, y0)
    for i in range(0, 41):
        xx = w * i / 40; yy = y0 - amp * (math.sin(i * 0.35 + ph) * 0.6 + math.sin(i * 0.17 + ph * 2) * 0.4)
        p.lineTo(xx, yy)
    p.lineTo(w + 10, h + 10); p.close(); shape(cv, p, col, lw)

def scenery(cv, w, h, kind, t, cam=0.0):
    """cam: deslocamento horizontal lento (parallax)."""
    s = h / 1080; lw = 3 * s
    night = kind in ("night", "dark")
    if kind == "dark":
        grad(cv, w, h, C(10, 12, 40), C(30, 30, 70))
    elif kind == "night":
        grad(cv, w, h, C(25, 35, 95), C(90, 80, 160))
    elif kind == "under":
        grad(cv, w, h, C(40, 150, 220), C(20, 80, 160))
    elif kind == "savanna":
        grad(cv, w, h, C(120, 200, 255), C(255, 225, 170))
    else:
        grad(cv, w, h, C(110, 195, 255), C(205, 240, 255))
    if night:
        rnd = random.Random(3)
        for i in range(60):
            star(cv, rnd.uniform(0, w), rnd.uniform(0, h * 0.6), (3 + 3 * abs(math.sin(t * 2 + i))) * s, C(255, 245, 180))
    if kind == "under":
        rnd = random.Random(4)
        for i in range(25):
            bx = rnd.uniform(0, w); by = (rnd.uniform(0, h) - t * 60 * s * (1 + i % 3)) % h
            oval(cv, bx, by, 8 * s, 8 * s, C(200, 240, 255, 140), 1.5 * s)
        hill(cv, w, h, h * 0.86, 15 * s, C(250, 220, 150), 1.0, lw)
        rnd = random.Random(6)
        for i in range(8):
            xx = rnd.uniform(0, w); hh = rnd.uniform(120, 260) * s
            p = skia.Path(); p.moveTo(xx, h * 0.88)
            for k in range(6): p.quadTo(xx + (25 if k % 2 else -25) * s + math.sin(t * 2 + i) * 10 * s, h * 0.88 - hh * (k + 0.5) / 6, xx, h * 0.88 - hh * (k + 1) / 6)
            cv.drawPath(p, stroke(C(60, 190, 120), 14 * s))
        return
    if kind == "sea":
        cv.drawRect(skia.Rect(0, h * 0.55, w, h), fill(C(70, 160, 240)))
        for i in range(12):
            xx = (i * 180 * s + t * 30 * s) % (w + 200) - 100
            p = skia.Path(); p.moveTo(xx, h * 0.62 + (i % 3) * 60 * s); p.quadTo(xx + 30 * s, h * 0.6 + (i % 3) * 60 * s, xx + 60 * s, h * 0.62 + (i % 3) * 60 * s)
            cv.drawPath(p, stroke(C(220, 240, 255), 4 * s))
        hill(cv, w, h, h * 0.82, 25 * s, C(255, 225, 150), 0.5, lw)
        hill(cv, w, h, h * 0.9, 20 * s, C(110, 210, 90), 2.0, lw)
        return
    if not night:
        for i, (cx, cy, cw) in enumerate(((0.15, 0.15, 220), (0.55, 0.1, 280), (0.85, 0.22, 200))):
            cloud(cv, (cx * w + t * 12 * s * (1 + i * 0.3) - cam * 0.2) % (w + 300 * s) - 150 * s, cy * h, cw * s)
    far = C(150, 220, 140) if not night else C(60, 90, 120)
    mid = C(110, 205, 95) if not night else C(50, 110, 100)
    near = C(130, 220, 100) if not night else C(60, 130, 100)
    if kind == "savanna":
        far, mid, near = C(220, 210, 120), C(200, 200, 90), C(215, 215, 100)
    hill(cv, w, h, h * 0.58, 40 * s, far, 0.3 + cam * 0.0005, lw)
    if kind in ("meadow", "savanna", "rainbow", "night"):
        for i, xx in enumerate((0.08, 0.3, 0.72, 0.93)):
            tree(cv, xx * w - cam * 0.4, h * 0.66, (150 + 30 * (i % 2)) * s) if kind != "savanna" or i % 2 == 0 else None
    hill(cv, w, h, h * 0.72, 30 * s, mid, 1.7 + cam * 0.001, lw)
    hill(cv, w, h, h * 0.86, 12 * s, near, 3.1 + cam * 0.002, lw)
    if not night:
        rnd = random.Random(7)
        cols = [C(255, 120, 170), C(255, 255, 255), C(200, 140, 255), C(255, 170, 80)]
        for i in range(22):
            xx = rnd.uniform(0, w); yy = rnd.uniform(h * 0.8, h * 0.97)
            flower(cv, xx, yy, rnd.uniform(9, 14) * s, cols[i % 4], math.sin(t * 2 + i) * 0.4)

def text(cv, txt, x, y, size, col=C(255, 255, 255), outline=C(230, 60, 120), center=True, ow=None):
    f = skia.Font(TF, size); f.setEmbolden(True)
    w = f.measureText(txt)
    xx = x - w / 2 if center else x
    blob = skia.TextBlob(txt, f)
    cv.drawTextBlob(blob, xx, y, stroke(outline, ow if ow else size * 0.16))
    cv.drawTextBlob(blob, xx, y, fill(col))
    return w


def butterfly(cv, x, y, s, t, col=C(255, 140, 200)):
    f = abs(math.sin(t * 10))
    for sx in (-1, 1):
        oval(cv, x + sx * s * 0.5 * (0.3 + 0.7 * f), y - s * 0.2, s * 0.45 * (0.3 + 0.7 * f), s * 0.4, col, s * 0.06)
        oval(cv, x + sx * s * 0.35 * (0.3 + 0.7 * f), y + s * 0.25, s * 0.3 * (0.3 + 0.7 * f), s * 0.28, _mix(col, 0.3), s * 0.06)
    rrect(cv, x - s * 0.08, y - s * 0.45, x + s * 0.08, y + s * 0.45, s * 0.08, C(80, 60, 70))

def note(cv, x, y, s, col=C(255, 90, 160)):
    oval(cv, x, y, s * 0.3, s * 0.22, col, s * 0.05)
    cv.drawLine(x + s * 0.27, y, x + s * 0.27, y - s, stroke(col, s * 0.1))
    p = skia.Path(); p.moveTo(x + s * 0.27, y - s); p.quadTo(x + s * 0.7, y - s * 0.8, x + s * 0.55, y - s * 0.45); cv.drawPath(p, stroke(col, s * 0.1))

def vignette(cv, w, h):
    p = skia.Paint(Shader=skia.GradientShader.MakeRadial(skia.Point(w / 2, h / 2), w * 0.75, [C(0, 0, 0, 0), C(0, 0, 0, 0), C(20, 10, 40, 70)], [0, 0.7, 1]))
    cv.drawRect(skia.Rect(0, 0, w, h), p)

def tag(cv, x, y, txt, size):
    f = skia.Font(TF, size); wdt = f.measureText(txt)
    rrect(cv, x - wdt / 2 - size * 0.4, y - size * 0.85, x + wdt / 2 + size * 0.4, y + size * 0.25, size * 0.5, C(255, 255, 255, 235), size * 0.06)
    cv.drawTextBlob(skia.TextBlob(txt, f), x - wdt / 2, y, fill(C(120, 60, 160)))

def light_burst(cv, w, h, t, a):
    cv.save(); cv.translate(w / 2, h * 0.4); cv.rotate(t * 15)
    for i in range(16):
        cv.save(); cv.rotate(i * 22.5)
        p = skia.Path(); p.moveTo(0, 0); p.lineTo(-w * 0.06, -w); p.lineTo(w * 0.06, -w); p.close()
        cv.drawPath(p, fill(C(255, 250, 200, 90 * a)))
        cv.restore()
    cv.restore()
    g = skia.Paint(Shader=skia.GradientShader.MakeRadial(skia.Point(w / 2, h * 0.4), h * 0.6, [C(255, 255, 240, 255 * a), C(255, 250, 200, 0)]))
    cv.drawRect(skia.Rect(0, 0, w, h), g)
