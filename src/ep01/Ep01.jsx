import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { tl, trilha, ramp, ruido, clamp, b } from './tempo.js';
import { CAMERA, T } from './cena.js';
import { Cenario } from './Cenario.jsx';
import { Nelson } from './Nelson.jsx';

const FONTE = 'Inter, "DejaVu Sans", sans-serif';
const MONO = '"JetBrains Mono", "DejaVu Sans Mono", monospace';

// ---------------- câmera ----------------
const tremorEm = (t) => {
  let k = 0;
  for (const e of tl.eventos) if (e.tipo === 'tremor' && t >= e.start && t <= e.end) k = Math.max(k, 1);
  k = Math.max(k, Math.exp(-Math.max(0, t - T.apagao) * 3) * (t >= T.apagao ? 1.5 : 0)); // solavanco do apagão
  k = Math.max(k, ramp(t, T.coracao, T.coracao + 3) * 0.35, ramp(t, b('porta', 0.5), b('porta', 0.9)) * 0.5);
  return k;
};
const Camera = ({ t }) => {
  const { camera } = useThree();
  const p = trilha(CAMERA, t), alvo = trilha(CAMERA, t, 'alvo'), fov = trilha(CAMERA, t, 'fov');
  const k = tremorEm(t) * 0.025;
  // leve "câmera na mão" sempre + tremor nos momentos de tensão
  const hx = ruido(t, 0.25) * 0.012 + ruido(t + 9, 1.6) * k, hy = ruido(t + 3, 0.22) * 0.01 + ruido(t + 4, 1.9) * k;
  camera.position.set(p[0] + hx, p[1] + hy, p[2]);
  camera.fov = fov; camera.near = 0.03; camera.far = 900;
  camera.updateProjectionMatrix();
  camera.lookAt(alvo[0] + hx * 0.5, alvo[1] + hy * 0.5, alvo[2]);
  return null;
};

// ---------------- luzes ----------------
const Luzes = ({ t }) => {
  const ap = t >= T.apagao;
  const tvFlick = 0.8 + ruido(t, 0.6) * 0.25;
  return (
    <>
      <hemisphereLight args={[ap ? '#5a6d9e' : '#ffe6c4', ap ? '#141826' : '#5a4a3a', ap ? 0.55 : 1.0]} />
      <directionalLight position={[-30, 40, 12]} intensity={ap ? 1.1 : 0.5} color="#8ea6e6" />
      <pointLight position={[0, 2.4, -0.5]} intensity={ap ? 0 : 9} distance={12} decay={1.2} color="#ffdca3" />
      <pointLight position={[6.5, 2.4, 0]} intensity={ap ? 0 : 5} distance={8} decay={1.2} color="#ffdca3" />
      <pointLight position={[-2.2, 2.4, 5]} intensity={ap ? 0 : 6} distance={8} decay={1.2} color="#fff1d6" />
      <pointLight position={[1.8, 2.4, 5]} intensity={ap ? 0 : 6} distance={8} decay={1.2} color="#fff1d6" />
      <pointLight position={[0, 1.3, -3.2]} intensity={ap ? 0 : 4 * tvFlick} distance={6} decay={1.5} color="#7fc8ff" />
      {/* luz de emergência do hall entrando pela fresta da porta */}
      <pointLight position={[8.6, 0.15, 0]} intensity={ap ? 0.9 : 0} distance={2.5} decay={2} color="#b9ccff" />
      {/* brilho da cidade antes do apagão */}
      <pointLight position={[-19, -14, 0]} intensity={ap ? 0 : 60} distance={45} decay={1} color="#ffb547" />
    </>
  );
};

// ---------------- áudio ----------------
const vozAtiva = (t) => tl.falas.some((f) => t >= f.start - 0.1 && t <= f.end + 0.1);
const Audios = ({ fps }) => {
  const total = tl.total;
  const sfx = tl.sfx.filter((s) => s.id !== 'drone');
  return (
    <>
      {tl.falas.map((f) => (
        <Sequence key={f.id} from={Math.round(f.start * fps)} durationInFrames={Math.ceil((f.end - f.start) * fps) + 3}>
          <Audio src={staticFile(f.arquivo)} volume={1} />
        </Sequence>
      ))}
      {/* trilha de suspense: cresce ao longo do episódio e abaixa sob a voz */}
      <Sequence from={0} durationInFrames={Math.ceil(total * fps)}>
        <Audio src={staticFile('ep01/sfx/drone.mp3')} loop
          volume={(f) => { const t = f / fps; return (0.12 + 0.3 * clamp(t / total)) * (vozAtiva(t) ? 0.6 : 1) * (1 - ramp(t, total - 1.2, total)); }} />
      </Sequence>
      {sfx.map((s, i) => {
        let fim = s.end ?? s.start + s.dur;
        if (s.id === 'tv_jogo') fim = T.apagao; // a TV morre no apagão
        if (!s.loop && !s.end) fim = Math.min(fim, s.start + s.dur);
        const dur = Math.max(1, Math.round((fim - s.start) * fps));
        const loop = s.loop || s.id === 'tv_jogo';
        return (
          <Sequence key={i} from={Math.round(s.start * fps)} durationInFrames={dur}>
            <Audio src={staticFile(s.arquivo)} loop={loop}
              volume={(f) => {
                const t = f / fps, d = dur / fps;
                const duck = vozAtiva(s.start + t) && !['apagao', 'arrasto', 'coracao'].includes(s.id) ? 0.7 : 1;
                return s.vol * duck * clamp(t / 0.05) * clamp((d - t) / (s.id === 'cachorro' || s.id === 'tv_jogo' ? 0.04 : 0.4));
              }} />
          </Sequence>
        );
      })}
    </>
  );
};

