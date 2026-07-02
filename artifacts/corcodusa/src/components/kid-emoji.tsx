/**
 * KidEmoji — renders any emoji as a colorful Twemoji SVG image
 * (open-source Twitter emoji set, MIT/CC-BY, via @twemoji/api).
 *
 * Native emoji fonts vary a lot per device — flat and gray on Windows,
 * different art on Android — while Twemoji is bright, round and identical
 * everywhere, which is exactly the "funny for kids" look the games need.
 * If the CDN image can't load (offline), the <img alt> falls back to the
 * native emoji character, so nothing breaks.
 */
import { useMemo } from "react";
import twemoji from "@twemoji/api";

export function KidEmoji({ emoji, size = 40, className = "" }: {
  emoji: string;
  size?: number | string;
  className?: string;
}) {
  const html = useMemo(
    () => twemoji.parse(emoji, { folder: "svg", ext: ".svg" }),
    [emoji],
  );
  return (
    <span
      className={`inline-block align-middle leading-none select-none [&>img]:w-full [&>img]:h-full [&>img]:m-0 ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
