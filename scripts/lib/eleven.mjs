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
