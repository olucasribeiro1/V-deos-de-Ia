import { ThreeCanvas } from "@remotion/three";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Cena "2D" em Three.js: câmera ortográfica + formas planas animadas pelo frame
export const FormasThree: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const entrada = spring({ frame, fps, config: { damping: 12 } });
  const rot = interpolate(frame, [0, 240], [0, Math.PI * 2]);

  return (
    <ThreeCanvas
      orthographic
      width={width}
      height={height}
      camera={{ zoom: 1, position: [0, 0, 100] }}
      style={{ position: "absolute" }}
    >
      <mesh position={[0, 250, 0]} scale={entrada} rotation={[0, 0, rot]}>
        <circleGeometry args={[180, 6]} />
        <meshBasicMaterial color="#ff4d6d" />
      </mesh>
      {[...Array(5)].map((_, i) => {
        const s = spring({ frame: frame - 10 - i * 5, fps });
        const x = (i - 2) * 180;
        const y = -150 + Math.sin(frame / 10 + i) * 40;
        return (
          <mesh key={i} position={[x, y, 0]} scale={s}>
            <circleGeometry args={[60, 48]} />
            <meshBasicMaterial color={["#ffd166", "#06d6a0", "#118ab2", "#ef476f", "#8338ec"][i]} />
          </mesh>
        );
      })}
    </ThreeCanvas>
  );
};
