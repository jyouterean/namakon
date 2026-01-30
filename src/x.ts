import { buildOAuthHeader } from "./oauth.js";

const TWEET_URL = "https://api.x.com/1.1/statuses/update.json";

/**
 * X API v1.1 でツイートを投稿する（OAuth 1.0a）。
 */
export async function createPost(
  apiKey: string,
  apiSecret: string,
  accessToken: string,
  accessTokenSecret: string,
  text: string,
): Promise<{ id: string; text: string }> {
  const bodyParams = { status: text };

  const authHeader = buildOAuthHeader("POST", TWEET_URL, {
    apiKey,
    apiSecret,
    accessToken,
    accessTokenSecret,
  }, bodyParams);

  const res = await fetch(TWEET_URL, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(bodyParams).toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Post failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { id_str: string; text: string };
  return { id: json.id_str, text: json.text };
}
