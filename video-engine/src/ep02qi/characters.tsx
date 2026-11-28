import React from 'react';
import {DEFAULT_POSE, PlacedPuppet, Puppet, PuppetProps} from '../characters/Puppet';
import {DAVI_OUTFIT} from '../characters/Davi';
import type {Outfit, Pose, Tone} from '../characters/types';

/**
 * EP02 "QI Infinito" supporting cast (shared by parts A and B):
 * Davi's mom, kid Davi, the uncles (truco/churrasco), casino security guards,
 * plus head accessories (Santa hat, earpiece) placed in the puppet's head frame.
 */

/* ------------------------------------------------------------------ head-frame helper */

const HIP_Y = -480;
const NECK_Y = -772;
const HEAD_Y = -884;

/**
 * Renders children in the puppet's HEAD frame (head-local units: round head r = 122 centred at 0,0),
 * following bob / lean / headTilt of `pose`. Use as a child of PlacedPuppet/PuppetSvg (or after <Puppet/>).
 */
export const HeadFrame: React.FC<{pose?: Pose; children: React.ReactNode}> = ({pose = {}, children}) => {
  const p = {...DEFAULT_POSE, ...pose};
  return (
    <g transform={`translate(0,${p.bob}) rotate(${p.lean} 0 ${HIP_Y}) rotate(${p.headTilt} 0 ${NECK_Y}) translate(0,${HEAD_Y})`}>{children}</g>
  );
};

/** Floppy Santa hat (head-local units). `flop` -1..1 swings the tip, `droop` 0..1 makes it sag (sad). */
export const SantaHat: React.FC<{flop?: number; droop?: number}> = ({flop = 0, droop = 0}) => {
  const tipX = 150 + flop * 40 - droop * 40;
  const tipY = -250 + droop * 190;
  const midX = 60 + flop * 20;
  return (
    <g>
      <path d={`M -138,-82 Q -120,-250 ${midX},-${300 - droop * 60} Q ${tipX - 10},${tipY - 40} ${tipX},${tipY} Q ${tipX - 60},${tipY - 10} 120,-150 Q 140,-120 138,-82 Z`} fill="#d62a2a" />
      <path d={`M -96,-120 Q -70,-240 ${midX - 10},-${284 - droop * 60}`} stroke="#ff6a5c" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
      <path d={`M 60,-140 Q 100,-200 ${tipX - 20},${tipY + 6}`} stroke="#8e1414" strokeWidth={16} fill="none" strokeLinecap="round" opacity={0.45} />
      {/* fur band */}
      <rect x={-156} y={-120} width={312} height={64} rx={32} fill="#f7f3ea" />
      {Array.from({length: 9}).map((_, i) => (
        <circle key={i} cx={-130 + i * 32.5} cy={-90 + (i % 2) * 6} r={20} fill="#ffffff" opacity={0.75} />
      ))}
      <rect x={-156} y={-74} width={312} height={14} rx={7} fill="#d8d0c0" opacity={0.7} />
      {/* pompom */}
      <circle cx={tipX} cy={tipY} r={34} fill="#fbf8f0" />
      <circle cx={tipX - 10} cy={tipY - 10} r={14} fill="#ffffff" />
    </g>
  );
};

/** Security earpiece: coiled wire from the ear down into the collar (head-local units). */
export const Earpiece: React.FC<{side?: 1 | -1}> = ({side = 1}) => (
  <g>
    <circle cx={side * 118} cy={10} r={11} fill="#1a1b20" />
    <path
      d={`M ${side * 120},18 q ${side * 14},10 0,20 q ${-side * 14},10 0,20 q ${side * 14},10 0,20 q ${-side * 14},10 0,20 q ${side * 14},10 0,20 L ${side * 110},170`}
      stroke="#e6ecf2"
      strokeWidth={5}
      fill="none"
      opacity={0.85}
    />
  </g>
);

/* ------------------------------------------------------------------ mom */

const MOM_SKIN: Tone = {base: '#b0714a', shade: '#7f4c2f', light: '#cf9168'};

