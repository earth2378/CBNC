export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = typeof init?.body !== "undefined" && init.body !== null;
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const defaultHeaders = hasBody && !isFormData ? { "Content-Type": "application/json" } : {};

  const response = await fetch(`/backend${path}`, {
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...(init?.headers || {})
    },
    ...init
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.error?.message || `Request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }

  return payload as T;
}
