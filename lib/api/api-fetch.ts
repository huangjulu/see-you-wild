export interface ApiError {
  error: string;
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (response.ok) {
    return response.json();
  }

  const body: ApiError | null = await response.json().catch(() => null);
  throw new Error(body?.error ?? `Request failed: ${response.status}`);
}
