import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PARTS, f, wordAt} from '../timeline';
import type {ShotProps} from './kit';
import {A01Hook, A02Paris, A03Tokyo, A04NY, A05Ticket, A06Postcard, A07Dream, A08Reveal, A09Shades, A10Route, A11Selfie, A12Tower, A13Maldives} from './shots1';
import {A14Clocks, A15Yawn, A16Sunrises, A17EyeBags, A18Vista, A19SnowArrive, A20Altitude, A21Panting, A22Oxygen, A23EarXray, A24Plane, A25Graph, A26Back} from './shots2';
import {A27Office, A28Rocha, A29Snap, A30Sync, A31Screen, A32Grid, A33Bed, A34PhotoPins, A35Pins, A36Suits} from './shots3';

/** Cut list: [line, word index, shot]. Every cut lands on a word onset (timing.json). */
export const CUTS: [string, number, React.FC<ShotProps>][] = [
  ['L1', 0, A01Hook], // E se tu pudesse
  ['L1', 5, A02Paris], // café em Paris
  ['L1', 8, A03Tokyo], // almoçar em Tóquio
  ['L1', 12, A04NY], // jantar em Nova York
  ['L1', 16, A05Ticket], // sem pagar passagem?
  ['L2', 0, A06Postcard], // Só que todo lugar
  ['L2', 6, A07Dream], // sonha em ir
  ['L2', 10, A08Reveal], // alguém te esperando
  ['L2', 13, A09Shades], // lá.
  ['L3', 2, A10Route], // Atlântico, o Davi
  ['L3', 5, A11Selfie], // virou turista
  ['L3', 8, A12Tower], // Eiffel às oito
  ['L3', 11, A13Maldives], // Maldivas ao meio-dia
  ['L4', 0, A14Clocks], // Só que o corpo não pula
  ['L4', 7, A15Yawn], // fuso. Três dias
  ['L4', 10, A16Sunrises], // quatro nasceres do sol
  ['L4', 14, A17EyeBags], // duas horas de sono
  ['L5', 0, A18Vista], // E nem todo lugar bonito
  ['L5', 5, A19SnowArrive], // é bom de chegar
  ['L5', 9, A20Altitude], // Himalaia, cinco
  ['L5', 11, A21Panting], // mil metros. Metade do
  ['L5', 15, A22Oxygen], // oxigênio
  ['L6', 1, A23EarXray], // ouvido estalou
  ['L6', 4, A24Plane], // descida de avião
  ['L6', 7, A25Graph], // Só que em zero segundos
  ['L6', 12, A26Back], // Ele voltou em dez
  ['L7', 0, A27Office], // Enquanto isso, a Linha
  ['L7', 4, A28Rocha], // mudou de tática
  ['L7', 7, A29Snap], // Se ele só pula pra lugar
  ['L7', 13, A30Sync], // que já viu, era só
  ['L7', 18, A31Screen], // ver o que ele viu
  ['L8', 0, A32Grid], // Trezentas e doze fotos
  ['L8', 4, A33Bed], // salvas no celular
  ['L8', 7, A34PhotoPins], // Cada foto virou um endereço
  ['L8', 12, A35Pins], // Em cada endereço
  ['L8', 15, A36Suits], // um terno
];

const P0 = f(PARTS.A.start);
const END = f(PARTS.A.end);
export const SHOTS = CUTS.map(([l, w, C], i) => {
  const start = i === 0 ? P0 : f(wordAt(l, w));
  const next = i + 1 < CUTS.length ? f(wordAt(CUTS[i + 1][0], CUTS[i + 1][1])) : END;
  return {start, d: next - start, C};
});

/** Part A (0–41.53 s, L1–L8). Local frame 0 = absolute 0. */
export const PartA: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {SHOTS.map(({start, d, C}, i) => (
      <Sequence key={i} from={start - P0} durationInFrames={d} layout="none">
        <AbsoluteFill>
          <C start={start} d={d} />
        </AbsoluteFill>
      </Sequence>
    ))}
  </AbsoluteFill>
);
