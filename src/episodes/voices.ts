import type {VoiceDef, VoiceId} from '../systems/timeline/script.ts';

/**
 * ELENCO DE VOZES DA SÉRIE (mesma voz em todos os episódios).
 * IDs vindos da biblioteca da conta ElevenLabs (vozes brasileiras). Modelo multilíngue v2 (estável em PT-BR).
 * stability ≥ 0.4: abaixo disso o modelo tropeça/erra pronúncia em PT-BR (medido por transcrição).
 * A emoção vem da pontuação e das pausas do texto, não de stability baixa.
 */
export const VOICES: Record<VoiceId, VoiceDef> = {
  narrador: {voiceId: 'ZqE9vIHPcrC35dZv0Svu', name: 'Adam Borges', model: 'eleven_multilingual_v2', stability: 0.5, similarity: 0.82, style: 0.18, speed: 0.97},
  rafael: {voiceId: 'HoWXGRJgqYolkEBcxmGm', name: 'Marco Antonio', model: 'eleven_multilingual_v2', stability: 0.42, similarity: 0.82, style: 0.32, speed: 1.04},
  reporter: {voiceId: 'GDzHdQOi6jjf8zaXhCYD', name: 'Raquel', model: 'eleven_multilingual_v2', stability: 0.55, similarity: 0.8, style: 0.15, speed: 1.05},
  vizinho: {voiceId: 'tS45q0QcrDHqHoaWdCDR', name: 'Lax', model: 'eleven_multilingual_v2', stability: 0.4, similarity: 0.8, style: 0.35, speed: 1.0},
};
