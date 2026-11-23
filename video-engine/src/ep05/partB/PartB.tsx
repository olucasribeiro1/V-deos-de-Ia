import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {CUTS} from './kit';
import * as S1 from './shots1';
import * as S2 from './shots2';
import * as S3 from './shots3';

/** Part B (L9–L15). Local frame 0 = PARTS.B.start (41.27 s). Hard cuts on word starts (see kit.tsx CUT_DEFS / shots.json). */
const SHOTS: Record<string, React.FC> = {
  b01_ready: S1.B01Ready,
  b02_montage: S1.B02Montage,
  b03_kitchen: S1.B03Kitchen,
  b04_roof: S1.B04Roof,
  b05_balcony: S1.B05Balcony,
  b06_wc: S1.B06Wc,
  b07_mics: S1.B07Mics,
  b08_erro: S1.B08Erro,
  b09_table: S1.B09Table,
  b10_hands: S1.B10Hands,
  b11_globe: S2.B11Globe,
  b12_twopts: S2.B12TwoPts,
  b13_arrows: S2.B13Arrows,
  b14_delta: S2.B14Delta,
  b15_step: S2.B15Step,
  b16_where: S2.B16Where,
  b17_photos: S2.B17Photos,
  b18_none: S2.B18None,
  b19_memory: S2.B19Memory,
  b20_pov: S2.B20Pov,
  b21_arrive: S3.B21Arrive,
  b22_air: S3.B22Air,
  b23_gust: S3.B23Gust,
  b24_captain: S3.B24Captain,
  b25_hatfly: S3.B25HatFly,
  b26_look: S3.B26Look,
  b27_lia: S3.B27Lia,
  b28_coisa: S3.B28Coisa,
  b29_davi: S3.B29Davi,
  b30_shrug: S3.B30Shrug,
  b31_terrace: S3.B31Terrace,
  b32_glasses: S3.B32Glasses,
  b33_shatter: S3.B33Shatter,
  b34_bill: S3.B34Bill,
  b35_rocha: S3.B35Rocha,
  b36_black: () => <AbsoluteFill style={{background: '#000'}} />,
};

export const PartB: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {CUTS.map((c) => {
      const Shot = SHOTS[c.id];
      return (
        <Sequence key={c.id} from={c.from} durationInFrames={Math.max(1, c.dur)} name={c.id}>
          <Shot />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
