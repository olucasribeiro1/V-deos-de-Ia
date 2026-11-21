import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PARTS, f} from '../timeline';
import shots from './shots.json';
import {ShotP, T0} from './rig';
import * as R from './shotsRoom';
import * as M from './shotsMetro';
import * as C from './shotsCrowd';
import * as Ho from './shotsHome';

/** Shot id (shots.json) -> component. Cuts come from shots.json (word starts), so audio + video share one list. */
const REG: Record<string, React.FC<ShotP>> = {
  room: R.SRoom,
  salinha: R.SSalinha,
  no: R.SNo,
  fuga: R.SFuga,
  catraca: M.SCatraca,
  medo: M.SMedo,
  careca: M.SCareca,
  plaft: M.SPlaft,
  chefe: M.SChefe,
  rosto: M.SRosto,
  raiox: M.SRaioX,
  flat: M.SFlat,
  leitura: M.SLeitura,
  mergulho: C.SMergulho,
  trezentas: C.STrezentas,
  trinta: C.STrinta,
  quarenta: C.SQuarenta,
  quarentaeum: C.SQuarentaEUm,
  buraco: C.SBuraco,
  passa: C.SPassa,
  trem: C.STrem,
  porta: C.SPorta,
  plataforma: C.SPlataforma,
  bravo: C.SBravo,
  veia: C.SVeia,
  casa: Ho.SCasa,
  tudo: Ho.STudo,
  check: Ho.SCheck,
  gato: Ho.SGato,
  erro: Ho.SErro,
  copo: Ho.SCopo,
  final: Ho.SFinal,
  piscada: Ho.SPiscada,
};

/** Part B (41.22–79.29 s, L9–L16): cuts on word starts, hard cut to black at 78.2 s. Local frame 0 = PARTS.B.start. */
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
