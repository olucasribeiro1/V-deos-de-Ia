import React from 'react';
import {PlacedPuppet, Puppet, PuppetProps} from '../characters/Puppet';
import type {Lighting, Outfit, Tone} from '../characters/types';
import {DAVI_OUTFIT} from '../characters/Davi';
import {Pup} from '../ep02qi/partB/kit';

/**
 * EP06 "Bananinha" cast.
 * - Mateus: Davi's younger brother (same skin, same art style) — lime hoodie, grey shorts, white sneakers, messy hair.
 * - Kadu: fire-power rival — red jacket, black jeans, spiky black hair with an orange streak, smug.
 * - Bia (flies), teacher, dad, airport guards, students (reused from EP03).
 */
type PlaceProps = {x: number; y: number; height: number; blur?: number; flip?: boolean; children?: React.ReactNode};
type NoOutfit = Omit<PuppetProps, 'outfit'>;

const WHITE_SNEAKER: Tone = {base: '#eceae4', shade: '#b9b6ad', light: '#ffffff'};

export const MATEUS_OUTFIT: Outfit = {
  skin: DAVI_OUTFIT.skin,
  torso: 'hoodie',
  top: {base: '#8fd13a', shade: '#5f9a1e', light: '#b8ec6a'},
  legs: {base: '#5b6270', shade: '#3c424e', light: '#7f8796'},
  shoes: 'sneaker',
  shoeColor: WHITE_SNEAKER,
  gloves: false,
  head: {hair: 'messy', hairColor: '#24170f'},
};

export const KADU_OUTFIT: Outfit = {
  skin: {base: '#e2ad86', shade: '#b47e5a', light: '#f8cfae'},
  torso: 'hoodie',
  top: {base: '#d6342c', shade: '#931d18', light: '#ff6a52'},
  legs: {base: '#22242c', shade: '#111217', light: '#454857'},
  shoes: 'sneaker',
  shoeColor: {base: '#1c1c22', shade: '#09090b', light: '#ff8a2a'},
  gloves: false,
  head: {hair: 'spiky', hairColor: '#17110d', browWidth: 18},
  armW: 70,
};
export const KADU_SMUG = {halfSmile: 1, smile: 0.2, browAsym: 0.6, browTilt: -0.4, blink: 0.2};

export const BIA_OUTFIT: Outfit = {
  skin: {base: '#c98d62', shade: '#97613e', light: '#e6ad84'},
  torso: 'hoodie',
  top: {base: '#3fb6e8', shade: '#2380ab', light: '#86dcff'},
  legs: {base: '#f1f1f6', shade: '#c3c3cf', light: '#ffffff'},
  shoes: 'sneaker',
  shoeColor: {base: '#ff5c8a', shade: '#c63a64', light: '#ff9ab6'},
  gloves: false,
  head: {hair: 'curlyBun', hairColor: '#2a1a10', lashes: true, browWidth: 12},
  armW: 54,
  legW: 58,
};

export const TEACHER_OUTFIT: Outfit = {
  skin: {base: '#efc3a0', shade: '#c4977a', light: '#ffe0c8'},
  torso: 'dress',
  top: {base: '#7b5ea7', shade: '#54407a', light: '#a68ad0'},
  legs: {base: '#efc3a0', shade: '#c4977a', light: '#ffe0c8'},
  shoes: 'dress',
  shoeColor: {base: '#2a1d18', shade: '#120c0a', light: '#5a4a40'},
  gloves: false,
  head: {hair: 'curlyBun', hairColor: '#8a5a2a', lashes: true, lipstick: '#b8444f', browWidth: 11},
  armW: 50,
  legW: 52,
};

export const DAD_OUTFIT: Outfit = {
  skin: DAVI_OUTFIT.skin,
  torso: 'hoodie',
  top: {base: '#e9e4d6', shade: '#b9b3a2', light: '#ffffff'},
  legs: {base: '#4a5a7a', shade: '#33405a', light: '#6b7ea3'},
  shoes: 'sneaker',
  shoeColor: {base: '#6b4a2a', shade: '#4a311a', light: '#8f6a44'},
  gloves: false,
  head: {hair: 'buzz', hairColor: '#24170f', beard: true},
  armW: 74,
  legW: 76,
};

export const GUARD_OUTFIT: Outfit = {
  skin: {base: '#7a4a32', shade: '#553220', light: '#9a6a4e'},
  torso: 'suit',
  top: {base: '#2a3550', shade: '#171e30', light: '#4a5a80'},
  legs: {base: '#1f2536', shade: '#0f1320', light: '#3b4460'},
  shoes: 'dress',
  shoeColor: {base: '#0c0c0f', shade: '#000', light: '#8a8d96'},
  gloves: false,
  head: {hair: 'bald', hairColor: '#1a120e'},
  armW: 84,
  legW: 80,
};

export const Mateus: React.FC<NoOutfit> = (p) => <Puppet outfit={MATEUS_OUTFIT} {...p} />;
export const PlacedMateus: React.FC<NoOutfit & PlaceProps> = (p) => <PlacedPuppet outfit={MATEUS_OUTFIT} {...p} />;
export const PlacedKadu: React.FC<NoOutfit & PlaceProps> = ({expr, ...p}) => <PlacedPuppet outfit={KADU_OUTFIT} expr={{...KADU_SMUG, ...expr}} {...p} />;

/** Generic rotatable puppet (feet at x,y) for any outfit — used for slips / flying. */
export const Actor: React.FC<React.ComponentProps<typeof Pup>> = (p) => <Pup {...p} />;

export const DAY: Lighting = {side: -1, rim: '#fff2c4', rimStrength: 0.8, shadeStrength: 0.45};
export const NIGHT: Lighting = {side: 1, rim: '#ffcf8a', rimStrength: 0.85, shadeStrength: 0.7};
export const ARENA: Lighting = {side: 1, rim: '#ffe7b0', rimStrength: 0.85, shadeStrength: 0.6};
export const FIRE: Lighting = {side: 1, rim: '#ff9a3a', rimStrength: 1, shadeStrength: 0.6};
