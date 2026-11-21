import type {VoiceDef, VoiceId} from '../systems/timeline/script.ts';

/**
 * ELENCO DE VOZES DA SÉRIE (mesma voz em todos os episódios).
 * IDs vindos da biblioteca da conta ElevenLabs (vozes brasileiras). Modelo multilíngue v2 (estável em PT-BR).
 * stability baixa = mais emoção/variação; style moderado = interpretação dramática.
 */
export const VOICES: Record<VoiceId, VoiceDef> = {
  narrador: {voiceId: 'ZqE9vIHPcrC35dZv0Svu', name: 'Adam Borges', model: 'eleven_multilingual_v2', stability: 0.38, similarity: 0.8, style: 0.35, speed: 0.97},
  rafael: {voiceId: 'HoWXGRJgqYolkEBcxmGm', name: 'Marco Antonio', model: 'eleven_multilingual_v2', stability: 0.28, similarity: 0.8, style: 0.55, speed: 1.05},
  vizinho: {voiceId: 'tS45q0QcrDHqHoaWdCDR', name: 'Lax', model: 'eleven_multilingual_v2', stability: 0.25, similarity: 0.75, style: 0.6, speed: 1.0},
};
