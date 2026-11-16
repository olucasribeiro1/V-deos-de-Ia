import { Composition } from "remotion";
import { MeuVideo } from "./MeuVideo";
import { Cena3D } from "./Cena3D";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Vídeo 2D com Three.js, legendas e áudio */}
      <Composition
        id="MeuVideo"
        component={MeuVideo}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ titulo: "Vídeos de IA" }}
      />
      {/* Exemplo isolado de cena Three.js */}
      <Composition
        id="Cena3D"
        component={Cena3D}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
