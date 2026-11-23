import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PARTS, f, wordAt} from '../timeline';
import type {ShotP} from './kit';
import * as S1 from './shots1';
import * as S2 from './shots2';

type AnyShot = React.FC<ShotP>;
/** EP02-draft partA shots take {start, d}. */
const sd = (C: React.FC<{start: number; d: number}>): AnyShot => (p) => <C start={p.from} d={p.dur} />;

/** Cut list: [id, line, word index, shot]. Every cut lands on a word onset (timing.json). */
export const CUTS: [string, string, number, AnyShot][] = [
  ['a01_arrive', 'L1', 0, S1.A01Arrive], // O Davi se teletransporta
  ['a02_phone', 'L1', 5, S1.A02Phone], // qualquer lugar que já viu
  ['a03_linha', 'L1', 10, S1.A03Linha], // E agora a Linha
  ['a04_target', 'L1', 14, S1.A04Target], // pegou a garota que
  ['a05_serious', 'L1', 18, S1.A05Serious], // ele gosta
  ['a06_pedido', 'L2', 0, S1.A06Pedido], // Essa continuação foi pedida pelos seguidores
  ['a07_rewind', 'L3', 0, S1.A07Rewind], // Recapitulando: ele
  ['a08_rule1', 'L3', 2, S1.A08Rule1], // só pula pra lugar que já viu
  ['a09_rule2', 'L3', 9, S1.A09Rule2], // E o que ele segura chega com a
  ['a10_smash', 'L3', 17, S1.A10Smash], // velocidade antiga
  ['a11_imagine', 'L3', 19, S1.A11Imagine], // Levar alguém pra longe
  ['a12_wall', 'L3', 23, S1.A12Wall], // vira acidente
  ['a13_route', 'L4', 0, sd(S1.A13Route)], // Depois do Atlântico, o Davi
  ['a14_paris', 'L4', 5, S1.A14Paris], // virou turista. E
  ['a15_maldives', 'L4', 8, S1.A15Maldives], // chegar num lugar empurra
  ['a16_air', 'L4', 12, S1.A16Air], // setenta litros de ar
  ['a17_terrace', 'L5', 0, S2.A17Terrace], // Num terraço em Mônaco
  ['a18_lia', 'L5', 4, S2.A18Lia], // ele conheceu a Lia
  ['a19_liaLaugh', 'L5', 8, S2.A19LiaLaugh], // Ela riu do moletom
  ['a20_daviLaugh', 'L5', 12, S2.A20DaviLaugh], // Ele riu do salto
  ['a21_heels', 'L5', 16, S2.A21Heels], // alto na mão dela
  ['a22_hack', 'L6', 0, S2.A22Hack], // Só que a Linha olhou as
  ['a23_gallery', 'L6', 6, S2.A23Gallery], // fotos do celular dele
  ['a24_grid', 'L6', 10, sd(S2.A24Grid)], // Trezentas e doze
  ['a25_photoPins', 'L6', 13, sd(S2.A25PhotoPins)], // Cada foto
  ['a26_suits', 'L6', 15, sd(S2.A26Suits)], // um endereço vigiado
  ['a27_buzz', 'L7', 0, S2.A27Buzz], // Hoje à noite
  ['a28_notif', 'L7', 3, S2.A28Notif], // chegou uma foto
  ['a29_photoLia', 'L7', 6, S2.A29PhotoLia], // a Lia na mesa do terraço
  ['a30_photoRocha', 'L7', 12, S2.A30PhotoRocha], // o Rocha do lado
  ['a31_message', 'L7', 16, S2.A31Message], // Tu já viu esse lugar
  ['a32_whatIf', 'L8', 0, S2.A32WhatIf], // Se ele aparece ali
  ['a33_mics', 'L8', 4, S2.A33Mics], // os microfones acham o estalo em
  ['a34_locate', 'L8', 10, S2.A34Locate], // dois segundos
];

const P0 = f(PARTS.A.start);
const END = f(PARTS.A.end);
export const SHOTS = CUTS.map(([id, l, w, C], i) => {
  const from = (i === 0 ? P0 : f(wordAt(l, w))) - P0;
  const to = i + 1 < CUTS.length ? f(wordAt(CUTS[i + 1][1], CUTS[i + 1][2])) - P0 : END - P0;
  return {id, from, dur: to - from, C};
});

/** Part A (0–41.27 s, L1–L8). Local frame 0 = absolute 0. */
export const PartA: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {SHOTS.map(({id, from, dur, C}) => (
      <Sequence key={id} from={from} durationInFrames={dur} name={id}>
        <C from={from} dur={dur} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
