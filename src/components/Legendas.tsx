import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption, TikTokPage, createTikTokStyleCaptions } from "@remotion/captions";

// Legendas estilo TikTok a partir de um JSON de captions (gerado manualmente ou via Whisper)
export const Legendas: React.FC<{ arquivo: string }> = ({ arquivo }) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("carregando legendas"));
  const { fps } = useVideoConfig();

  const carregar = useCallback(async () => {
    const res = await fetch(staticFile(arquivo));
    setCaptions(await res.json());
    continueRender(handle);
  }, [arquivo, handle]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const pages = useMemo(
    () =>
      captions
        ? createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: 1200 }).pages
        : [],
    [captions],
  );

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const prox = pages[i + 1]?.startMs ?? page.startMs + page.durationMs;
        const from = Math.round((page.startMs / 1000) * fps);
        const dur = Math.max(1, Math.round(((prox - page.startMs) / 1000) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Pagina page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const Pagina: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tempoMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 350 }}>
      <div
        style={{
          fontSize: 90,
          fontWeight: 900,
          fontFamily: "sans-serif",
          textAlign: "center",
          color: "white",
          WebkitTextStroke: "12px black",
          paintOrder: "stroke",
          padding: "0 60px",
        }}
      >
        {page.tokens.map((t) => {
          const ativo = t.fromMs <= tempoMs && t.toMs > tempoMs;
          return (
            <span key={t.fromMs} style={{ color: ativo ? "#ffd166" : "white", whiteSpace: "pre" }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