/** Davi's mom: warm brown skin like Davi, dark curly bun, teal house dress, small gold earrings. */
export const MOM_OUTFIT: Outfit = {
  skin: MOM_SKIN,
  torso: 'dress',
  top: {base: '#2a8a8c', shade: '#1a5f61', light: '#5cc1c2'},
  legs: MOM_SKIN,
  shoes: 'barefoot',
  shoeColor: {base: '#2a8a8c', shade: '#1a5f61', light: '#5cc1c2'},
  gloves: false,
  head: {hair: 'curlyBun', hairColor: '#2b1810', earrings: '#e8b84a', lashes: true, lipstick: '#a23a48', browWidth: 12},
  armW: 52,
  legW: 56,
};

type PlaceProps = {x: number; y: number; height: number; blur?: number; flip?: boolean; children?: React.ReactNode};

export const Mom: React.FC<Omit<PuppetProps, 'outfit'> & {santaHat?: {flop?: number; droop?: number}}> = ({santaHat, ...props}) => (
  <g>
    <Puppet outfit={MOM_OUTFIT} {...props} />
    {santaHat && (
      <HeadFrame pose={props.pose}>
        <SantaHat {...santaHat} />
      </HeadFrame>
    )}
  </g>
);

export const PlacedMom: React.FC<Omit<PuppetProps, 'outfit'> & PlaceProps & {santaHat?: {flop?: number; droop?: number}}> = ({santaHat, children, ...props}) => (
  <PlacedPuppet outfit={MOM_OUTFIT} {...props}>
    {santaHat && (
      <HeadFrame pose={props.pose}>
        <SantaHat {...santaHat} />
      </HeadFrame>
    )}
    {children}
  </PlacedPuppet>
);

/* ------------------------------------------------------------------ kid Davi */

/** Kid Davi = the fixed Davi design, smaller. Height factors relative to adult Davi. */
export const KID_SCALE = {five: 0.56, ten: 0.72};

/** Kid Davi placed with feet at (x, y); `height` is the ADULT-equivalent height, scaled by `age`. */
export const PlacedKidDavi: React.FC<Omit<PuppetProps, 'outfit'> & PlaceProps & {age?: 'five' | 'ten'; santaHat?: {flop?: number; droop?: number}}> = ({
  age = 'five',
  height,
  santaHat,
  children,
  ...props
}) => (
  <PlacedPuppet outfit={DAVI_OUTFIT} height={height * KID_SCALE[age]} {...props}>
    {santaHat && (
      <HeadFrame pose={props.pose}>
        <SantaHat {...santaHat} />
      </HeadFrame>
    )}
    {children}
  </PlacedPuppet>
);

/* ------------------------------------------------------------------ uncles */

const sneakerWhite: Tone = {base: '#eceae4', shade: '#b9b6ad', light: '#ffffff'};
const shorts: Tone = {base: '#5a6470', shade: '#3c444e', light: '#7d8794'};
const jeans: Tone = {base: '#46608a', shade: '#2e425f', light: '#6a84ad'};

export type UncleVariant = 'tioZe' | 'tioBeto' | 'tioNando';

/** Uncles: football-shirt green, red tee, blue polo. Bodies a bit heavier. */
export const UNCLE_OUTFITS: Record<UncleVariant, Outfit> = {
  tioZe: {
    skin: {base: '#c58a5f', shade: '#94603d', light: '#e0aa80'},
    torso: 'hoodie',
    top: {base: '#2f9a55', shade: '#1d6a39', light: '#5cc47e'},
    legs: shorts,
    shoes: 'sneaker',
    shoeColor: sneakerWhite,
    gloves: false,
    head: {hair: 'buzz', hairColor: '#2a1d15', beard: true},
    armW: 74,
    legW: 76,
  },
  tioBeto: {
    skin: {base: '#8f5a3a', shade: '#663c24', light: '#b07a56'},
    torso: 'hoodie',
    top: {base: '#c9473a', shade: '#8f2c22', light: '#e87566'},
    legs: jeans,
    shoes: 'sneaker',
    shoeColor: sneakerWhite,
    gloves: false,
    head: {hair: 'bald', hairColor: '#6b6464', beard: true},
    armW: 76,
    legW: 78,
  },
  tioNando: {
    skin: {base: '#d6a07a', shade: '#a6714f', light: '#f0c29e'},
    torso: 'hoodie',
    top: {base: '#3c72c4', shade: '#284f8c', light: '#6c9be0'},
    legs: shorts,
    shoes: 'sneaker',
    shoeColor: sneakerWhite,
    gloves: false,
    head: {hair: 'buzz', hairColor: '#9a9590'},
    armW: 70,
    legW: 72,
  },
};

