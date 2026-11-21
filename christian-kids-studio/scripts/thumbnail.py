"""Thumbnail 1280x720: personagens grandes, cores fortes, titulo curto e legivel no celular."""
import sys, math, skia; sys.path.insert(0, __file__.rsplit('/', 1)[0])
import draw2d as D
from draw2d import C
W, H = 1280, 720
surf = skia.Surface(W, H); cv = surf.getCanvas()
D.scenery(cv, W, H, "rainbow", 2.0)
D.rainbow(cv, W * 0.5, H * 0.95, W * 0.5, 1.0)
D.sun(cv, W * 0.88, H * 0.17, 70, 0.5)
D.animal(cv, "lion", W * 0.1, H * 0.98, 230)
D.animal(cv, "giraffe", W * 0.94, H * 0.99, 260)
D.animal(cv, "whale", W * 0.24, H * 1.0, 200, 0.3)
D.animal(cv, "bird", W * 0.12, H * 0.35, 110, 0.2)
D.kid(cv, "lulu", W * 0.42, H * 1.02, 560, armL=150, armR=150, mouth=1.0)
D.kid(cv, "theo", W * 0.66, H * 1.02, 540, armL=150, armR=20, mouth=1.0)
D.animal(cv, "sheep", W * 0.82, H * 1.0, 170)
for i, (x, y) in enumerate(((0.06, 0.6), (0.94, 0.55), (0.5, 0.42))):
    D.sparkle(cv, W * x, H * y, 22)
D.text(cv, "QUEM FEZ?", W * 0.5, H * 0.2, 118, C(255, 225, 40), C(220, 30, 110), ow=26)
D.text(cv, "FOI DEUS!", W * 0.5, H * 0.38, 118, C(255, 255, 255), C(40, 110, 230), ow=26)
surf.makeImageSnapshot().save(sys.argv[1], skia.kJPEG)
