import React from 'react';
import {Series} from 'remotion';
import {COMPILED, SFX} from '../episodes/registry';
import {SceneView} from './SceneView';

/** Episódio completo = cenas em série (cada cena também é uma composição própria, p/ render segmentado). */
export const EpisodeComp: React.FC<{episodeId: string}> = ({episodeId}) => {
  const ep = COMPILED[episodeId];
  return (
    <Series>
      {ep.scenes.map((s) => (
        <Series.Sequence key={s.id} durationInFrames={s.frames}>
          <SceneView scene={s} sfxLib={SFX} audioBase={ep.audioBase} />
        </Series.Sequence>
      ))}
    </Series>
  );
};

export const SceneComp: React.FC<{episodeId: string; sceneId: string}> = ({episodeId, sceneId}) => {
  const ep = COMPILED[episodeId];
  const s = ep.scenes.find((x) => x.id === sceneId)!;
  return <SceneView scene={s} sfxLib={SFX} audioBase={ep.audioBase} />;
};
