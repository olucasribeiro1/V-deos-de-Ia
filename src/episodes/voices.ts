import type {VoiceDef, VoiceId} from '../systems/timeline/script.ts';

/**
 * ELENCO DE VOZES DA SÉRIE (mesma voz em todos os episódios).
 * Direção do usuário: SEM narrador de audiolivro — o PROTAGONISTA fala por si (1ª pessoa, presente,
 * coloquial, reagindo no momento) e conversa com os outros personagens.
 * Modelo eleven_v3 (fala mais natural; aceita marcações em INGLÊS como [sighs], [whispers], [nervous laugh]).
 * stability no v3: 0 (criativo) | 0.5 (natural) | 1 (robusto). Use 0.5.
 */
export const VOICES: Record<VoiceId, VoiceDef> = {
  protagonista: {voiceId: 'yY7KGpDzir8WP7P97McA', name: 'Lucas (aprovada pelo usuário)', model: 'eleven_v3', stability: 0.5, similarity: 0.8},
  rafael: {voiceId: 'EyPnkQPpWceKpqcMOSpZ', name: 'Leandro (aprovada pelo usuário)', model: 'eleven_v3', stability: 0.5, similarity: 0.8},
  vizinho: {voiceId: 'b1vFwqGOgQwuyhGeKQ9e', name: 'Wellerson', model: 'eleven_v3', stability: 0.5, similarity: 0.8},
  reporter: {voiceId: 'GDzHdQOi6jjf8zaXhCYD', name: 'Raquel', model: 'eleven_multilingual_v2', stability: 0.55, similarity: 0.8, style: 0.15, speed: 1.05},
};
