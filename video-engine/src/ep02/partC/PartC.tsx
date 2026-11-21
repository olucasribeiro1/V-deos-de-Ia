import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {CUTS} from './kit';
import * as G from './ShotsGlobe';
import * as M from './ShotsMonaco';

/** Part C (L17–L25 + tail). Local frame 0 = PARTS.C.start (75.94 s). Hard cuts on word starts (see cutlist.json). */
const Todo: React.FC<{id: string}> = ({id}) => <AbsoluteFill style={{background: '#222', color: '#fff', fontSize: 60, alignItems: 'center', justifyContent: 'center'}}>{id}</AbsoluteFill>;

const SHOTS: Record<string, React.FC> = {
  c01_daviMirror: M.DaviMirror,
  c02_imagineTable: M.ImagineTable,
  c03_imagineVanish: M.ImagineVanish,
  c04_monacoMap: M.MonacoMapShot,
  c05_mapAgents: M.MapAgents,
  c19_rochaSmile: M.RochaSmile,
  c20_daviDecide: M.DaviDecide,
  c21_estalo: M.Estalo,
  c22_shards: M.Shards,
  c23_rochaWalk: M.RochaWalk,
  c24_terraceWide: M.TerraceWide,
  c25_liaAlone: M.LiaAlone,
  c26_rochaSits: M.RochaSits,
  c27_glovePhone: M.GlovePhone,
  c06_globeFar: G.GlobeFar,
  c07_monacoLisbon: G.MonacoLisbon,
  c08_liaVector: G.LiaVector,
  c09_lisbonImpact: G.LisbonImpact,
  c10_globeSearch: G.GlobeSearch,
  c11_mirror: G.Mirror,
  c12_angles: G.Angles,
  c13_sameLine: G.SameLine,
  c14_openOcean: G.OpenOcean,
  c15_coldSea: G.ColdSeaShot,
  c37_black: () => <AbsoluteFill style={{background: '#000'}} />,
};

export const PartC: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {CUTS.map((c) => {
      const Shot = SHOTS[c.id] ?? (() => <Todo id={c.id} />);
      return (
        <Sequence key={c.id} from={c.from} durationInFrames={c.dur} name={c.id}>
          <Shot />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
