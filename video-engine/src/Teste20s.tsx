import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Shot1Calcadao} from './scenes/Shot1Calcadao';
import {Shot2Close} from './scenes/Shot2Close';
import {Shot3Vanish} from './scenes/Shot3Vanish';
import {Shot4Shockwave} from './scenes/Shot4Shockwave';
import {Shot5Car} from './scenes/Shot5Car';
import {Shot6Map} from './scenes/Shot6Map';
import {Shot7Grab} from './scenes/Shot7Grab';
import {Captions, CaptionCue} from './ui/Caption';

/** Shot list of the 20 s test (frames @30fps). Cuts every 2–3 s. */
export const SHOTS = [
  {from: 0, dur: 90, C: Shot1Calcadao}, // 0–3 s
  {from: 90, dur: 60, C: Shot2Close}, // 3–5 s
  {from: 150, dur: 75, C: Shot3Vanish}, // 5–7.5 s
  {from: 225, dur: 75, C: Shot4Shockwave}, // 7.5–10 s
  {from: 300, dur: 90, C: Shot5Car}, // 10–13 s
  {from: 390, dur: 90, C: Shot6Map}, // 13–16 s
  {from: 480, dur: 104, C: Shot7Grab}, // 16–19.47 s, then black
];

export const CUES: CaptionCue[] = [
  {text: 'E SE TU PUDESSE', from: 3, to: 44, pos: 'top'},
  {text: 'SE TELETRANSPORTAR?', from: 44, to: 90, pos: 'bottom'},
  {text: 'PRA QUALQUER LUGAR', from: 92, to: 150, pos: 'top'},
  {text: 'QUE JÁ VIU?', from: 163, to: 225, pos: 'bottom'},
  {text: 'E TIVESSE GENTE', from: 302, to: 341, pos: 'top'},
  {text: 'PAGA PRA TE CAÇAR?', from: 341, to: 390, pos: 'bottom'},
  {text: 'TRÊS MICROFONES', from: 398, to: 480, pos: 'bottom'},
  {text: 'EMPATE.', from: 552, to: 584, pos: 'bottom'},
];

export const Teste20s: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {SHOTS.map(({from, dur, C}, i) => (
      <Sequence key={i} from={from} durationInFrames={dur}>
        <C />
      </Sequence>
    ))}
    <Captions cues={CUES} />
  </AbsoluteFill>
);
