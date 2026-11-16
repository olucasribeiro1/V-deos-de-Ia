import { Composition } from 'remotion';
import { Cena } from './Cena.jsx';
import m from '../metrics.json';

export const Root = () => (
  <Composition
    id="Cena"
    component={Cena}
    width={m.width}
    height={m.height}
    fps={m.fps}
    durationInFrames={Math.round(m.durationInSeconds * m.fps)}
    defaultProps={{ titulo: 'Meu vídeo de IA' }}
  />
);
