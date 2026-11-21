import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate, getInputProps} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {VIDEO} from '../config/video';
import type {CompiledScene} from '../systems/timeline/compile';
import {eventAt} from '../systems/timeline/compile';
import {buildPovTrack} from '../systems/camera/pov';
import {PovRig} from '../components/camera/PovRig';
import {PovHands} from '../components/hands/PovHands';
import {Phone} from '../components/props/Phone';
import {Apartment} from '../components/environments/Apartment';
import {City} from '../components/environments/City';
import {Lighting} from '../components/lighting/Lighting';
import {Actor} from '../components/characters/Actor';
import {Outlines} from '../components/effects/Outlines';
import {Grade} from '../components/effects/Grade';
import {Subtitles} from '../components/ui/Subtitles';
import {Countdown, TipCard} from '../components/ui/Overlays';
import type {SfxManifest} from '../systems/timeline/script';
import * as F from '../library/furniture';
import {hash} from '../systems/animation/math';
import {PROTAGONIST, validateProtagonist} from '../library/characters';

const PropMesh: React.FC<{name: string; screen: any}> = ({name, screen}) => {
  switch (name) {
    case 'phone':
      // celular apoiado na palma (frente da palma = +Z); dedos ficam atrás do aparelho
      return (
        <group position={[0, 0.1, 0.036]}>
          <Phone screen={screen} />
        </group>
      );
    case 'bottle':
      return <group position={[0, 0.02, 0.05]} rotation={[0, 0, 0]}><F.WaterBottle position={[0, -0.12, 0]} /></group>;
    case 'can':
      return <group position={[0, 0.03, 0.05]}><F.Can position={[0, -0.05, 0]} /></group>;
    case 'knife':
      return <group position={[0, 0.06, 0.03]} rotation={[0.2, 0, 0]}><F.Knife position={[0, 0, 0]} /></group>;
    case 'keys':
      return <group position={[0, 0.07, 0.03]} rotation={[0.3, 0, 0.4]}><F.Keys position={[0, 0, 0]} /></group>;
    default:
      return null;
  }
};

