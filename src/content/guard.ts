const NG_WORDS: string[] = [
  "傷病手当",
  "手当金",
  "もらいながら",
  "受給しながら",
  "不正受給",
  "制度を利用",
  "必ず稼げる",
  "絶対に稼げる",
  "100%",
  "確実に",
  "誰でも稼げる",
  "楽して稼",
  "ラクして稼",
  "簡単に稼",
  "月収100万",
  "年収1000万",
  "即日現金",
  "日払い",
  "裏ワザ",
  "グレー",
  "違法",
  "脱税",
  "万円もらいながら",
  "給付金をもらい",
  "保険を使って",
  "働かずに",
  "サボ",
  "ズル",
  "ごまかし",
  "研修13000",
  "研修18000",
  "13000円",
  "18000円",
];

const EXAGGERATION_PATTERNS: RegExp[] = [
  /必ず.{0,4}(稼|儲|得)/,
  /絶対.{0,4}(稼|儲|得|安心|安全)/,
  /100%.{0,4}(稼|儲|ラク|楽)/,
  /誰でも.{0,4}(稼|儲|成功)/,
  /確実に.{0,4}(稼|儲|得)/,
  /間違いなく/,
  /保証(します|付き)/,
];

export function checkContent(text: string): { ok: boolean; reason?: string } {
  for (const word of NG_WORDS) {
    if (text.includes(word)) {
      return { ok: false, reason: `NGワード検出: "${word}"` };
    }
  }
  for (const pat of EXAGGERATION_PATTERNS) {
    if (pat.test(text)) {
      return { ok: false, reason: `誇大表現検出: ${pat.source}` };
    }
  }
  return { ok: true };
}
