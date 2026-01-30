import { HOOKS, BODIES, COMPARISONS, CTAS, DISCLAIMERS } from "./pools.js";
import { checkContent } from "./guard.js";
import { appendHashtags } from "./hashtags.js";

interface GenerateOptions {
  slot: number; // 0, 1, 2
  date: string; // YYYY-MM-DD
  seedSalt: string;
  hashtagMode: string; // MAX or SAFE
  maxHashtags: number;
}

/**
 * seed 付き PRNG で日付＋スロットごとに異なる文面を組み立てる。
 * 同日3本で Hook / CTA / Comparison が被らないようにする。
 */
export function generatePost(opts: GenerateOptions): string {
  const MAX_RETRIES = 50;

  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    const baseSeed = hashCode(`${opts.date}:${opts.seedSalt}:${retry}`);

    // 各スロットのインデックスを被らせないために、スロットごとにオフセット
    const hookIdx = pickIndex(baseSeed, opts.slot, HOOKS.length, 0);
    const bodyIdx = pickIndex(baseSeed, opts.slot, BODIES.length, 1);
    const compIdx = pickIndex(baseSeed, opts.slot, COMPARISONS.length, 2);
    const ctaIdx = pickIndex(baseSeed, opts.slot, CTAS.length, 3);
    const disclaimerIdx = pickIndex(baseSeed, opts.slot, DISCLAIMERS.length, 4);

    const parts = [
      HOOKS[hookIdx],
      "",
      BODIES[bodyIdx],
      "",
      COMPARISONS[compIdx],
      "",
      CTAS[ctaIdx],
      "",
      DISCLAIMERS[disclaimerIdx],
    ];

    const bodyText = parts.join("\n");

    // ガードチェック
    const check = checkContent(bodyText);
    if (!check.ok) {
      console.warn(`Guard rejected (retry=${retry}): ${check.reason}`);
      continue;
    }

    // ハッシュタグ追加
    const tagSeed = hashCode(`${opts.date}:${opts.slot}:tags:${retry}`);
    const fullText = appendHashtags(bodyText, tagSeed, opts.hashtagMode, opts.maxHashtags);

    // 280 文字チェック
    if ([...fullText].length > 280) {
      console.warn(`Over 280 chars (retry=${retry}), retrying without some parts...`);
      // ハッシュタグなしで再チェック
      if ([...bodyText].length > 280) continue;
      // ハッシュタグを減らして再試行
      return appendHashtags(bodyText, tagSeed, "SAFE", 2);
    }

    return fullText;
  }

  throw new Error("Failed to generate compliant post after max retries");
}

/** 同日の3スロットで被らないインデックスを返す */
function pickIndex(baseSeed: number, slot: number, poolSize: number, poolId: number): number {
  const seed = hashCode(`${baseSeed}:${poolId}`);
  // 3スロット分のインデックスを生成し、slot番目を返す
  const indices: number[] = [];
  let s = seed;
  for (let i = 0; i < 3; i++) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    let idx = s % poolSize;
    // 重複回避（プールサイズが3以上の場合）
    let attempts = 0;
    while (indices.includes(idx) && attempts < 100) {
      s = (s * 1664525 + 1013904223) & 0x7fffffff;
      idx = s % poolSize;
      attempts++;
    }
    indices.push(idx);
  }
  return indices[slot];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) & 0x7fffffff;
  }
  return hash;
}
