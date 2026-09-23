const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type RequestOptions = RequestInit & {
  token?: string;
};

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  if (fetchOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    cache: "no-store",
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as any).message === "string"
        ? (data as any).message
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export const api = {
  get<T>(endpoint: string, options?: RequestOptions) {
    return request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  },

  post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ) {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },

  put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ) {
    return request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ) {
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string, options?: RequestOptions) {
    return request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  },
};

export { API_BASE_URL };
