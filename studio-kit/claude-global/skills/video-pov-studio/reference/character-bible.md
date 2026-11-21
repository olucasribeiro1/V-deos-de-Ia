# CHARACTER BIBLE

## Protagonista recorrente — série de apocalipse zumbi "hora a hora"
**Travado. Não altere sem autorização explícita do usuário.**
- Homem adulto (27 anos no ep01), ex-fuzileiro naval, desempregado; aparência simples e discreta.
- **Pele branca e clara** (`PAL.skinFair` = #efbd9d).
- **BONÉ VERMELHO** (`PAL.capRed` = #d42a22) — identidade da série; nunca some, muda de cor ou é substituído.
- Cabelo curto castanho-escuro (#4a3222) aparecendo sob o boné; sem barba.
- Jaqueta oliva (#5c6b47) com camiseta cinza (#4a5058) por dentro, calça jeans azul (#3c5a86), botas marrons (#5a3e2a).
- Estilo cartoon toon: cabeça grande, olhos grandes expressivos.
- **Mãos/braços POV** (aparecem em quase todo episódio): pele clara, manga oliva, punho cinza (#3a4033), relógio preto no pulso ESQUERDO.
- Código: `PROTAGONIST` e `PROTAGONIST_HANDS` (src/library/characters.ts, src/components/hands/PovHands.tsx). `validateProtagonist()` roda em TODO render e falha se o boné/pele/jaqueta mudarem; `npm run validate` também confere.
- Referência visual aprovada: `docs/character-sheet.png` (gerar com `npx remotion still src/remotion/index.ts dev-closeup`).

## Personagens fixos da série
- **Rafael** (irmão mais velho, médico): jaleco/pijama cirúrgico verde-água, óculos redondos, cabelo escuro curto.
- **Infectados** (7 tipos, silhuetas e velocidades distintas): lento, cambaleante, agressivo, corredor, reage a som, ataca portas, perseguidor. Pele cinza-esverdeada, olhos amarelados/brilhantes, boca aberta, respingos de sangue irregulares, postura curvada. Variação individual de movimento via `variation` (nunca dois iguais).

## Regras gerais
- Antes de criar personagem novo: defina spec (cores, cabelo, roupa, altura, porte) e gere still de referência; reutilize o spec em todas as cenas.
- Nova série/outro protagonista → NÃO use este personagem automaticamente. Pergunte ou siga o que o usuário fornecer.
- Evite reutilização visual excessiva: varie roupas, cabelos, porte e animação entre figurantes/infectados.
