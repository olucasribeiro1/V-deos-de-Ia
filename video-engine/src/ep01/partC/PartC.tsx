import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {CUTS} from './kit';
import * as G from './ShotsGlobe';
import * as S from './ShotsSea';
import * as K from './ShotsKiosk';

/** Part C (L17–L22 + tail). Local frame 0 = PARTS.C.start (72.55 s). Hard cuts on word starts (see cutlist.json). */
const SHOTS: Record<string, React.FC> = {
  c01_mathFace: G.MathFace,
  c02_globeSpin: G.GlobeSpin,
  c03_twoThings: G.TwoThings,
  c04_equator: G.Equator,
  c05_meridian: G.Meridian,
  c06_rioPin: G.RioPin,
  c07_south23: G.South23,
  c08_north23: G.North23,
  c09_sameLine: G.SameLine,
  c10_sameSpeed: G.SameSpeed,
  c11_atlantic: G.Atlantic,
  c12_seaSame: S.SeaSame,
  c13_daviSmile: K.DaviSmile,
  c14_estalo: K.Estalo,
  c15_splash: S.FallSplash,
  c16_floating: S.Floating,
  c17_drone: S.Drone,
  c18_release: S.Release,
  c19_swim: S.Swim,
  c20_backAcai: K.BackAcai,
  c21_buoy: S.BuoyDrop,
  c22_phone: K.Phone,
  c23_agents: K.Agents,
  c24_rochaBuoy: S.RochaBuoy,
  c25_toss: K.Toss,
  c26_canSpin: K.CanSpin,
  c27_black: () => <AbsoluteFill style={{background: '#000'}} />,
};

export const PartC: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {CUTS.map((c) => {
      const Shot = SHOTS[c.id];
      return (
        <Sequence key={c.id} from={c.from} durationInFrames={c.dur} name={c.id}>
          <Shot />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