// ---------------- legendas (palavra por palavra) ----------------
const blocos = (() => {
  const out = [];
  for (const f of tl.falas) {
    let atual = [];
    f.palavras.forEach((p, i) => {
      atual.push(p);
      const fimFrase = /[.,:!?—]$/.test(p.w) || /\.\.\.$/.test(p.w);
      if (atual.length >= 3 || fimFrase || i === f.palavras.length - 1) { out.push({ voz: f.voz, ps: atual }); atual = []; }
    });
  }
  return out.map((bl, i) => ({ ...bl, s: bl.ps[0].s, e: Math.min(bl.ps.at(-1).e + 0.25, out[i + 1]?.ps[0].s ?? 1e9) }));
})();
const Legenda = ({ t }) => {
  const bl = blocos.find((x) => t >= x.s && t < x.e);
  if (!bl) return null;
  const cor = bl.voz === 'marisa' ? '#ff9ec7' : bl.voz === 'radio' ? '#9ef0ff' : '#ffffff';
  const pop = 0.85 + 0.15 * clamp((t - bl.s) / 0.08);
  return (
    <div style={{ position: 'absolute', top: 1290, width: '100%', textAlign: 'center', padding: '0 70px', boxSizing: 'border-box', transform: `scale(${pop})` }}>
      {bl.voz !== 'nelson' && <div style={{ fontFamily: MONO, fontSize: 30, color: cor, letterSpacing: 4, marginBottom: 10 }}>{bl.voz === 'marisa' ? '☎ MARISA · CAIXA POSTAL' : '📻 RÁDIO · 98.1 FM'}</div>}
      <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 76, lineHeight: 1.1, textTransform: 'uppercase',
        fontStyle: bl.voz !== 'nelson' ? 'italic' : 'normal', WebkitTextStroke: '3px #000', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,.8)' }}>
        {bl.ps.map((p, i) => (
          <span key={i} style={{ color: t >= p.s && t < p.e + 0.05 ? '#ffd23f' : cor, marginRight: 18 }}>{p.w.replace(/\.\.\.$/, '…')}</span>
        ))}
      </div>
    </div>
  );
};

// ---------------- overlays (dados na tela) ----------------
const Overlay = ({ o, t, i = 0 }) => {
  const k = clamp((t - o.start) / 0.18), sai = clamp((o.end - t) / 0.15);
  const op = Math.min(k, sai);
  const base = { position: 'absolute', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: op,
    transform: `translateY(${(1 - k) * -30}px) scale(${0.9 + 0.1 * k})` };
  if (o.regra) return (
    <div style={{ ...base, top: 250 }}>
      <div style={{ background: '#d7261e', color: '#fff', fontFamily: MONO, fontWeight: 800, fontSize: 40, padding: '8px 22px', letterSpacing: 6 }}>{o.regra}</div>
      <div style={{ background: 'rgba(0,0,0,.78)', color: '#fff', fontFamily: FONTE, fontWeight: 800, fontSize: 52, padding: '14px 30px', maxWidth: 900, textAlign: 'center', textTransform: 'uppercase', borderBottom: '6px solid #d7261e' }}>{o.texto}</div>
    </div>
  );
  if (o.nivel) {
    const n = Math.min(95, Math.round(20 + (t - o.start) * 9));
    return (
      <div style={{ ...base, top: 470 }}>
        <div style={{ fontFamily: MONO, fontSize: 34, color: '#9fd8ff', letterSpacing: 4 }}>BANHEIRA · NÍVEL</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 110, color: '#fff', textShadow: '0 0 30px #2a8fd6' }}>{n}%</div>
        <div style={{ width: 520, height: 20, border: '3px solid #9fd8ff' }}><div style={{ width: `${n}%`, height: '100%', background: '#2a8fd6' }} /></div>
      </div>
    );
  }
  if (o.dial) {
    const pisca = ruido(t, 2) > 0.55 ? 0.35 : 1;
    const freq = (88 + clamp((t - o.start) / 6) * 10.1).toFixed(1);
    return (
      <div style={{ ...base, top: 470 }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 120, color: '#ffb000', background: 'rgba(20,12,0,.8)', padding: '6px 34px', border: '4px solid #6b4a00', opacity: pisca, textShadow: '0 0 24px #ff8a00' }}>{freq} FM</div>
      </div>
    );
  }
  const cor = o.alerta ? '#ff3b30' : '#ffffff';
  return (
    <div style={{ ...base, top: 470 + i * 250 }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: o.texto.length > 10 ? 72 : 150, color: cor, letterSpacing: 2,
        textShadow: `0 0 30px ${o.alerta ? '#ff0000' : '#000'}, 0 4px 0 #000`, textAlign: 'center', maxWidth: 980 }}>{o.texto}</div>
      {o.sub && <div style={{ fontFamily: MONO, fontSize: 36, color: '#ddd', letterSpacing: 6, marginTop: 6, textTransform: 'uppercase', background: 'rgba(0,0,0,.55)', padding: '4px 16px' }}>{o.sub}</div>}
    </div>
  );
};

