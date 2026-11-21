import React from 'react';
import {Composition} from 'remotion';
import {VIDEO} from '../config/video';
import {CharacterSheet} from './dev/CharacterSheet';
import {HandsTest} from './dev/HandsTest';
import {EPISODES} from '../episodes/registry';
import {SceneComp, EpisodeComp} from './EpisodeComp';

export const Root: React.FC = () => (
  <>
    <Composition id="dev-characters" component={CharacterSheet} durationInFrames={48} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="dev-closeup" component={CharacterSheet} defaultProps={{close: true}} durationInFrames={48} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    <Composition id="dev-hands" component={HandsTest} durationInFrames={24} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    {EPISODES.map((ep) => (
      <React.Fragment key={ep.id}>
        <Composition
          id={ep.id}
          component={EpisodeComp}
          defaultProps={{episodeId: ep.id}}
          durationInFrames={ep.totalFrames}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
        {ep.scenes.map((s) => (
          <Composition
            key={s.id}
            id={`${ep.id}--${s.id}`}
            component={SceneComp}
            defaultProps={{episodeId: ep.id, sceneId: s.id}}
            durationInFrames={s.frames}
            fps={VIDEO.fps}
            width={VIDEO.width}
            height={VIDEO.height}
          />
        ))}
      </React.Fragment>
    ))}
  </>
);
