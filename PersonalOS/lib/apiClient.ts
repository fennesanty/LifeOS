export async function postJSON(url: string, body: unknown): Promise<{ ok: boolean; data: unknown; error?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`POST ${url} failed:`, res.status, data);
      return { ok: false, data, error: data.error || `HTTP ${res.status}` };
    }
    return { ok: true, data };
  } catch (err) {
    console.error(`POST ${url} threw:`, err);
    return { ok: false, data: null, error: err instanceof Error ? err.message : "network error" };
  }
}

export async function getJSON(url: string): Promise<{ ok: boolean; data: unknown; error?: string }> {
  try {
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`GET ${url} failed:`, res.status, data);
      return { ok: false, data, error: data.error || `HTTP ${res.status}` };
    }
    return { ok: true, data };
  } catch (err) {
    console.error(`GET ${url} threw:`, err);
    return { ok: false, data: null, error: err instanceof Error ? err.message : "network error" };
  }
}
