import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PlacedDavi} from '../../characters/Davi';
import {CAPTION_FONT, HUD_FONT} from '../../lib/fonts';
import {FPS} from '../../lib/constants';
import pedidoWords from './pedido-words.json';
import outroWords from './outro-words.json';

type W = {w: string; start: number; end: number};
const KEY = new Set('PODER SEGUIDOR CONTIGO COMENTA ALEATÓRIO DAVI CURTIDO PRÓXIMO VÍDEO LONGO HISTÓRIA COMPLETA LONGO YOUTUBE LINK BIO'.split(' '));
const norm = (w: string) => w.replace(/[.,?!:;"]/g, '').toUpperCase();

/** Word-chunk captions (same look as the episodes: uppercase, yellow keywords). */
const Caps: React.FC<{words: W[]; y?: number}> = ({words, y = 0.76}) => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const chunks: {ws: string[]; from: number; to: number}[] = [];
  let cur: W[] = [];
  const flush = () => {
    if (!cur.length) return;
    chunks.push({ws: cur.map((x) => x.w), from: Math.round(cur[0].start * fps), to: Math.round((cur[cur.length - 1].end + 0.35) * fps)});
    cur = [];
  };
  for (const w of words) {
    cur.push(w);
    if (/[.,?!:]$/.test(w.w) || cur.length >= 3) flush();
  }
  flush();
  return (
    <>
      {chunks.map((c, i) => {
        const to = chunks[i + 1] ? Math.min(c.to, chunks[i + 1].from) : c.to + 20;
        if (frame < c.from || frame >= to) return null;
        const s = spring({frame: frame - c.from, fps, config: {damping: 12, stiffness: 260, mass: 0.5}});
        return (
          <div key={i} style={{position: 'absolute', left: 60, right: 60, top: y * height, transform: `translateY(-50%) scale(${0.55 + 0.45 * s})`, textAlign: 'center', fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 80, textTransform: 'uppercase', textShadow: '0 0 3px rgba(0,0,0,0.9), 0 4px 0 rgba(0,0,0,0.6)', WebkitTextStroke: '2px rgba(10,8,12,0.6)', paintOrder: 'stroke fill'}}>
            {c.ws.map((w, j) => (
              <span key={j} style={{color: KEY.has(norm(w)) ? '#ffd23a' : '#fff'}}>{w}{j < c.ws.length - 1 ? ' ' : ''}</span>
            ))}
          </div>
        );
      })}
    </>
  );
};

const Card: React.FC<{from: number; to?: number; top: number; children: React.ReactNode; bg?: string; color?: string; size?: number}> = ({from, to = 99999, top, children, bg = '#ffffff', color = '#141a3a', size = 58}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from || frame >= to) return null;
  const s = spring({frame: frame - from, fps, config: {damping: 11, mass: 0.6}});
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', transform: `scale(${s})`}}>
      <span style={{display: 'inline-block', padding: '16px 34px', borderRadius: 28, background: bg, color, fontFamily: HUD_FONT, fontWeight: 700, fontSize: size, boxShadow: '0 10px 28px rgba(0,0,0,0.4)', lineHeight: 1.15}}>{children}</span>
    </div>
  );
};

const BG: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #2b3a7a 0%, #141a3a 72%)'}} />;

/** Insert after the hook: "Esse poder foi pedido por um seguidor." (~2.4 s) */
export const PedidoInsert: React.FC<{withAudio?: boolean}> = ({withAudio}) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 6) * 6;
  return (
    <AbsoluteFill>
      <BG />
      <Card from={2} top={300} bg="#ffd23a" size={64}>📩 A PEDIDO DE UM SEGUIDOR</Card>
      <div style={{position: 'absolute', left: 120, right: 120, top: 520 + bob, background: '#fff', borderRadius: 26, padding: '22px 28px', boxShadow: '0 10px 28px rgba(0,0,0,0.4)', fontFamily: HUD_FONT, color: '#141a3a', transform: `scale(${interpolate(frame, [8, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`}}>
        <div style={{fontSize: 28, fontWeight: 700, opacity: 0.6}}>@seguidor · comentou</div>
        <div style={{fontSize: 40, fontWeight: 700, marginTop: 6}}>Faz o Davi com poder de controlar metal! 🧲</div>
        <div style={{fontSize: 30, marginTop: 8, color: '#e0245e'}}>♥ curtido</div>
      </div>
      <PlacedDavi x={540} y={2050} height={1200} pose={{shR: 40, elR: -110, facing: 0.15}} expr={{smile: 0.7, browRaise: 0.4}} />
      <Caps words={pedidoWords as W[]} />
      {withAudio ? <Audio src={staticFile('ep04/pedido.mp3')} /> : null}
    </AbsoluteFill>
  );
};

/** New outro (replaces the old last line): comment a random power, most liked becomes the next video, poll LONGO, YouTube link na bio, @Odavi_contos. */
export const OutroCTA: React.FC<{withAudio?: boolean}> = ({withAudio}) => {
  const frame = useCurrentFrame();
  const t = (s: number) => Math.round(s * FPS);
  const wave = Math.sin(frame / 4) * 20;
  return (
    <AbsoluteFill>
      <BG />
      <Card from={t(1.1)} to={t(5.8)} top={250} size={56}>💬 COMENTA UM PODER ALEATÓRIO</Card>
      <Card from={t(3.3)} to={t(5.8)} top={400} bg="#e0245e" color="#fff" size={52}>♥ O MAIS CURTIDO VIRA O PRÓXIMO VÍDEO</Card>
      <Card from={t(5.9)} to={t(9.0)} top={260} size={58}>📊 ENQUETE: QUER VÍDEO LONGO?</Card>
      <Card from={t(7.8)} to={t(9.0)} top={420} bg="#ffd23a" size={64}>ESCREVE "LONGO" 👇</Card>
      <Card from={t(9.1)} top={240} bg="#ff0000" color="#fff" size={62}>▶ YOUTUBE · LINK NA BIO</Card>
      <Card from={t(9.4)} top={420} bg="#ffd23a" size={78}>@Odavi_contos</Card>
      <PlacedDavi x={540} y={2050} height={1200} pose={{shR: frame > t(9) ? 150 + wave : 60, elR: -40, facing: 0.1}} expr={{smile: 0.8, halfSmile: 0.3, browRaise: 0.3}} />
      <Caps words={outroWords as W[]} />
      {withAudio ? <Audio src={staticFile('ep04/outro.mp3')} /> : null}
    </AbsoluteFill>
  );
};
