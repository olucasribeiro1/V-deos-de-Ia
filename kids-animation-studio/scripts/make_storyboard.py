"""Gera o storyboard (letra x tempo x cena x acoes x camera) a partir da letra alinhada por palavra."""
import sys, os, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(os.path.dirname(ROOT), "christian-kids-studio", "scripts"))
sys.argv = ["x", os.path.join(ROOT, "music")]
import compose_video as A
# interpretacao semantica: palavra-chave -> (cenario, acao, camera)
RULES = [
    ("criançada", "Campo florido de dia", "Lulu e Théo acenam para a câmera; ovelhinha pula", "Plano aberto aproximando"),
    ("levanta", "Campo florido", "Levantam o dedinho e pulam no ritmo", "Plano médio"),
    ("escuro", "Campo à noite total, sem estrelas", "Crianças olham em volta, curiosas (sobrancelhas altas)", "Câmera circula devagar"),
    ("haja luz", "Bola de luz surge no céu; dia volta", "Surpresa (boca em O) e comemoração (braços para cima)", "Contra-plongée para o céu"),
    ("noite separou", "Dia com sol → noite com lua e estrelas", "Mostram 1 dedinho; selo 'Dia 1'", "Plano aberto"),
    ("céu azul", "Céu com nuvens surgindo", "Apontam para cima; selo 'Dia 2'", "Câmera sobe para o céu"),
    ("cada coisa que fazia", "Campo florido com brilhos", "Olham tudo com carinho, batem palmas devagar", "Plano médio"),
    ("isso é bom", "Campo florido com brilhos", "Batem palmas; texto 'Isso é bom!'", "Plano médio"),
    ("quem fez o sol", "Campo + sol", "Apontam para o sol", "Close no sol → crianças"),
    ("quem fez o mar", "Mar ao lado do campo, baleia pula", "Braços abertos", "Plano aberto"),
    ("passarinho e eu", "Flor cresce, bem-te-vi voa", "No 'e eu' apontam para si (coro 'E eu!')", "Close nas crianças"),
    ("ele falou", "Arco-íris aparece", "Comemoram", "Plano aberto subindo"),
    ("juntou as águas", "Mar; a terra sobe", "Olham maravilhadas; selo 'Dia 3'", "Plano aberto"),
    ("brotou capim", "Capim, sementes e árvore crescendo", "Apontam para a árvore", "Plano médio"),
    ("pôs o sol", "Sol nascendo", "Apontam para cima; selo 'Dia 4'", "Contra-plongée"),
    ("lua com as estrelas", "Noite com lua e estrelas", "Acenam para a lua", "Plano aberto"),
    ("cada estrela", "Estrelinhas com nomes", "Contam as estrelas nos dedos", "Câmera percorre o céu"),
    ("baleia", "Fundo do mar com baleia e peixinhos", "(crianças fora de cena); selo 'Dia 5'", "Câmera subaquática seguindo a baleia"),
    ("bem-te-vi", "Céu com bem-te-vi cantando", "Crianças olham o pássaro", "Câmera segue o pássaro"),
    ("leão", "Savana", "Cada bicho entra quando é nomeado; selo 'Dia 6'", "Corte para cada bicho"),
    ("macaquinho", "Savana", "Macaco, ovelha, tatu e arara entram", "Corte para cada bicho"),
    ("pó da terra", "Brilhos formam as crianças", "Crianças aparecem", "Plano médio"),
    ("bateu o coração", "Vento + coração pulsando", "Mão no peito", "Close"),
    ("muito bom", "Arco-íris com todos os bichos", "Comemoram; texto 'Muito bom!'", "Plano aberto"),
    ("descansou", "Noite tranquila", "Mãos juntas, olhos fechados (oração); selo 'Dia 7'", "Plano médio lento"),
    ("deito e durmo", "Cama de nuvem", "Crianças deitadas sob cobertor de estrelas", "Câmera alta"),
    ("segura a minha mão", "Noite com lua", "Dão as mãos; coração", "Close nas mãos"),
    ("nome de cada estrela", "Céu com estrelas nomeadas", "Estrela 'VOCÊ'; acenam", "Câmera sobe"),
    ("quem fez você", "Céu estrelado", "Texto final 'Deus fez você!'", "Plano aberto final"),
]
out = ["# Storyboard — Quem Fez? Foi Deus!", "", "Gerado automaticamente a partir da letra alinhada por palavra (ElevenLabs Scribe).", "",
       "| # | Tempo | Seção | Letra | Cenário | Ações dos personagens | Câmera |", "|---|---|---|---|---|---|---|"]
data = []; last = ("Campo florido", "Dançam no ritmo, cantando", "Plano médio")
for i, l in enumerate(A.lines):
    low = l["text"].lower(); rule = None
    for k, *r in RULES:
        if k in low: rule = r; break
    if rule is None and l["sec"].startswith(("Chorus", "Final")): rule = ["Campo + arco-íris (refrão)", "Dançam, coro responde 'Foi Deus!'", "Cortes a cada 2-4 s"]
    rule = rule or last; last = rule
    ts = "%d:%05.2f–%d:%05.2f" % (l["s"] // 60, l["s"] % 60, l["e"] // 60, l["e"] % 60)
    out.append("| %d | %s | %s | %s | %s | %s | %s |" % (i + 1, ts, l["sec"], l["text"], *rule))
    data.append({"i": i + 1, "start": round(l["s"], 2), "end": round(l["e"], 2), "section": l["sec"], "lyric": l["text"], "scene": rule[0], "action": rule[1], "camera": rule[2]})
open(os.path.join(ROOT, "storyboards", "01-quem-fez-foi-deus.md"), "w").write("\n".join(out) + "\n")
json.dump(data, open(os.path.join(ROOT, "storyboards", "01-quem-fez-foi-deus.json"), "w"), ensure_ascii=False, indent=1)
print(len(data), "linhas")
