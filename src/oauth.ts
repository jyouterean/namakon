import crypto from "node:crypto";

interface OAuthParams {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

/**
 * OAuth 1.0a の Authorization ヘッダーを生成する。
 */
export function buildOAuthHeader(
  method: string,
  url: string,
  params: OAuthParams,
  bodyParams?: Record<string, string>,
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: params.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: params.accessToken,
    oauth_version: "1.0",
  };

  // 署名ベース文字列の作成
  const allParams: Record<string, string> = { ...oauthParams, ...(bodyParams ?? {}) };
  const paramString = Object.keys(allParams)
    .sort()
    .map((k) => `${enc(k)}=${enc(allParams[k])}`)
    .join("&");

  const baseString = `${method.toUpperCase()}&${enc(url)}&${enc(paramString)}`;
  const signingKey = `${enc(params.apiSecret)}&${enc(params.accessTokenSecret)}`;

  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  oauthParams["oauth_signature"] = signature;

  const header = Object.keys(oauthParams)
    .sort()
    .map((k) => `${enc(k)}="${enc(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${header}`;
}

function enc(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}
