"""tools/numeros.py — acha números falados (pt-BR) nas palavras da narração para mostrar na tela.

  from numeros import achar_numeros
  achar_numeros(words) -> [{"t": 34.1, "str": "7", "sub": "HORAS"}, {"t": 36.0, "str": "10%"}, ...]
Regras: aceita dígitos e números por extenso ("vinte e dois"), "por cento" vira %, "sete-dez" vira 7-10,
a palavra seguinte vira legenda pequena (unidade). "um/uma" só contam antes de "por cento".
"""
import re

U = {"zero": 0, "um": 1, "uma": 1, "dois": 2, "duas": 2, "três": 3, "tres": 3, "quatro": 4, "cinco": 5, "seis": 6, "sete": 7, "oito": 8, "nove": 9,
     "dez": 10, "onze": 11, "doze": 12, "treze": 13, "catorze": 14, "quatorze": 14, "quinze": 15, "dezesseis": 16, "dezessete": 17, "dezoito": 18, "dezenove": 19,
     "vinte": 20, "trinta": 30, "quarenta": 40, "cinquenta": 50, "sessenta": 60, "setenta": 70, "oitenta": 80, "noventa": 90, "cem": 100, "cento": 100,
     "duzentos": 200, "trezentos": 300, "quatrocentos": 400, "quinhentos": 500, "mil": 1000}
UNIDADES = {"hora", "horas", "dia", "dias", "semana", "semanas", "ano", "anos", "litro", "litros", "pessoa", "pessoas", "minuto", "minutos", "segundo", "segundos",
            "mês", "meses", "metro", "metros", "quilômetro", "quilômetros", "km", "vezes", "respirações", "latas", "galões", "graus", "mil", "milhões", "bilhões"}
PARAR = {"anos", "para", "pela", "pelo", "depois", "antes", "vezes", "mais", "menos", "desde", "quando", "porque", "então", "aqui", "agora"}
PREFIXO = {"hora", "dia", "episódio", "regra", "nível"}
n = lambda w: re.sub(r"[^\w\-]+", "", w.lower())


def _num(tok):
    if re.fullmatch(r"\d+([.,]\d+)?", tok): return float(tok.replace(",", "."))
    return U.get(tok)


def achar_numeros(words, dur=1.6):
    out, i = [], 0
    while i < len(words):
        w = n(words[i]["word"])
        if "-" in w and all(_num(p) is not None for p in w.split("-") if p):          # sete-dez -> 7-10
            parts = [int(_num(p)) for p in w.split("-") if p]
            out.append({"t": words[i]["start"], "str": "-".join(map(str, parts))}); i += 1; continue
        v = _num(w)
        if v is None: i += 1; continue
        j, total = i + 1, v
        # horário falado: "duas e catorze da manhã" -> 2:14
        if j + 3 < len(words) + 1 and j + 1 < len(words) and n(words[j]["word"]) == "e" and _num(n(words[j + 1]["word"])) is not None:
            k2 = j + 2; mins = _num(n(words[j + 1]["word"]))
            if k2 + 1 < len(words) and n(words[k2 + 1]["word"]) == "e" and k2 + 2 < len(words) and _num(n(words[k2 + 2]["word"])) is not None and mins % 10 == 0: mins += _num(n(words[k2 + 2]["word"])); k2 += 2
            if k2 + 1 < len(words) and n(words[k2]["word"]) in ("da", "de") and n(words[k2 + 1]["word"]) in ("manhã", "manha", "tarde", "noite", "madrugada"):
                out.append({"t": words[i]["start"], "str": f"{int(v)}:{int(mins):02d}"}); i = k2 + 2; continue
        # composto: só junta "e" quando o primeiro é dezena/centena redonda ("vinte e dois", "cento e dez")
        while j + 1 < len(words) and n(words[j]["word"]) == "e" and _num(n(words[j + 1]["word"])) is not None and total >= 20 and total % 10 == 0 and _num(n(words[j + 1]["word"])) < (10 if total < 100 else 100):
            total += _num(n(words[j + 1]["word"])); j += 2
        if j < len(words) and n(words[j]["word"]) == "mil" and total < 1000: total *= 1000; j += 1
        nxt = n(words[j]["word"]) if j < len(words) else ""; nxt2 = n(words[j + 1]["word"]) if j + 1 < len(words) else ""
        prev = n(words[i - 1]["word"]) if i > 0 else ""
        is_um = w in ("um", "uma") and j == i + 1
        pct = nxt == "por" and nxt2 == "cento"
        if is_um and not pct: i += 1; continue
        s = (f"{total:g}").replace(".", ",")
        item = {"t": words[i]["start"]}
        if pct: item["str"] = s + "%"; j += 2
        elif prev in PREFIXO: item["str"] = f"{prev.upper()} {s}"
        else:
            item["str"] = s
            if nxt in UNIDADES or (len(nxt) > 3 and nxt.isalpha() and nxt not in PARAR): item["sub"] = re.sub(r"[^\wÀ-ú ]", "", words[j]["word"]).upper(); j += 1
        out.append(item); i = j
    for k, it in enumerate(out):                                                         # não sobrepõe: corta antes do próximo
        nx = out[k + 1]["t"] if k + 1 < len(out) else 1e9; it["dur"] = round(max(0.6, min(dur, nx - it["t"] - 0.05)), 2)
    return out


if __name__ == "__main__":
    import json, sys
    ws = json.load(open(sys.argv[1]))["words"]
    for x in achar_numeros(ws): print(f"{x['t']:7.2f}  {x['str']:>8s}  {x.get('sub', '')}  ({x['dur']}s)")
