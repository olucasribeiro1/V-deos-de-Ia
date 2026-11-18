import subprocess,sys,shlex
D='/home/user/V-deos-de-Ia/assets/sfx/'
OUT=sys.argv[1]; G=float(sys.argv[2]) if len(sys.argv)>2 else 0.0
# measured integrated LUFS per stem
M={'amb-calcadao-ondas-multidao':-20.6,'carro-interior-noite':-32.9,'estalo-trovao':-12.1,'janela-vidro-tremendo':-18.0,
'lock-on-tom':-15.3,'luva-couro-aperto':-44.5,'musica-bed-tensa':-17.3,'pombos-revoada':-18.1,'sonar-ping':-24.6,
'stinger-empate':-14.1,'tablet-beep':-30.1,'teleporte-zap-vacuo':-12.1,'tensao-hit':-12.7,'whoosh-corte-a':-18.9,'whoosh-corte-b':-17.4}
# (stem, start_s, target_lufs, extra filters)
EV=[('musica-bed-tensa',0.0,-32,'afade=t=in:d=0.6,afade=t=out:st=18.6:d=0.7'),
('amb-calcadao-ondas-multidao',0.0,-21,'afade=t=in:d=0.3,afade=t=out:st=2.9:d=1.9'),
('whoosh-corte-a',2.65,-23,''),
('whoosh-corte-b',4.65,-23,''),
('teleporte-zap-vacuo',5.25,-15,''),
('whoosh-corte-a',7.15,-26,''),
('estalo-trovao',7.45,-10,''),
('pombos-revoada',7.65,-19,''),
('janela-vidro-tremendo',7.85,-21,''),
('whoosh-corte-b',9.65,-23,''),
('carro-interior-noite',9.9,-25,'afade=t=in:d=0.4,afade=t=out:st=2.6:d=0.6'),
('tablet-beep',11.5,-21,''),
('whoosh-corte-a',12.65,-23,''),
('sonar-ping',13.3,-20,''),('sonar-ping',13.8,-21,''),('sonar-ping',14.3,-22,''),
('lock-on-tom',15.2,-18,''),
('whoosh-corte-b',15.65,-23,''),
('tensao-hit',16.0,-17,''),
('luva-couro-aperto',16.15,-19,''),
('stinger-empate',17.5,-12,'afade=t=out:st=1.2:d=0.6'),
]
args=['ffmpeg','-y','-v','error']
fc=[]
for i,(n,st,tg,ex) in enumerate(EV):
    args+=['-i',D+n+'.mp3']
    gain=tg-M[n]
    f=f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={gain:.1f}dB'
    if ex: f+=','+ex
    ms=int(st*1000); f+=f',adelay={ms}|{ms}[a{i}]'
    fc.append(f)
fc.append(''.join(f'[a{i}]' for i in range(len(EV)))+f'amix=inputs={len(EV)}:normalize=0:duration=longest,volume={G}dB,alimiter=limit=0.89:attack=3:release=60:level=disabled,afade=t=out:st=19.0:d=0.3,apad,atrim=0:20,asetpts=N/SR/TB[out]')
args+=['-filter_complex',';'.join(fc),'-map','[out]','-ar','48000','-ac','2','-c:a','pcm_s16le',OUT]
open(OUT+'.cmd.txt','w').write(' '.join(shlex.quote(a) for a in args))
subprocess.run(args,check=True)
