import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Ep07Captions} from './captions';
import {EP_DURATION, OUTRO_AT, f, wordAt} from './timeline';
import type {ShotP} from './kit';
import * as A from './shotsA';
import * as B from './shotsB';
import * as C from './shotsC';

type AnyShot = React.FC<ShotP>;
/** Cut list: [id, line, word index, shot]. Every cut lands on a word onset (timing.json). 'OUT' = silent outro cards. */
export const CUTS: [string, string, number, AnyShot][] = [
  ['s01', 'n01', 0, A.S01Dead],
  ['s02', 'n01', 5, A.S02Serio],
  ['s03', 'n02', 0, A.S03Avenida],
  ['s04', 'n02', 8, A.S04Caminhao],
  ['s05', 'n02', 12, A.S05NemPensou],
  ['s06', 'n02', 16, A.S06Pulou],
  ['s07', 'n03', 0, A.S07Ileso],
  ['s08', 'n03', 4, A.S08Estatistica],
  ['s09', 'n04', 0, A.S09AbreOlho],
  ['s10', 'n04', 5, A.S10DuasLuas],
  ['s11', 'n04', 12, A.S11Dragao],
  ['s12', 'n04b', 0, A.S12Eita],
  ['s13', 'n05', 0, A.S13OutroMundo],
  ['s14', 'n05', 8, A.S14Tela],
  ['s15', 'n06', 0, A.S15Status],
  ['s16', 'n06', 8, A.S16Slime],
  ['s17', 'n06', 12, A.S17Magia],
  ['s18', 'n07', 0, A.S18Mapa],
  ['s19', 'n07', 9, A.S19Elfos],
  ['s20', 'n07', 16, A.S20Anoes],
  ['s21', 'n07', 25, A.S21Rei],
  ['s22', 'n07', 34, A.S22Sul],
  ['s23', 'n08', 0, B.S23Marcas],
  ['s24', 'n08', 10, B.S24Uma],
  ['s25', 'n08', 13, B.S25Duas],
  ['s26', 'n08', 16, B.S26Tres],
  ['s27', 'n09', 0, B.S27Cores],
  ['s28', 'n09', 6, B.S28Fisica],
  ['s29', 'n09a', 0, B.S29Fogo],
  ['s30', 'n09a', 2, B.S30Triangulo],
  ['s31', 'n09a', 14, B.S31Jato],
  ['s32', 'n09b', 0, B.S32Agua],
  ['s33', 'n09b', 2, B.S33Vapor],
  ['s34', 'n09b', 9, B.S34Condensa],
  ['s35', 'n09b', 23, B.S35Copo],
  ['s36', 'n09c', 0, B.S36Terra],
  ['s37', 'n09c', 2, B.S37Graos],
  ['s38', 'n09c', 11, B.S38Pilar],
  ['s39', 'n09d', 0, B.S39Vento],
  ['s40', 'n09d', 2, B.S40Pressao],
  ['s41', 'n09d', 13, B.S41Navio],
  ['s42', 'n09e', 0, B.S42Raio],
  ['s43', 'n09e', 2, B.S43Cargas],
  ['s44', 'n09e', 10, B.S44Descarga],
  ['s45', 'n09e', 19, B.S45Sol],
  ['s46', 'n09f', 0, B.S46Dourada],
  ['s47', 'n09f', 11, B.S47ReiMago],
  ['s48', 'n10', 0, C.S48Corre],
  ['s49', 'n10', 6, C.S49Olha],
  ['s50', 'n10', 10, C.S50Reflexo],
  ['s51', 'n10', 16, C.S51Ferrou],
  ['s52', 'n10', 17, C.S52Cidade],
  ['s53', 'n10', 23, C.S53Crianca],
  ['s54', 'n10', 25, C.S54Guarda],
  ['s55', 'n11', 0, C.S55Academia],
  ['s56', 'n11', 5, C.S56Cristal],
  ['s57', 'n11', 9, C.S57Garoto],
  ['s58', 'n11', 20, C.S58SuaVez],
  ['s59', 'n11', 22, C.S59Nada],
  ['s60', 'n11', 29, C.S60Gargalhada],
  ['s61', 'n12', 0, C.S61Cajado],
  ['s62', 'n12', 9, C.S62Silencio],
  ['s63', 'n12', 15, C.S63Perto],
  ['s64', 'd1', 0, C.S64Irmao],
  ['s65', 'd1', 8, C.S65Exilio],
  ['s66', 'd1', 17, C.S66Nunca],
  ['s67', 'n13', 0, C.S67Miado],
  ['s68', 'n13', 6, C.S68Estante],
  ['s69', 'cta', 0, C.S69Ep2],
  ['s70', 'OUT', 0, C.S70Outro],
];

const startOf = (l: string, w: number) => (l === 'OUT' ? OUTRO_AT : wordAt(l, w));
export const SHOTS = CUTS.map(([id, l, w, C], i) => {
  const from = i === 0 ? 0 : f(startOf(l, w));
  const to = i + 1 < CUTS.length ? f(startOf(CUTS[i + 1][1], CUTS[i + 1][2])) : EP_DURATION;
  return {id, from, dur: to - from, C};
});

export const Ep07: React.FC<{withAudio?: boolean}> = ({withAudio = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    {SHOTS.map(({id, from, dur, C}) => (
      <Sequence key={id} from={from} durationInFrames={dur} name={id}>
        <C from={from} dur={dur} />
      </Sequence>
    ))}
    <Ep07Captions />
    {withAudio ? <Audio src={staticFile('ep07/mix.wav')} /> : null}
  </AbsoluteFill>
);
