// Cliente mínimo da API ElevenLabs.
// A chave NÃO fica no código: o proxy do ambiente injeta a credencial cadastrada.
// Em máquina local, defina ELEVENLABS_API_KEY (nunca commite a chave).
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const KEY = process.env.ELEVENLABS_API_KEY || 'proxy-injected';
const BASE = 'https://api.elevenlabs.io';

export async function eleven(path, body, {retries = 4} = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(BASE + path, {
      method: 'POST',
      headers: {'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg'},
      body: JSON.stringify(body),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const txt = await res.text();
    // só repete em erro transitório; erro de cota/permissão é reportado (sem gastar créditos à toa)
    if ((res.status === 429 || res.status === 409 || res.status >= 500) && attempt < retries) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    throw new Error(`ElevenLabs ${path} → ${res.status}: ${txt.slice(0, 300)}`);
  }
}

export async function credits() {
  const res = await fetch(BASE + '/v1/user/subscription', {headers: {'xi-api-key': KEY}});
  if (!res.ok) return null;
  const d = await res.json();
  return {used: d.character_count, limit: d.character_limit};
}

export function duration(file) {
  return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());
}

export function ff(args) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], {stdio: 'inherit'});
}

export function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

/** Mapeia com concorrência limitada. */
export async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({length: Math.min(n, items.length)}, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return out;
}

/** Transcreve um MP3 (ElevenLabs Scribe) para verificar pronúncia. */
export async function transcribe(file, lang = 'por') {
  const fd = new FormData();
  fd.append('model_id', 'scribe_v1');
  fd.append('language_code', lang);
  fd.append('file', new Blob([fs.readFileSync(file)]), 'a.mp3');
  const res = await fetch(BASE + '/v1/speech-to-text', {method: 'POST', headers: {'xi-api-key': KEY}, body: fd});
  if (!res.ok) throw new Error(`STT ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).text ?? '';
}

const UN = ['zero','um','dois','tres','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
const DEZ = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
const CEN = ['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
function extenso(n) {
  if (n < 20) return UN[n];
  if (n < 100) return DEZ[Math.floor(n / 10)] + (n % 10 ? ' e ' + UN[n % 10] : '');
  if (n === 100) return 'cem';
  if (n < 1000) return CEN[Math.floor(n / 100)] + (n % 100 ? ' e ' + extenso(n % 100) : '');
  return String(n);
}
// STT escreve números com dígitos e marca sons entre colchetes: normaliza ambos antes de comparar
const norm = (t) => t.replace(/\[[^\]]+\]/g, ' ').replace(/(\d{1,2}):(\d{2})/g, (_, h, m) => ` ${h} e ${+m ? m : ''} `).replace(/(\d{1,2})h\b/g, '$1').replace(/\d+/g, (d) => ' ' + extenso(+d) + ' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
/** Similaridade por palavras (1 - distância de edição / tamanho). 1 = idêntico. Lista palavras divergentes. */
export function wordScore(expected, heard) {
  const a = norm(expected), b = norm(heard);
  const d = Array.from({length: a.length + 1}, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  const extra = b.filter((w) => !a.includes(w));
  const missing = a.filter((w) => !b.includes(w));
  return {score: 1 - d[a.length][b.length] / Math.max(1, a.length), extra, missing};
}
