import "dotenv/config";
import { createPost } from "./x.js";
import { generatePost } from "./content/generator.js";

async function main() {
  const apiKey = requireEnv("X_API_KEY");
  const apiSecret = requireEnv("X_API_SECRET");
  const accessToken = requireEnv("X_ACCESS_TOKEN");
  const accessTokenSecret = requireEnv("X_ACCESS_TOKEN_SECRET");
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

  // 投稿
  console.log("Posting to X...");
  const result = await createPost(apiKey, apiSecret, accessToken, accessTokenSecret, text);
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
