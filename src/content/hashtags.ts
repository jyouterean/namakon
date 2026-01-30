import { HASHTAGS } from "./pools.js";

/**
 * PRNG でシャッフルしたハッシュタグを、残り文字数に収まる限り最大で追加する。
 * mode=SAFE の場合は最大3個に制限。
 */
export function appendHashtags(
  body: string,
  seed: number,
  mode: string,
  maxHashtags: number,
): string {
  const limit = 280;
  const shuffled = shuffleWithSeed([...HASHTAGS], seed);
  const hardMax = mode === "SAFE" ? Math.min(3, maxHashtags) : maxHashtags;

  let result = body;
  let count = 0;

  for (const tag of shuffled) {
    if (count >= hardMax) break;
    const candidate = result + "\n" + tag;
    if ([...candidate].length > limit) continue;
    result = candidate;
    count++;
  }

  return result;
}

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
