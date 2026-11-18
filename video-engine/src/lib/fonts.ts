import {continueRender, delayRender, staticFile} from 'remotion';

export const CAPTION_FONT = 'Oswald';
export const HUD_FONT = 'Roboto Condensed';

const faces: {family: string; file: string; weight: string; range?: string}[] = [
  {family: CAPTION_FONT, file: 'oswald-latin-700-normal.woff2', weight: '700'},
  {family: CAPTION_FONT, file: 'oswald-latin-500-normal.woff2', weight: '500'},
  {family: HUD_FONT, file: 'roboto-condensed-latin-400-normal.woff2', weight: '400'},
  {family: HUD_FONT, file: 'roboto-condensed-latin-700-normal.woff2', weight: '700'},
  {family: HUD_FONT, file: 'roboto-condensed-greek-400-normal.woff2', weight: '400', range: 'U+0370-03FF'},
  {family: HUD_FONT, file: 'roboto-condensed-greek-700-normal.woff2', weight: '700', range: 'U+0370-03FF'},
];

let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Loading fonts');
  Promise.all(
    faces.map((f) => {
      const face = new FontFace(f.family, `url(${staticFile(`fonts/${f.file}`)}) format('woff2')`, {
        weight: f.weight,
        unicodeRange: f.range,
      });
      return face.load().then((ff) => {
        (document.fonts as unknown as {add: (f: FontFace) => void}).add(ff);
      });
    }),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};
