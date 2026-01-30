/**
 * 初回セットアップ用スクリプト。
 * OAuth 2.0 Authorization Code + PKCE フローで refresh_token を取得する。
 *
 * 使い方:
 *   1. X Developer Portal でアプリを作成し、OAuth 2.0 を有効化
 *   2. Redirect URI に http://localhost:8787/callback を登録
 *   3. .env に X_CLIENT_ID と X_REDIRECT_URI を設定
 *   4. npx tsx scripts/auth_pkce.ts を実行
 *   5. 表示されるURLをブラウザで開いて認可
 *   6. リダイレクトされたURLの code パラメータをコピーしてターミナルに貼り付け
 *   7. 出力される refresh_token を .env の X_REFRESH_TOKEN に設定
 */

import "dotenv/config";
import * as crypto from "node:crypto";
import * as readline from "node:readline";

const clientId = process.env.X_CLIENT_ID;
const redirectUri = process.env.X_REDIRECT_URI ?? "http://localhost:8787/callback";

if (!clientId) {
  console.error("X_CLIENT_ID is required in .env");
  process.exit(1);
}

// PKCE: code_verifier と code_challenge を生成
const codeVerifier = crypto.randomBytes(32).toString("base64url");
const codeChallenge = crypto
  .createHash("sha256")
  .update(codeVerifier)
  .digest("base64url");

const state = crypto.randomBytes(16).toString("hex");

// スコープ: tweet.write のみ（読み取り・DMは不要）
const scopes = ["tweet.write", "tweet.read", "users.read", "offline.access"];

const authUrl = new URL("https://x.com/i/oauth2/authorize");
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("redirect_uri", redirectUri);
authUrl.searchParams.set("scope", scopes.join(" "));
authUrl.searchParams.set("state", state);
authUrl.searchParams.set("code_challenge", codeChallenge);
authUrl.searchParams.set("code_challenge_method", "S256");

console.log("=== X OAuth 2.0 PKCE Setup ===\n");
console.log("1. 以下のURLをブラウザで開いて認可してください:\n");
console.log(authUrl.toString());
console.log("\n2. 認可後、リダイレクトURLの code パラメータの値を貼り付けてください。");
console.log("   (例: http://localhost:8787/callback?state=...&code=XXXXXX の XXXXXX 部分)\n");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("code: ", async (code) => {
  rl.close();

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code: code.trim(),
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  });

  const res = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Token exchange failed (${res.status}): ${text}`);
    process.exit(1);
  }

  const json = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  };

  console.log("\n=== 成功！ ===\n");
  console.log(`refresh_token: ${json.refresh_token}`);
  console.log(`\nこの値を .env の X_REFRESH_TOKEN に設定してください。`);
  console.log(`GitHub Actions の場合は Repository Secrets に X_REFRESH_TOKEN として登録してください。`);
});
