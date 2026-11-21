import React from 'react';
import {deg} from '../../systems/animation/math';
import {mat, PAL} from '../../library/materials';
import type {Pose} from '../../systems/animation/clips';

/**
 * PERSONAGEM CARTOON 3D (estilo "stick viral" toon): cabeça grande e redonda, olhos grandes
 * (esclera branca + pupila), sobrancelhas, nariz e orelhas simples, membros em tubo, mãos arredondadas.
 * Sombreamento toon + contorno preto automático (<Outlines/>). Volume e sombra reais — nunca 2D.
 * Rig: root → hips → spine → chest → neck → head ; chest → braço → antebraço → mão ; hips → coxa → canela → pé.
 */
export type CharacterSpec = {
  id: string;
  height: number; // metros
  build: number; // 0.85 magro … 1.2 largo
  skin: string;
  hair: string;
  hairStyle: 'short' | 'buzz' | 'long' | 'bald' | 'messy' | 'bun' | 'curly';
  cap?: string;
  top: string;
  topStyle: 'jacket' | 'shirt' | 'scrubs' | 'hoodie' | 'coat';
  topAccent?: string;
  bottom: string;
  shoes: string;
  infected?: {decay: number; blood: number; eyes?: string};
  glasses?: boolean;
  beard?: string;
};

export type Face = {
  look?: [number, number]; // direção das pupilas (-1..1)
  blink?: number; // 0 aberto … 1 fechado
  brows?: number; // -1 preocupado … 0 neutro … 1 bravo
  mouth?: number; // 0 fechada … 1 aberta (fala/grito)
};

const Tube: React.FC<{len: number; r: number; m: any}> = ({len, r, m}) => (
  <mesh position={[0, -len / 2, 0]} material={m} castShadow>
    <capsuleGeometry args={[r, Math.max(0.001, len), 4, 10]} />
  </mesh>
);

const R = (v?: [number, number, number]): [number, number, number] => (v ? [deg(v[0]), deg(v[1]), deg(v[2])] : [0, 0, 0]);

const WHITE = '#fbfaf6';
const INK = '#1b1b1b';

/** Mão cartoon: palma arredondada + 4 dedos em cápsula + polegar. `grip` 0 aberta … 1 fechada. */
export const ToonHand: React.FC<{skin: string; grip?: number; scale?: number}> = ({skin, grip = 0.4, scale = 1}) => {
  const m = mat(skin);
  return (
    <group scale={scale}>
      <mesh position={[0, -0.045, 0]} scale={[1, 1.05, 0.62]} material={m} castShadow>
        <sphereGeometry args={[0.048, 12, 10]} />
      </mesh>
      {[0.03, 0.01, -0.01, -0.028].map((x, i) => (
        <group key={i} position={[x, -0.085, 0]} rotation={[deg(grip * 85), 0, 0]}>
          <mesh position={[0, -0.022, 0]} material={m}>
            <capsuleGeometry args={[0.0105, i === 3 ? 0.025 : 0.034, 3, 6]} />
          </mesh>
        </group>
      ))}
      <group position={[0.042, -0.04, 0.01]} rotation={[deg(grip * 30), 0, deg(40 - grip * 20)]}>
        <mesh position={[0, -0.022, 0]} material={m}>
          <capsuleGeometry args={[0.012, 0.03, 3, 6]} />
        </mesh>
      </group>
    </group>
  );
};

