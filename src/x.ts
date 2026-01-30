import { buildOAuthHeader } from "./oauth.js";

const TWEET_URL = "https://api.x.com/2/tweets";

/**
 * X API v2 でツイートを投稿する（OAuth 1.0a）。
 */
export async function createPost(
  apiKey: string,
  apiSecret: string,
  accessToken: string,
  accessTokenSecret: string,
  text: string,
): Promise<{ id: string; text: string }> {
  const authHeader = buildOAuthHeader("POST", TWEET_URL, {
    apiKey,
    apiSecret,
    accessToken,
    accessTokenSecret,
  });

  const res = await fetch(TWEET_URL, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Post failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { data: { id: string; text: string } };
  return json.data;
}
