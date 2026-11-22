import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {PlacedDavi} from '../characters/Davi';
import {PlacedDaviNS} from '../nortesul/DaviNS';
import {CAPTION_FONT, HUD_FONT} from '../lib/fonts';

/** End card appended to every video: "Siga e acompanhe nas redes sociais @Odavi_contos". */
export const FollowCard: React.FC<{nortesul?: boolean}> = ({nortesul}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = (d: number) => spring({frame: frame - d, fps, config: {damping: 12, mass: 0.6}});
  const wave = Math.sin(frame / 4) * 25;
  const D = nortesul ? PlacedDaviNS : PlacedDavi;
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #2b3a7a 0%, #141a3a 70%)', opacity: fadeIn}}>
      <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', transform: `scale(${pop(4)})`}}>
        <div style={{fontFamily: CAPTION_FONT, fontWeight: 700, fontSize: 70, color: '#fff', lineHeight: 1.1, textShadow: '0 4px 0 rgba(0,0,0,0.5)'}}>
          SIGA E ACOMPANHE
          <br />
          NAS REDES SOCIAIS
        </div>
      </div>
      <div style={{position: 'absolute', top: 540, width: '100%', textAlign: 'center', transform: `scale(${pop(14)})`}}>
        <span style={{display: 'inline-block', padding: '18px 40px', borderRadius: 60, background: '#ffd23a', color: '#141a3a', fontFamily: HUD_FONT, fontWeight: 700, fontSize: 92, boxShadow: '0 10px 30px rgba(0,0,0,0.45)'}}>
          @Odavi_contos
        </span>
      </div>
      <D x={540} y={1900} height={1100} pose={{shR: 150 + wave, elR: -40, facing: 0.1}} expr={{smile: 0.8, halfSmile: 0.3, browRaise: 0.3}} />
    </AbsoluteFill>
  );
};
