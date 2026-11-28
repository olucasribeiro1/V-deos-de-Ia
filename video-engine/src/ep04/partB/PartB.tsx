import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PARTS, f} from '../timeline';
import shots from './shots.json';
import {ShotP, T0} from './rig';
import * as A from './shots1';
import * as B from './shots2';
import * as C from './shots3';

/** Shot id (shots.json) -> component. Cuts come from shots.json (word starts), so audio + video share one list. */
const REG: Record<string, React.FC<ShotP>> = {
  fachada: A.SFachada,
  balcao: A.SBalcao,
  porta: A.SPorta,
  taco: A.STaco,
  tenta: A.STenta,
  naomag: A.SNaoMag,
  mas: A.SMas,
  pisca: A.SPisca,
  rapido: A.SRapido,
  xray1: A.SXray1,
  xray2: A.SXray2,
  contrario: A.SContrario,
  lenz: A.SLenz,
  empurra: A.SEmpurra,
  voa: A.SVoa,
  crash: A.SCrash,
  foge: B.SFoge,
  pesada: B.SPesada,
  corrente: B.SCorrente,
  gramas: B.SGramas,
  policia: B.SPolicia,
  pedala: B.SPedala,
  freeze: B.SPedala,
  fimfeliz: C.SFimFeliz,
  quase: C.SQuase,
  pagar: C.SPagar,
  invalido: C.SInvalido,
  apagou: C.SApagou,
  doze: C.SDoze,
  etu: C.SETu,
  puxar: C.SPuxar,
  clipe: C.SClipe,
  comenta: C.SComenta,
  black: C.SBlack,
};

/** Part B (43.88–79.48 s, L8–L14): diner robbery, Lenz trick, bike chain, police, card gag, CTA. Hard cut to black 78.6 s. */
export const PartB: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {shots.map((s) => {
      const C2 = REG[s.id];
      if (!C2) return null;
      const from = f(s.start) - T0;
      const to = f(s.end) - T0;
      return (
        <Sequence key={s.id} from={from} durationInFrames={to - from} name={s.id}>
          <C2 from={from} dur={to - from} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

export const PART_B_FRAMES = f(PARTS.B.end) - T0;
