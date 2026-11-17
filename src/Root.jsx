import { Composition } from 'remotion';
import { Cena } from './Cena.jsx';
import { Ep01, duracaoEp01 } from './ep01/Ep01.jsx';
import m from '../metrics.json';

export const Root = () => (
  <>
    <Composition id="Cena" component={Cena} width={m.width} height={m.height} fps={m.fps}
      durationInFrames={Math.round(m.durationInSeconds * m.fps)} defaultProps={{ titulo: 'Meu vídeo de IA' }} />
    <Composition id="Ep01" component={Ep01} width={m.width} height={m.height} fps={m.fps}
      durationInFrames={Math.ceil(duracaoEp01 * m.fps)} />
  </>
);
