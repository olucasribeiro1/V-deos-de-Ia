import React from 'react';
import type {Lighting, Outfit, Pose, Tone} from '../characters/types';
import {PuppetProps} from '../characters/Puppet';
import {PlacedWide} from '../ep03/characters';
import {DAVI_OUTFIT} from '../characters/Davi';
import {Crown, EL, ElfEars, FaceMark} from './art';

/**
 * EP07 "Sem Marca" cast. Davi = "você" (design unchanged). Everyone else in Aldoria carries a face mark.
 */
const T = (base: string, shade: string, light: string): Tone => ({base, shade, light});
const SKINS = [T('#f1c9a5', '#c99a76', '#ffe2c8'), T('#c98d62', '#97613e', '#e6ad84'), T('#8a5536', '#603823', '#a87252'), T('#e2ad86', '#b47e5a', '#f8cfae')];
const BOOT = T('#4a2e1a', '#2a180c', '#6a4a30');

export const robe = (col: Tone, skin = 0, hair: Outfit['head'] = {hair: 'buzz', hairColor: '#2a1a10'}): Outfit => ({
  skin: SKINS[skin % SKINS.length],
  torso: 'hoodie',
  top: col,
  legs: col,
  shoes: 'dress',
  shoeColor: BOOT,
  gloves: false,
  head: hair,
  armW: 62,
});

export const MAGE: Record<'fogo' | 'agua' | 'terra' | 'vento' | 'raio', Outfit> = {
  fogo: robe(T('#b8302a', '#7a1a16', '#e8564a'), 3, {hair: 'spiky', hairColor: '#2a1008'}),
  agua: {...robe(T('#2a5ab8', '#183a7a', '#4a8ae8'), 1, {hair: 'curlyBun', hairColor: '#1a1008', lashes: true, browWidth: 12}), torso: 'dress'},
  terra: robe(T('#7a5a30', '#543c1c', '#a07a48'), 2, {hair: 'bald', hairColor: '#1a1008', beard: true}),
  vento: robe(T('#d8dce8', '#a8aebe', '#ffffff'), 0, {hair: 'messy', hairColor: '#d8c070'}),
  raio: robe(T('#2a2a3a', '#16161e', '#4a4a60'), 3, {hair: 'quiff', hairColor: '#f0e060'}),
};
export const MAGE_MARK: Record<keyof typeof MAGE, string> = {fogo: EL.fogo, agua: EL.agua, terra: EL.terra, vento: EL.vento, raio: EL.raio};

export const ELF = robe(T('#3a8a4a', '#1e5a2a', '#5ab86a'), 0, {hair: 'messy', hairColor: '#f0d878'});
export const DWARF: Outfit = {...robe(T('#6a4a2a', '#4a3018', '#8a6a44'), 3, {hair: 'bald', hairColor: '#b8542a', beard: true}), torso: 'hoodie', armW: 86, legW: 90};
export const KING = robe(T('#5a2a8a', '#3a1a5a', '#7a4ab8'), 0, {hair: 'bald', hairColor: '#e8e8e8', beard: true});
export const DIRECTOR = robe(T('#2a3a6a', '#16224a', '#4a5a9a'), 0, {hair: 'bald', hairColor: '#f2f2f2', beard: true});
export const YOUNG_BROTHER = robe(T('#6a6a6a', '#4a4a4a', '#8a8a8a'), 0, {hair: 'messy', hairColor: '#5a5a5a'});
export const GUARD: Outfit = {
  skin: SKINS[1],
  torso: 'suit',
  top: T('#8a8f9a', '#5a5e68', '#c0c4cc'),
  legs: T('#4a4e58', '#2a2e36', '#6a6e78'),
  shoes: 'dress',
  shoeColor: BOOT,
  gloves: true,
  head: {hair: 'buzz', hairColor: '#1a1008', browWidth: 20},
  armW: 82,
  legW: 80,
};
export const KID = (i: number): Outfit => ({
  skin: SKINS[i % 4],
  torso: 'hoodie',
  top: [T('#c8782a', '#8a4e14', '#e8a04a'), T('#4a8a5a', '#2a5a3a', '#6ab87a'), T('#8a3a6a', '#5a1e44', '#b85a8a')][i % 3],
  legs: T('#6a5a4a', '#4a3a2a', '#8a7a6a'),
  shoes: 'dress',
  shoeColor: BOOT,
  gloves: false,
  head: {hair: (['messy', 'curlyBun', 'quiff'] as const)[i % 3], hairColor: ['#3a2410', '#1a1008', '#8a4a1a'][i % 3], lashes: i % 3 === 1},
});
/** Academy student in grey/blue tunic, with mark n/color. */
export const STUDENT = (i: number): Outfit => ({
  skin: SKINS[i % 4],
  torso: 'suit',
  top: [T('#2a3a6a', '#16224a', '#4a5a9a'), T('#4a2a5a', '#2a163a', '#6a4a8a')][i % 2],
  legs: T('#3a3a44', '#22222a', '#5a5a66'),
  shoes: 'dress',
  shoeColor: BOOT,
  gloves: false,
  head: {hair: (['quiff', 'curlyBun', 'messy', 'buzz', 'spiky'] as const)[i % 5], hairColor: ['#2a1a10', '#6a3a1a', '#d8b060', '#1a1008', '#8a2a1a'][i % 5], lashes: i % 5 === 1},
});
export const FIRE_KID = STUDENT(4);
export const STUDENT_MARK = (i: number) => ({n: 1 + (i % 3), color: [EL.fogo, EL.agua, EL.terra, EL.vento, EL.raio][i % 5]});

type Place = {x: number; y: number; height: number; flip?: boolean; blur?: number; wide?: number; children?: React.ReactNode};
type Base = Omit<PuppetProps, 'outfit'> & Place;

/** Any outfit with a face mark (n lines, colour) and optional extras. */
export const Marked: React.FC<Base & {outfit: Outfit; mark?: {n: number; color: string; glow?: number}; ears?: boolean; crown?: 'crown' | 'wizard'; crownColor?: string}> = ({outfit, mark, ears, crown, crownColor, children, pose, ...p}) => (
  <PlacedWide outfit={outfit} pose={pose} {...p}>
    {ears && <ElfEars pose={pose} skin={outfit.skin.base} />}
    {mark && <FaceMark n={mark.n} color={mark.color} pose={pose} glow={mark.glow ?? 0.6} />}
    {crown && <Crown pose={pose} kind={crown} color={crownColor} />}
    {children}
  </PlacedWide>
);

/** Davi (the "você") with optional children in puppet units. */
export const DaviP: React.FC<Base> = ({children, ...p}) => (
  <PlacedWide outfit={DAVI_OUTFIT} {...p}>
    {children}
  </PlacedWide>
);

export const DAY: Lighting = {side: -1, rim: '#fff2c4', rimStrength: 0.8, shadeStrength: 0.45};
export const NIGHT: Lighting = {side: 1, rim: '#9fc8ff', rimStrength: 0.85, shadeStrength: 0.7};
export const HALL: Lighting = {side: 1, rim: '#ffcf8a', rimStrength: 0.9, shadeStrength: 0.65};
export const HEAD: Lighting = {side: 1, rim: '#fffbe0', rimStrength: 1, shadeStrength: 0.6};
export const fire = (c: string): Lighting => ({side: 1, rim: c, rimStrength: 1, shadeStrength: 0.6});

export const STILL: Pose = {};
