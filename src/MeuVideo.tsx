import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { FormasThree } from "./components/FormasThree";
import { Legendas } from "./components/Legendas";

export const MeuVideo: React.FC<{ titulo: string }> = ({ titulo }) => {
  const frame = useCurrentFrame();
  const opacidade = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#1b1f3b, #3a0ca3)" }}>
      <FormasThree />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 220, opacity: opacidade }}>
        <h1 style={{ color: "white", fontSize: 110, fontFamily: "sans-serif", margin: 0 }}>{titulo}</h1>
      </AbsoluteFill>
      <Legendas arquivo="legendas.json" />
      {/* Troque public/musica.mp3 pela sua narração ou trilha */}
      <Audio src={staticFile("musica.mp3")} volume={0.6} />
    </AbsoluteFill>
  );
};