// ---------------- composição ----------------
export const Ep01 = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const flash = t >= T.apagao ? Math.exp(-(t - T.apagao) * 7) : 0;
  const preto = ramp(t, T.fechamento + 0.8, T.fechamento + 2.3);
  const coracao = t > T.coracao ? Math.pow(Math.max(0, Math.sin((t - T.coracao) * Math.PI * 2 * 1.35)), 8) : 0;
  const escuro = t >= T.apagao ? 1 : 0;
  const titulo = 1 - ramp(t, 2.2, 3.0);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <ThreeCanvas width={width} height={height} gl={{ antialias: true }} camera={{ position: [3, 2, -2], fov: 50 }}>
        <Camera t={t} />
        <Luzes t={t} />
        <Cenario t={t} />
        <Nelson t={t} />
      </ThreeCanvas>

      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: '0 0' }}>
      {/* grão de filme + vinheta (mais pesada no escuro, pulsando com o coração) */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent ${48 - escuro * 12 - coracao * 10}%, rgba(0,0,0,${0.55 + escuro * 0.3 + coracao * 0.15}) 100%)` }} />
      <AbsoluteFill style={{ opacity: 0.1 + escuro * 0.06, mixBlendMode: 'overlay',
        backgroundImage: `url(${staticFile('ep01/grao_' + (frame % 4) + '.png')})`, backgroundSize: '256px 256px',
        backgroundPosition: `${(frame * 73) % 256}px ${(frame * 151) % 256}px` }} />
      {coracao > 0 && <AbsoluteFill style={{ boxShadow: `inset 0 0 ${180 + coracao * 120}px rgba(120,0,0,${0.25 * coracao})` }} />}

      {tl.overlays.filter((o) => t >= o.start && t <= o.end).map((o, i, arr) => <Overlay key={i} o={o} t={t} i={arr.filter((x, j) => j < i && !x.regra).length} />)}
      <Legenda t={t} />

      {/* HUD fixo: título e relógio correndo depois das 22:47 */}
      <div style={{ position: 'absolute', top: 70, left: 60, fontFamily: MONO, color: 'rgba(255,255,255,.75)', fontSize: 28, letterSpacing: 4, opacity: 1 - titulo }}>
        APAGÃO · EP.01
      </div>
      {t > T.apagao && (
        <div style={{ position: 'absolute', top: 70, right: 60, fontFamily: MONO, color: '#ff3b30', fontSize: 28, letterSpacing: 3 }}>
          ● 22:{String(47 + Math.floor((t - T.apagao + 52) / 60)).padStart(2, '0')}:{String(Math.floor((t - T.apagao + 52) % 60)).padStart(2, '0')}
        </div>
      )}
      {titulo > 0 && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: titulo }}>
          <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: 190, color: '#fff', letterSpacing: 10, textShadow: '0 0 40px #000, 6px 0 0 rgba(255,0,0,.6), -6px 0 0 rgba(0,180,255,.6)',
            transform: `translateX(${ruido(t, 3) * 8}px)` }}>APAGÃO</div>
          <div style={{ fontFamily: MONO, fontSize: 40, color: '#ffd23f', letterSpacing: 12, marginTop: -10 }}>EPISÓDIO 1</div>
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{ background: '#fff', opacity: flash }} />
      <AbsoluteFill style={{ background: '#000', opacity: preto }} />
      {preto > 0.95 && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: ramp(t, T.fechamento + 2.4, T.fechamento + 3) }}>
          <div style={{ fontFamily: MONO, fontSize: 44, color: '#bbb', letterSpacing: 10 }}>FIM DO EPISÓDIO 1</div>
        </AbsoluteFill>
      )}
      </div>
      <Audios fps={fps} />
    </AbsoluteFill>
  );
};
export const duracaoEp01 = tl.total;
