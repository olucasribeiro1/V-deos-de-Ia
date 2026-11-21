import React from 'react';

/**
 * Presets de iluminação cinematográfica ECONÔMICA (contagem de luzes FIXA — mudar a quantidade
 * de luzes recompila shaders; por isso tudo fica montado e só a intensidade varia).
 * 1 direcional com sombra (sol pela janela) + hemisférica + 2 pontuais quentes sem sombra.
 */
export type LightPreset = 'dusk' | 'night' | 'day' | 'blackout';

const PRESETS: Record<LightPreset, {sun: [string, number]; sky: string; ground: string; hemi: number; lamp: number; fog: [string, number, number]}> = {
  day: {sun: ['#fff1dc', 2.6], sky: '#b9c7d6', ground: '#6b5a48', hemi: 1.1, lamp: 0.0, fog: ['#a9b3ba', 40, 260]},
  dusk: {sun: ['#ffb070', 2.4], sky: '#9aa6ba', ground: '#4a4440', hemi: 1.25, lamp: 0.8, fog: ['#6a6460', 35, 230]},
  night: {sun: ['#7d95c8', 0.35], sky: '#33415a', ground: '#1e1a18', hemi: 0.45, lamp: 1.0, fog: ['#1d2229', 30, 200]},
  blackout: {sun: ['#6f86b8', 0.3], sky: '#28324a', ground: '#141210', hemi: 0.35, lamp: 0.0, fog: ['#15191f', 25, 180]},
};

export const Lighting: React.FC<{preset: LightPreset; lamps?: number; flicker?: number}> = ({preset, lamps = 1, flicker = 1}) => {
  const p = PRESETS[preset];
  const lamp = p.lamp * lamps * flicker;
  return (
    <>
      <fog attach="fog" args={p.fog} />
      <hemisphereLight args={[p.sky, p.ground, p.hemi]} />
      <directionalLight
        position={[-9, 9, -16]}
        color={p.sun[0]}
        intensity={p.sun[1]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0008}
        shadow-normalBias={0.02}
        target-position={[-1, 0, -4]}
      />
      {/* luminárias (sala/cozinha e corredor) — sem sombra para economizar */}
      <pointLight position={[-1.8, 2.4, -5.4]} color="#ffdcb4" intensity={4.5 * lamp} distance={9} decay={1.6} />
      <pointLight position={[2.75, 2.4, -2.2]} color="#ffd2a0" intensity={2.6 * lamp} distance={6} decay={1.6} />
    </>
  );
};