export const Uncle: React.FC<Omit<PuppetProps, 'outfit'> & {variant: UncleVariant}> = ({variant, ...props}) => <Puppet outfit={UNCLE_OUTFITS[variant]} {...props} />;
export const PlacedUncle: React.FC<Omit<PuppetProps, 'outfit'> & PlaceProps & {variant: UncleVariant}> = ({variant, ...props}) => (
  <PlacedPuppet outfit={UNCLE_OUTFITS[variant]} {...props} />
);

/* ------------------------------------------------------------------ casino security */

const BLACK: Tone = {base: '#1c1d22', shade: '#0b0b0e', light: '#45474f'};
const BLACK_LEGS: Tone = {base: '#16171b', shade: '#08080a', light: '#3a3c43'};
const PATENT: Tone = {base: '#0c0c0f', shade: '#000', light: '#8a8d96'};

export type GuardVariant = 'guardA' | 'guardB';

/** Big casino security guys: black suit, sunglasses, bulky limbs (+ Earpiece accessory). */
export const GUARD_OUTFITS: Record<GuardVariant, Outfit> = {
  guardA: {
    skin: {base: '#7a4a32', shade: '#553220', light: '#9a6a4e'},
    torso: 'suit',
    top: BLACK,
    legs: BLACK_LEGS,
    shoes: 'dress',
    shoeColor: PATENT,
    gloves: false,
    head: {hair: 'bald', hairColor: '#1a120e', sunglasses: true},
    armW: 88,
    legW: 84,
  },
  guardB: {
    skin: {base: '#d8a684', shade: '#a87856', light: '#f0c6a6'},
    torso: 'suit',
    top: BLACK,
    legs: BLACK_LEGS,
    shoes: 'dress',
    shoeColor: PATENT,
    gloves: false,
    head: {hair: 'buzz', hairColor: '#3b2a20', sunglasses: true, beard: true},
    armW: 88,
    legW: 84,
  },
};

export const PlacedGuard: React.FC<Omit<PuppetProps, 'outfit'> & PlaceProps & {variant?: GuardVariant; earpiece?: boolean}> = ({
  variant = 'guardA',
  earpiece = true,
  children,
  ...props
}) => (
  <PlacedPuppet outfit={GUARD_OUTFITS[variant]} {...props}>
    {earpiece && (
      <HeadFrame pose={props.pose}>
        <Earpiece side={1} />
      </HeadFrame>
    )}
    {children}
  </PlacedPuppet>
);

/* ------------------------------------------------------------------ busts */

/** Head-and-shoulders of any outfit: head of radius `r` px centred at (cx, cy). */
export const Bust: React.FC<Omit<PuppetProps, 'upperOnly'> & {cx: number; cy: number; r: number; blur?: number; flip?: boolean; children?: React.ReactNode}> = ({
  cx,
  cy,
  r,
  ...props
}) => {
  const k = r / 122;
  return <PlacedPuppet {...props} x={cx} y={cy + 884 * k} height={1000 * k} upperOnly />;
};

/* ------------------------------------------------------------------ 4th chase agent ("o de azul") */

