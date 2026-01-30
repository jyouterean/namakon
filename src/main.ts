import "dotenv/config";
import { refreshAccessToken } from "./oauth.js";
import { createPost } from "./x.js";
import { generatePost } from "./content/generator.js";

async function main() {
  const clientId = requireEnv("X_CLIENT_ID");
  const refreshToken = requireEnv("X_REFRESH_TOKEN");
  const slot = parseInt(process.env.SLOT ?? "0", 10);
  const dryRun = process.env.DRY_RUN === "true";
  const hashtagMode = process.env.HASHTAG_MODE ?? "MAX";
  const maxHashtags = parseInt(process.env.MAX_HASHTAGS ?? "5", 10);
  const seedSalt = process.env.SEED_SALT ?? "default";

  // 日本時間の日付を取得
  const now = new Date();
  const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const date = jstDate.toISOString().slice(0, 10);

  console.log(`[namakon-bot] date=${date} slot=${slot} dryRun=${dryRun}`);

  // 文面生成
  const text = generatePost({
    slot,
    date,
    seedSalt,
    hashtagMode,
    maxHashtags,
  });

  console.log("--- Generated Post ---");
  console.log(text);
  console.log(`--- Length: ${[...text].length} chars ---`);

  if (dryRun) {
    console.log("[DRY_RUN] Skipping actual post.");
    return;
  }

  // トークン取得
  console.log("Refreshing access token...");
  const tokenRes = await refreshAccessToken(clientId, refreshToken);

  // GitHub Actions で refresh_token をローテーションする場合は
  // ここで新しい refresh_token を Secrets に書き戻す処理が必要。
  // 今回は refresh_token が変わらない前提で進める。
  // 変わる場合は GitHub API で Secrets を更新するか、
  // 別の永続化手段を検討してください。
  if (tokenRes.refresh_token !== refreshToken) {
    console.warn(
      "WARNING: refresh_token has rotated. Update X_REFRESH_TOKEN secret manually or automate rotation.",
    );
    console.warn(`New refresh_token: ${tokenRes.refresh_token}`);
  }

  // 投稿
  console.log("Posting to X...");
  const result = await createPost(tokenRes.access_token, text);
  console.log(`Posted successfully! Tweet ID: ${result.id}`);
}

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
