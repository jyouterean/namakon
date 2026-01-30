/**
 * X API v2 でツイートを投稿する。
 */
export async function createPost(
  accessToken: string,
  text: string,
): Promise<{ id: string; text: string }> {
  const res = await fetch("https://api.x.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
