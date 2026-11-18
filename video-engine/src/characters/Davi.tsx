import React from 'react';
import {Puppet, PuppetProps, PlacedPuppet} from './Puppet';
import type {Outfit} from './types';

export const DAVI_OUTFIT: Outfit = {
  skin: {base: '#a86a43', shade: '#7a4529', light: '#c98b5f'},
  torso: 'hoodie',
  top: {base: '#e0a92a', shade: '#a8731a', light: '#f3c64e'},
  legs: {base: '#3f5f93', shade: '#283f66', light: '#6283b8'},
  shoes: 'sneaker',
  shoeColor: {base: '#f57a1f', shade: '#c4520e', light: '#ffab5c'},
  gloves: false,
  head: {hair: 'quiff', hairColor: '#24170f'},
};

type P = Omit<PuppetProps, 'outfit'>;
export const Davi: React.FC<P> = (props) => <Puppet outfit={DAVI_OUTFIT} {...props} />;
export const PlacedDavi: React.FC<P & {x: number; y: number; height: number; blur?: number; flip?: boolean}> = (props) => (
  <PlacedPuppet outfit={DAVI_OUTFIT} {...props} />
);
