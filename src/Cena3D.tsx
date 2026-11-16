import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const Cena3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const rot = interpolate(frame, [0, durationInFrames], [0, Math.PI * 2]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0c10" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 50, position: [0, 0, 5] }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 3, 5]} intensity={2} />
        <mesh rotation={[rot, rot * 1.5, 0]}>
          <torusKnotGeometry args={[1, 0.35, 200, 32]} />
          <meshStandardMaterial color="#06d6a0" metalness={0.3} roughness={0.4} />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
