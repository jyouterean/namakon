interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/**
 * refresh_token を使って新しい access_token を取得する。
 * X API v2 OAuth 2.0 (Authorization Code + PKCE) のトークンリフレッシュ。
 */
export async function refreshAccessToken(
  clientId: string,
  refreshToken: string,
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const res = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  return (await res.json()) as TokenResponse;
}
