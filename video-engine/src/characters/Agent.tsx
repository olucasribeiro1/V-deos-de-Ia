import React from 'react';
import {Puppet, PuppetProps, PlacedPuppet} from './Puppet';
import type {Outfit} from './types';

const SUIT = {base: '#4a4e57', shade: '#2c2f36', light: '#6c717c'};
const TROUSERS = {base: '#3b3e46', shade: '#24262c', light: '#5a5e68'};
const SHOES = {base: '#16161a', shade: '#050506', light: '#5d5f66'};

export type AgentVariant = 'rocha' | 'agentA' | 'agentB';

export const AGENT_OUTFITS: Record<AgentVariant, Outfit> = {
  /** Rocha: bald, short beard, charcoal suit, sunglasses, black gloves */
  rocha: {
    skin: {base: '#d79f78', shade: '#a8704f', light: '#efc19c'},
    torso: 'suit',
    top: SUIT,
    legs: TROUSERS,
    shoes: 'dress',
    shoeColor: SHOES,
    gloves: true,
    head: {hair: 'bald', hairColor: '#3a2a22', beard: true, sunglasses: true},
  },
  agentA: {
    skin: {base: '#c48d66', shade: '#93603f', light: '#deae86'},
    torso: 'suit',
    top: SUIT,
    legs: TROUSERS,
    shoes: 'dress',
    shoeColor: SHOES,
    gloves: true,
    head: {hair: 'buzz', hairColor: '#8b8a8c', sunglasses: true},
  },
  agentB: {
    skin: {base: '#6f4430', shade: '#4b2b1d', light: '#8f5c42'},
    torso: 'suit',
    top: SUIT,
    legs: TROUSERS,
    shoes: 'dress',
    shoeColor: SHOES,
    gloves: true,
    head: {hair: 'bald', hairColor: '#1d1410', sunglasses: true},
  },
};

type P = Omit<PuppetProps, 'outfit'> & {variant?: AgentVariant};
export const Agent: React.FC<P> = ({variant = 'agentA', ...props}) => <Puppet outfit={AGENT_OUTFITS[variant]} {...props} />;
export const Rocha: React.FC<Omit<P, 'variant'>> = (props) => <Agent variant="rocha" {...props} />;
export const PlacedAgent: React.FC<P & {x: number; y: number; height: number; blur?: number; flip?: boolean; children?: React.ReactNode}> = ({variant = 'agentA', ...props}) => (
  <PlacedPuppet outfit={AGENT_OUTFITS[variant]} {...props} />
);