/** Renderiza UMA cena compilada (usada tanto pela composição da cena quanto pelo episódio). */
export const SceneView: React.FC<{scene: CompiledScene; sfxLib: SfxManifest; audioBase: string}> = ({scene, sfxLib, audioBase}) => {
  validateProtagonist(PROTAGONIST); // CHARACTER BIBLE: falha o render se o boné/pele/roupa mudar
  const bench = (getInputProps() as any).bench ?? {};
  const frame = useCurrentFrame();
  const t = frame / VIDEO.fps;
  const track = useMemo(() => buildPovTrack(scene.pov, VIDEO.fps, scene.frames, scene.shakes), [scene]);
  const env = scene.env(t);
  const screenEv = eventAt(scene.phone, t);
  const screen = screenEv.v.kind === 'incoming' ? {...screenEv.v, pulse: (Math.sin(screenEv.since * 6) + 1) / 2} : screenEv.v;
  const rProp = eventAt(scene.propR, t).v;
  const lProp = eventAt(scene.propL, t).v;
  const chaos = scene.scene.chaos ?? 0;
  // passos automáticos: um SFX por passo detectado no movimento da câmera (sincronia garantida)
  const steps = useMemo(
    () => track.steps.map((s, i) => ({...s, id: `footstep_${(Math.floor(hash(i * 7.1 + s.frame) * 3) % 3) + 1}`})).filter((s) => sfxLib[s.id]),
    [track, sfxLib],
  );
  const fade = scene.fade(t);
  const title = scene.titles.find((x) => t >= x.t && t < x.t + x.dur && !x.text.startsWith('@'));
  const stamp = scene.titles.find((x) => t >= x.t && t < x.t + x.dur && x.text.startsWith('@'));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {!bench.no3d && <ThreeCanvas width={VIDEO.width} height={VIDEO.height} shadows={!bench.noShadows} gl={{antialias: !bench.noAA, powerPreference: 'high-performance'}}>
        <Lighting preset={scene.scene.light} lamps={env.lightsOn ?? 1} />
        {!bench.noApt && <Apartment state={env} t={t} />}
        {!bench.noCity && <City t={t + 20} chaos={chaos} bench={bench} crash={env.crash} />}
        {!bench.noActors && scene.actors.map((a, i) => (
          <Actor key={i} track={a} t={t} />
        ))}
        <PovRig track={track} frame={frame}>
          {!bench.noHands && <PovHands
            right={scene.handR(t)}
            left={scene.handL(t)}
            t={t}
            rightProp={<PropMesh name={rProp} screen={screen} />}
            leftProp={<PropMesh name={lProp} screen={screen} />}
          />}
        </PovRig>
        {!bench.noOutlines && <Outlines />}
      </ThreeCanvas>}
      <Grade danger={scene.danger(t)} fade={fade} lens={scene.lens(t)} grain={bench.noGrain ? 0 : undefined} />
      {title && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div
            style={{
              fontFamily: '"DejaVu Sans", Arial, sans-serif',
              fontWeight: 900,
              fontSize: 64,
              letterSpacing: 6,
              color: '#f4f1ea',
              textShadow: '0 4px 0 #000, 0 0 24px rgba(0,0,0,0.8)',
              opacity: interpolate(t - title.t, [0, Math.min(0.5, title.dur / 3), title.dur - Math.min(0.5, title.dur / 3), title.dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            }}
          >
            {title.text}
          </div>
        </AbsoluteFill>
      )}
      {stamp && (
        /* carimbo de horário da série ("hora a hora") — canto superior esquerdo */
        <div
          style={{
            position: 'absolute',
            left: 48,
            top: 40,
            fontFamily: '"DejaVu Sans Mono", monospace',
            fontWeight: 700,
            fontSize: 30,
            color: '#f4f1ea',
            background: 'rgba(10,10,12,0.55)',
            padding: '6px 14px',
            borderLeft: '6px solid #d42a22',
            opacity: interpolate(t - stamp.t, [0, 0.4, stamp.dur - 0.5, stamp.dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          {stamp.text.slice(1)}
        </div>
      )}
      {scene.timer && <Countdown remaining={scene.timer.remaining} t={t} showAt={scene.timer.t} brokenAt={scene.timer.brokenAt} />}
      {scene.tips.filter((x) => t >= x.t && t < x.t + x.dur).map((x) => (
        <TipCard key={x.t} title={x.title} text={x.text} src={x.src} t={t - x.t} dur={x.dur} />
      ))}
      <Subtitles lines={scene.lines} t={t} />
      {/* ---- áudio ---- */}
      {scene.lines.map((l) =>
        l.file ? (
          <Sequence key={l.id} from={Math.round(l.t * VIDEO.fps)} layout="none">
            <Audio src={staticFile(`${audioBase}/${l.file}`)} volume={1} />
          </Sequence>
        ) : null,
      )}
      {scene.sfx.map((s, i) =>
        sfxLib[s.id] ? (
          <Sequence key={`s${i}`} from={Math.round(s.t * VIDEO.fps)} layout="none" durationInFrames={s.loop ? Math.round(s.loop * VIDEO.fps) : undefined}>
            <Audio src={staticFile(`library/sfx/${sfxLib[s.id].file}`)} volume={s.vol} loop={!!s.loop} />
          </Sequence>
        ) : null,
      )}
      {steps.map((s, i) => (
        <Sequence key={`f${i}`} from={s.frame} layout="none" durationInFrames={18}>
          <Audio src={staticFile(`library/sfx/${sfxLib[s.id].file}`)} volume={0.22 + s.intensity * 0.35} />
        </Sequence>
      ))}
      {(scene.scene.ambience ?? []).map((a) =>
        sfxLib[a.id] ? <Audio key={a.id} src={staticFile(`library/sfx/${sfxLib[a.id].file}`)} volume={a.vol} loop /> : null,
      )}
      {(scene.scene.music ?? []).map((m) =>
        sfxLib[m.id] ? (
          <Sequence key={m.id} from={Math.round((m.at ?? 0) * VIDEO.fps)} layout="none">
            <Audio
              src={staticFile(`library/sfx/${sfxLib[m.id].file}`)}
              loop
              volume={(f) => m.vol * interpolate(f, [0, (m.fadeIn ?? 2) * VIDEO.fps], [0, 1], {extrapolateRight: 'clamp'})}
            />
          </Sequence>
        ) : null,
      )}
    </AbsoluteFill>
  );
};
