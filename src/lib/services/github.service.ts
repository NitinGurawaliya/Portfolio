export async function fetchGitHub<T = any>(url: string, accessToken: string): Promise<{ data: T | null; status: number }> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github.v3+json" } })
  try {
    const data = (await res.json()) as T
    return { data, status: res.status }
  } catch {
    return { data: null, status: res.status }
  }
}