export const Humanoid: React.FC<{spec: CharacterSpec; pose: Pose; position?: [number, number, number]; yaw?: number; face?: Face}> = ({
  spec,
  pose,
  position = [0, 0, 0],
  yaw = 0,
  face = {},
}) => {
  const k = spec.height / 1.75;
  const b = spec.build;
  const inf = spec.infected;
  const skin = mat(spec.skin);
  const top = mat(spec.top);
  const accent = mat(spec.topAccent ?? spec.top);
  const bottom = mat(spec.bottom);
  const shoes = mat(spec.shoes);
  const hair = mat(spec.hair);
  const blood = mat(PAL.blood);
  const white = mat(inf ? '#e8e6b8' : WHITE);
  const ink = mat(INK, {outline: false});
  const longSleeve = spec.topStyle !== 'shirt' && spec.topStyle !== 'scrubs';
  const limb = 0.05 * b;
  const look = face.look ?? [0, 0];
  const blink = face.blink ?? 0;
  const brows = inf ? 1 : face.brows ?? 0;
  const mouth = inf ? 0.7 : face.mouth ?? 0;

  const arm = (side: 1 | -1) => {
    const p = side > 0 ? pose.rArm : pose.lArm;
    const f = side > 0 ? pose.rFore : pose.lFore;
    return (
      <group position={[0.17 * b * side, 0.1, 0]} rotation={R(p)}>
        <Tube len={0.27} r={limb * 1.05} m={top} />
        <group position={[0, -0.29, 0]} rotation={R(f)}>
          <Tube len={0.24} r={limb} m={longSleeve ? top : skin} />
          {longSleeve && (
            <mesh position={[0, -0.25, 0]} material={accent}>
              <cylinderGeometry args={[limb * 1.15, limb * 1.15, 0.035, 12]} />
            </mesh>
          )}
          {inf && inf.blood > 0.3 && side > 0 && (
            <mesh position={[0, -0.14, 0]} material={blood}>
              <cylinderGeometry args={[limb * 1.08, limb * 1.08, 0.06, 10]} />
            </mesh>
          )}
          <group position={[0, -0.26, 0]} scale={[side, 1, 1]}>
            <ToonHand skin={spec.skin} grip={0.45} scale={1.05} />
          </group>
        </group>
      </group>
    );
  };
  const leg = (side: 1 | -1) => {
    const p = side > 0 ? pose.rLeg : pose.lLeg;
    const s = side > 0 ? pose.rShin : pose.lShin;
    return (
      <group position={[0.085 * b * side, 0, 0]} rotation={R(p)}>
        <Tube len={0.42} r={limb * 1.35} m={bottom} />
        <group position={[0, -0.44, 0]} rotation={R(s)}>
          <Tube len={0.38} r={limb * 1.2} m={bottom} />
          <mesh position={[0, -0.46, 0.045]} scale={[1, 0.62, 1.55]} material={shoes} castShadow>
            <sphereGeometry args={[0.068, 12, 8]} />
          </mesh>
        </group>
      </group>
    );
  };
  const hipsY = 0.93 + (pose.hipsY ?? 0);
  const HEAD = 0.19;
  return (
    <group position={position} rotation={[0, deg(yaw), 0]} scale={[k, k, k]} userData={{outlineWidth: 0.009, actor: spec.id}}>
      <group position={[0, hipsY, 0]} rotation={R(pose.hips)}>
        <mesh scale={[1.25 * b, 0.8, 0.95 * b]} material={bottom} castShadow>
          <sphereGeometry args={[0.13, 14, 10]} />
        </mesh>
        {leg(1)}
        {leg(-1)}
        <group position={[0, 0.06, 0]} rotation={R(pose.spine)}>
          {/* tronco: forma de feijão (cápsula), silhueta cartoon */}
          <mesh position={[0, 0.17, 0]} scale={[1.1 * b, 1, 0.85 * b]} material={top} castShadow>
            <capsuleGeometry args={[0.13, 0.2, 6, 14]} />
          </mesh>
          <group position={[0, 0.25, 0]} rotation={R(pose.chest)}>
            {spec.topStyle === 'jacket' && (
              <mesh position={[0, -0.02, 0.112 * b]} scale={[0.75, 1, 0.35]} material={accent}>
                <capsuleGeometry args={[0.045, 0.2, 4, 8]} />
              </mesh>
            )}
            {spec.topStyle === 'hoodie' && (
              <mesh position={[0, 0.13, -0.08]} rotation={[deg(-20), 0, 0]} material={top}>
                <torusGeometry args={[0.1, 0.04, 6, 12]} />
              </mesh>
            )}
            {spec.topStyle === 'scrubs' && (
              <>
                <mesh position={[0, 0.1, 0.105 * b]} rotation={[deg(-12), 0, deg(180)]} material={accent}>
                  <coneGeometry args={[0.055, 0.09, 3]} />
                </mesh>
                <mesh position={[0.08, -0.02, 0.115 * b]} material={mat('#f4f1ea')}>
                  <boxGeometry args={[0.04, 0.05, 0.01]} />
                </mesh>
              </>
            )}
            {spec.topStyle === 'coat' && (
              <mesh position={[0, -0.32, 0]} material={top} castShadow>
                <cylinderGeometry args={[0.15 * b, 0.19 * b, 0.36, 14, 1]} />
              </mesh>
            )}
            {inf && inf.blood > 0 &&
              /* respingos irregulares (não um círculo) */
              [
                [0.05, -0.02, 1.0, 0.035],
                [-0.03, -0.07, 0.7, 0.025],
                [0.09, -0.1, 0.5, 0.02],
                [0.0, 0.03, 0.45, 0.018],
              ]
                .slice(0, 1 + Math.round(inf.blood * 3))
                .map(([x, y, sc, rr], i) => (
                  <mesh key={i} position={[x, y, 0.118 * b]} rotation={[0, 0, i * 1.3]} scale={[1.5 * sc + 0.4, 0.8 * sc + 0.3, 0.25]} material={mat(PAL.blood, {outline: false})}>
                    <sphereGeometry args={[rr * 1.4, 8, 6]} />
                  </mesh>
                ))}
            {arm(1)}
            {arm(-1)}
            <group position={[0, 0.2, 0]} rotation={R(pose.neck)}>
              <mesh position={[0, 0.03, 0]} material={skin}>
                <cylinderGeometry args={[0.045, 0.05, 0.06, 10]} />
              </mesh>
              <group position={[0, 0.035 + HEAD, 0.0]} rotation={R(pose.head)}>
                {/* cabeça grande */}
                <mesh scale={[1, 1.06, 0.98]} material={skin} castShadow>
                  <sphereGeometry args={[HEAD, 20, 16]} />
                </mesh>
                {/* orelhas */}
                {[-1, 1].map((s) => (
                  <mesh key={s} position={[HEAD * 0.98 * s, -0.01, 0]} scale={[0.5, 1, 0.8]} material={skin}>
                    <sphereGeometry args={[0.035, 8, 6]} />
                  </mesh>
                ))}
                {/* olhos grandes: esclera + pupila + pálpebra */}
                {[-1, 1].map((s) => (
                  <group key={`e${s}`} position={[0.058 * s, 0.022, HEAD * 0.86]} rotation={[0, deg(18 * s), 0]}>
                    <mesh scale={[1, 1.18, 0.55]} material={white}>
                      <sphereGeometry args={[0.042, 14, 10]} />
                    </mesh>
                    <mesh position={[look[0] * 0.012, look[1] * 0.012, 0.022]} scale={[1, 1.15, 0.4]} material={inf?.eyes ? mat(inf.eyes, {emissive: inf.eyes, ei: 0.7, outline: false}) : ink}>
                      <sphereGeometry args={[inf ? 0.012 : 0.02, 10, 8]} />
                    </mesh>
                    {!inf && (
                      <mesh position={[look[0] * 0.012 + 0.006, look[1] * 0.012 + 0.009, 0.028]} material={mat('#ffffff', {outline: false, emissive: '#ffffff', ei: 0.4})}>
                        <sphereGeometry args={[0.005, 6, 4]} />
                      </mesh>
                    )}
                    {blink > 0.05 && (
                      <mesh position={[0, 0.05 - blink * 0.05, 0.004]} scale={[1.05, blink * 1.2 + 0.05, 0.6]} material={skin}>
                        <sphereGeometry args={[0.043, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                      </mesh>
                    )}
                    {/* sobrancelha */}
                    <mesh position={[0, 0.068 - Math.abs(brows) * 0.006, 0.012]} rotation={[0, 0, deg(90 + brows * 22 * s)]} material={hair}>
                      <capsuleGeometry args={[0.007, 0.045, 2, 6]} />
                    </mesh>
                  </group>
                ))}
                {/* nariz */}
                <mesh position={[0, -0.03, HEAD * 0.98]} scale={[1, 0.9, 0.8]} material={skin}>
                  <sphereGeometry args={[0.022, 10, 8]} />
                </mesh>
                {/* bochechas rosadas (não-infectados) */}
                {!inf &&
                  [-1, 1].map((s) => (
                    <mesh key={`c${s}`} position={[0.085 * s, -0.045, HEAD * 0.8]} rotation={[0, deg(30 * s), 0]} scale={[1, 0.6, 0.2]} material={mat('#f2a7a0', {outline: false})}>
                      <sphereGeometry args={[0.025, 8, 6]} />
                    </mesh>
                  ))}
                {/* boca */}
                <mesh position={[0, -0.075, HEAD * 0.9]} scale={[1, 0.2 + mouth * 0.9, 0.4]} material={mat(inf ? '#4a0d10' : '#5a2a24', {outline: false})}>
                  <sphereGeometry args={[0.024, 10, 6]} />
                </mesh>
                {spec.beard && (
                  <mesh position={[0, -0.09, 0.06]} scale={[1, 0.75, 0.9]} material={mat(spec.beard, {outline: false})}>
                    <sphereGeometry args={[0.12, 12, 8, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.35]} />
                  </mesh>
                )}
                {spec.glasses &&
                  [-1, 1].map((s) => (
                    <mesh key={`g${s}`} position={[0.058 * s, 0.022, HEAD * 0.97]} material={mat(INK)}>
                      <torusGeometry args={[0.05, 0.007, 6, 16]} />
                    </mesh>
                  ))}
                {/* cabelo (bolhas arredondadas) */}
                {spec.hairStyle !== 'bald' && !spec.cap && (
                  <mesh position={[0, 0.045, -0.015]} scale={[1.04, spec.hairStyle === 'buzz' ? 0.88 : 0.95, 1.04]} material={hair}>
                    <sphereGeometry args={[HEAD * 1.02, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
                  </mesh>
                )}
                {spec.cap && (
                  /* cabelo aparecendo sob o boné (nuca e laterais) */
                  <mesh position={[0, 0.0, -0.03]} scale={[1.03, 0.95, 1.0]} material={hair}>
                    <sphereGeometry args={[HEAD * 1.0, 16, 10, Math.PI * 0.62, Math.PI * 0.76, Math.PI * 0.3, Math.PI * 0.3]} />
                  </mesh>
                )}
                {spec.hairStyle === 'long' && (
                  <mesh position={[0, -0.06, -0.07]} scale={[1.1, 1.3, 0.7]} material={hair}>
                    <sphereGeometry args={[HEAD * 0.95, 14, 10]} />
                  </mesh>
                )}
                {spec.hairStyle === 'bun' && (
                  <mesh position={[0, 0.17, -0.06]} material={hair}>
                    <sphereGeometry args={[0.06, 12, 8]} />
                  </mesh>
                )}
                {(spec.hairStyle === 'messy' || spec.hairStyle === 'curly') &&
                  [0, 1, 2, 3, 4].map((i) => (
                    <mesh key={`h${i}`} position={[Math.cos(i * 1.4) * 0.11, 0.12 + (i % 2) * 0.03, Math.sin(i * 1.4) * 0.08 - 0.03]} material={hair}>
                      <sphereGeometry args={[0.055, 10, 8]} />
                    </mesh>
                  ))}
                {/* BONÉ VERMELHO — identidade obrigatória do protagonista */}
                {spec.cap && (
                  <group position={[0, 0.045, 0]} rotation={[deg(-8), 0, 0]}>
                    <mesh scale={[1.05, 0.8, 1.06]} material={mat(spec.cap)} castShadow>
                      <sphereGeometry args={[HEAD * 1.0, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    </mesh>
                    <mesh position={[0, -0.004, HEAD * 1.0]} rotation={[deg(-4), 0, 0]} scale={[1, 0.14, 1]} material={mat(spec.cap)}>
                      <cylinderGeometry args={[0.1, 0.1, 0.06, 20, 1, false, -Math.PI / 2, Math.PI]} />
                    </mesh>
                    <mesh position={[0, HEAD * 0.8, 0]} material={mat(spec.cap)}>
                      <sphereGeometry args={[0.014, 8, 6]} />
                    </mesh>
                  </group>
                )}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
