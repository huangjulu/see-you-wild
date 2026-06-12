export interface ApiErrorBody {
  error: string;
  code?: string;
}

export class ApiError extends Error {
  readonly code: string | undefined;
  readonly status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (response.ok) {
    return response.json();
  }

  const body: ApiErrorBody | null = await response.json().catch(() => null);
  throw new ApiError(
    body?.error ?? `Request failed: ${response.status}`,
    response.status,
    body?.code
  );
}
