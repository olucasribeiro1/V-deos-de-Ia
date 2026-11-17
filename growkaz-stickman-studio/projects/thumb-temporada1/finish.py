import sys, os
from PIL import Image, ImageDraw
ST='/home/user/V-deos-de-Ia/growkaz-stickman-studio'
src=f'{ST}/projects/thumb-temporada1/build/stills'
out=f'{ST}/out'; sc=os.path.dirname(os.path.abspath(__file__))
files={'A':'0.5s_0.50.png','B':'1.5s_1.50.png','C':'2.5s_2.50.png'}
ims={}
for k,f in files.items():
    im=Image.open(f'{src}/{f}').convert('RGB').resize((1280,720),Image.LANCZOS)
    p=f'{out}/thumb_temporada1_{k}.png'; im.save(p,optimize=True)
    if os.path.getsize(p)>2_000_000: im.save(p.replace('.png','.jpg'),quality=92)
    ims[k]=im; print(k, os.path.getsize(p))
# small-size review: 320x180 and 168x94 each, on YouTube-like dark bg, with fake timestamp
rv=Image.new('RGB',(3*340+20, 180+94+60),'#0f0f0f'); d=ImageDraw.Draw(rv)
for i,k in enumerate('ABC'):
    a=ims[k].resize((320,180),Image.LANCZOS); b=ims[k].resize((168,94),Image.LANCZOS)
    x=20+i*340; rv.paste(a,(x,20)); rv.paste(b,(x,220))
    d.rectangle([x+320-46,20+180-22,x+320-4,20+180-6],fill='#000'); d.text((x+320-42,20+180-21),'16:24',fill='#fff')
rv.save(f'{sc}/review_small.png')
# 3-up comparison
from PIL import ImageFont
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',23); f2=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',18)
names={'A':'A · 30 DIAS NO BUNKER (desafio)','B':'B · ELA SABIA (segredo da mãe)','C':'C · NÃO ABRA! (ameaça no alçapão)'}
W=640; H=360; cmp=Image.new('RGB',(3*W+4*20, H+190),'#141414'); d=ImageDraw.Draw(cmp)
for i,k in enumerate('ABC'):
    x=20+i*(W+20); cmp.paste(ims[k].resize((W,H),Image.LANCZOS),(x,20)); d.text((x,H+36),names[k],fill='#fff',font=F)
    cmp.paste(ims[k].resize((168,94),Image.LANCZOS),(x,H+80)); cmp.paste(ims[k].resize((320,180),Image.LANCZOS).resize((120,68),Image.LANCZOS),(x+190,H+80))
    d.text((x+330,H+100),'168x94 e 120x68',fill='#aaa',font=f2)
cmp.save(f'{out}/thumb_temporada1_comparativo.png',optimize=True)