/** The 4th government agent of the chase: navy-blue suit (so "o de azul" reads), buzz cut, sunglasses, gloves. */
export const AGENT_BLUE_OUTFIT: Outfit = {
  skin: {base: '#e0b08c', shade: '#b07c58', light: '#f6d0b0'},
  torso: 'suit',
  top: {base: '#2f4f8f', shade: '#1d3462', light: '#5577bb'},
  legs: {base: '#283f70', shade: '#18284a', light: '#46609a'},
  shoes: 'dress',
  shoeColor: PATENT,
  gloves: true,
  head: {hair: 'buzz', hairColor: '#4a3426', sunglasses: true},
};
export const PlacedBlueAgent: React.FC<Omit<PuppetProps, 'outfit'> & PlaceProps> = (props) => <PlacedPuppet outfit={AGENT_BLUE_OUTFIT} {...props} />;

/* ------------------------------------------------------------------ commuters (crowd extras) */

const SKINS: Tone[] = [
  {base: '#f0c8a8', shade: '#c49a78', light: '#ffe2cc'},
  {base: '#d6a07a', shade: '#a6714f', light: '#f0c29e'},
  {base: '#b47a52', shade: '#835236', light: '#d29a72'},
  {base: '#8a5536', shade: '#603823', light: '#a87252'},
  {base: '#5e3a26', shade: '#3e2416', light: '#7c5440'},
];
const TOPS: Tone[] = [
  {base: '#d9534f', shade: '#a23a37', light: '#f07b78'},
  {base: '#4f8fd9', shade: '#33639f', light: '#7fb2ef'},
  {base: '#7b5ea7', shade: '#57407a', light: '#a084cc'},
  {base: '#5cb85c', shade: '#3f8a3f', light: '#86d486'},
  {base: '#f0ad4e', shade: '#b97f2f', light: '#ffc97a'},
  {base: '#6c757d', shade: '#495057', light: '#959da5'},
  {base: '#e86fa0', shade: '#b04a78', light: '#ff9cc4'},
  {base: '#2fb5b0', shade: '#1f817d', light: '#62d6d1'},
];
const LEGS: Tone[] = [
  {base: '#3f5f93', shade: '#283f66', light: '#6283b8'},
  {base: '#2d2f36', shade: '#17181c', light: '#4e515a'},
  {base: '#8a7356', shade: '#64523c', light: '#ab9474'},
  {base: '#5a6470', shade: '#3c444e', light: '#7d8794'},
];
const HAIRS = ['quiff', 'buzz', 'bald', 'curlyBun'] as const;
const HAIR_COLORS = ['#1e130d', '#3a2416', '#6b4a2a', '#9a9590', '#c79a4a', '#2b1810'];

/** Deterministic random commuter outfit (never Davi's mustard hoodie, never sunglasses/agent look). */
export const commuterOutfit = (seed: number): Outfit => {
  const r = (k: number) => {
    const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const skin = SKINS[Math.floor(r(1) * SKINS.length)];
  const hair = HAIRS[Math.floor(r(2) * HAIRS.length)];
  const dress = hair === 'curlyBun' && r(3) > 0.4;
  const top = TOPS[Math.floor(r(4) * TOPS.length)];
  return {
    skin,
    torso: dress ? 'dress' : 'hoodie',
    top,
    legs: dress ? skin : LEGS[Math.floor(r(5) * LEGS.length)],
    shoes: dress ? 'heels' : 'sneaker',
    shoeColor: dress ? {base: '#2d2f36', shade: '#17181c', light: '#4e515a'} : sneakerWhite,
    gloves: false,
    head: {
      hair,
      hairColor: HAIR_COLORS[Math.floor(r(6) * HAIR_COLORS.length)],
      beard: hair !== 'curlyBun' && r(7) > 0.7,
      lashes: hair === 'curlyBun',
    },
    armW: dress ? 52 : undefined,
    legW: dress ? 56 : undefined,
  };
};

export const PlacedCommuter: React.FC<Omit<PuppetProps, 'outfit'> & PlaceProps & {seed: number}> = ({seed, ...props}) => (
  <PlacedPuppet outfit={commuterOutfit(seed)} {...props} />
);
