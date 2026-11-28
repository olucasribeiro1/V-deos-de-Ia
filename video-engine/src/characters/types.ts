export type Tone = {base: string; shade: string; light: string};

export type Expression = {
  /** 0 open .. 1 closed */
  blink?: number;
  /** -1 frown .. 1 smile */
  smile?: number;
  /** 0..1 raises the right mouth corner only (smirk / half smile) */
  halfSmile?: number;
  /** 0..1 */
  mouthOpen?: number;
  /** -1 low .. 1 raised */
  browRaise?: number;
  /** -1 angry (inner ends down) .. 1 worried (inner ends up) */
  browTilt?: number;
  /** raises only the right brow (skeptical) */
  browAsym?: number;
  /** 0 = dot eyes, 1 = wide white eyes with pupils (shock) */
  eyesWide?: number;
  lookX?: number;
  lookY?: number;
};

/** Joint angles in degrees. 0 = limb pointing straight down; positive rotates toward screen-right. */
export type Pose = {
  lean?: number;
  headTilt?: number;
  /** -1..1 turns the face features left/right (fake 3/4 view) */
  facing?: number;
  shL?: number;
  elL?: number;
  shR?: number;
  elR?: number;
  hipL?: number;
  knL?: number;
  hipR?: number;
  knR?: number;
  /** extra vertical body offset (units) e.g. breathing / bounce */
  bob?: number;
};

export type HeadStyle = {
  hair: 'quiff' | 'buzz' | 'bald' | 'curlyBun' | 'messy' | 'spiky';
  hairColor: string;
  beard?: boolean;
  sunglasses?: boolean;
  /** small earrings colour (e.g. gold) — optional, off by default */
  earrings?: string;
  /** eyelash flicks at the outer eye corners */
  lashes?: boolean;
  /** lip colour (replaces the default dark mouth line) */
  lipstick?: string;
  /** eyebrow stroke width (default 15) */
  browWidth?: number;
};

export type Outfit = {
  skin: Tone;
  torso: 'hoodie' | 'suit' | 'dress';
  top: Tone;
  legs: Tone;
  shoes: 'sneaker' | 'dress' | 'heels' | 'barefoot';
  shoeColor: Tone;
  gloves: boolean;
  head: HeadStyle;
  /** suit neckwear: default long tie; 'bow' = tuxedo bow tie with satin lapels */
  neckwear?: 'tie' | 'bow';
  /** limb thickness overrides (defaults: arms 64/66, legs 70) */
  armW?: number;
  legW?: number;
};

export type Lighting = {
  /** side the warm key/rim light comes from: -1 left, 1 right */
  side: -1 | 1;
  rim: string;
  /** 0..1 */
  rimStrength: number;
  /** multiplies the shade side darkness 0..1 */
  shadeStrength: number;
};

export const SUNSET_LIGHT: Lighting = {side: -1, rim: '#ffd08a', rimStrength: 0.9, shadeStrength: 0.55};
export const NIGHT_LIGHT: Lighting = {side: 1, rim: '#7fd8ff', rimStrength: 0.7, shadeStrength: 0.7};
