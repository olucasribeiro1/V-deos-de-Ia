import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeOut, kf, lerp} from '../lib/anim';
import {f, wordAt} from './timeline';

export {Rig, useShot} from '../ep02/partC/kit';
export {Stamp, Chip, HudTag, Steam, HeatWaves, Stars, SweatDrop} from '../ep02qi/partA/kit';
export {BigChip} from '../ep05/partA/kit';
export {SoundWord, Confetti, Paper, Label} from '../ep03/partB/kit';
export {CutFlash, SpeedLines} from '../ep01/partA/kit';
export {Finish} from '../scenes/common';
export {Shockwave} from '../fx/Shockwave';
export {Particles, LightRays} from '../fx/Particles';
export {AirMolecules} from '../fx/AirMolecules';
export {walkP, run, Sweat} from '../ep02qi/partB/kit';
export {Big, Panel, Cricket} from '../ep06/kit';
export {Bust} from '../ep02qi/characters';
export {Crowd} from '../ep03/sets/Academy';
export {clamp, easeOut, kf, lerp};

export type ShotP = {from: number; dur: number};
/** Shot-local frame of a narration word onset. */
export const ev = (p: ShotP, id: string, n: number) => f(wordAt(id, n)) - p.from;
export const appear = (fr: number, at: number, len = 8) => kf(fr, [at, at + len], [0, 1], easeOut);
export const YEL = '#ffd23a';

/** Sepia flashback grade. */
export const Sepia: React.FC<{k?: number}> = ({k = 1}) => (
  <AbsoluteFill style={{background: `rgba(140,100,50,${0.35 * k})`, mixBlendMode: 'multiply', pointerEvents: 'none'}} />
);
/** Eyelids opening (POV). k 0 closed → 1 open. */
export const Eyelids: React.FC<{k: number}> = ({k}) => {
  const h = lerp(960, 0, easeOut(clamp(k)));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -100, right: -100, top: 0, height: h + 80, background: '#140c08', borderBottomLeftRadius: '50% 120px', borderBottomRightRadius: '50% 120px'}} />
      <div style={{position: 'absolute', left: -100, right: -100, bottom: 0, height: h + 80, background: '#140c08', borderTopLeftRadius: '50% 120px', borderTopRightRadius: '50% 120px'}} />
    </AbsoluteFill>
  );
};
export const Tint: React.FC<{c: string; o: number}> = ({c, o}) => (o > 0 ? <AbsoluteFill style={{background: c, opacity: o, pointerEvents: 'none'}} /> : null);
