import React from 'react';
import {Puppet, PuppetProps, PlacedPuppet} from './Puppet';
import {HeelsInHand} from './parts';
import type {Outfit, Tone} from './types';

/** Gold for heels / earrings / belt. */
export const LIA_GOLD: Tone = {base: '#e2b04a', shade: '#a77a22', light: '#ffe08f'};

/** Lia: 24, warm brown skin, big curly bun, emerald dress, gold earrings + heels. */
export const LIA_OUTFIT: Outfit = {
  skin: {base: '#9a5f3e', shade: '#6e3f26', light: '#bf8160'},
  torso: 'dress',
  top: {base: '#13845e', shade: '#0b5a3f', light: '#3fc192'},
  legs: {base: '#9a5f3e', shade: '#6e3f26', light: '#bf8160'},
  shoes: 'heels',
  shoeColor: LIA_GOLD,
  gloves: false,
  head: {hair: 'curlyBun', hairColor: '#1e130d', earrings: '#e8b84a', lashes: true, lipstick: '#a3343f', browWidth: 12},
  armW: 50,
  legW: 54,
};

export type LiaProps = Omit<PuppetProps, 'outfit'> & {
  /** carry the heels in this hand (feet go bare) */
  carryHeels?: 'L' | 'R';
  /** swing angle (deg) of the carried heels */
  heelSwing?: number;
};

const outfitFor = (carry?: 'L' | 'R'): Outfit => (carry ? {...LIA_OUTFIT, shoes: 'barefoot'} : LIA_OUTFIT);
const handPropsFor = (carry?: 'L' | 'R', swing = 0) =>
  carry ? {[carry]: <HeelsInHand tone={LIA_GOLD} swing={swing} />} : undefined;

export const Lia: React.FC<LiaProps> = ({carryHeels, heelSwing, ...props}) => (
  <Puppet outfit={outfitFor(carryHeels)} handProps={handPropsFor(carryHeels, heelSwing)} {...props} />
);
export const PlacedLia: React.FC<LiaProps & {x: number; y: number; height: number; blur?: number; flip?: boolean; children?: React.ReactNode}> = ({
  carryHeels,
  heelSwing,
  ...props
}) => <PlacedPuppet outfit={outfitFor(carryHeels)} handProps={handPropsFor(carryHeels, heelSwing)} {...props} />;
