// Lightweight API client for external MongoDB backend
// Stores baseUrl and JWT token in localStorage (no env vars used)

export type ApiConfig = {
  baseUrl: string; // e.g. https://api.yourdomain.com/api
  token?: string; // JWT
};

const STORAGE_KEY = "ims.api.config";

function readConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { baseUrl: "" };
    const parsed = JSON.parse(raw);
    return { baseUrl: parsed.baseUrl || "", token: parsed.token || undefined };
  } catch {
    return { baseUrl: "" };
  }
}

function writeConfig(cfg: ApiConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export const apiConfig = {
  get: (): ApiConfig => readConfig(),
  set: (cfg: ApiConfig) => writeConfig(cfg),
  setBaseUrl: (baseUrl: string) => {
    const current = readConfig();
    writeConfig({ ...current, baseUrl });
  },
  setToken: (token?: string) => {
    const current = readConfig();
    writeConfig({ ...current, token });
  },
  isConfigured: () => {
    const { baseUrl } = readConfig();
    return Boolean(baseUrl);
  },
};

function buildUrl(path: string) {
  const { baseUrl } = readConfig();
  if (!baseUrl) throw new Error("API base URL not set. Open Settings to configure it.");
  const trimmedBase = baseUrl.replace(/\/$/, "");
  const trimmedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = buildUrl(path);
  const { token } = readConfig();
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  // Health
  health: () => request<{ ok: boolean; ts?: number }>("/health"),

  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    ),
  register: (name: string, email: string, password: string, role?: "admin" | "manager" | "staff") =>
    request<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      }
    ),

  // Generic CRUD helpers (you can use these later in pages)
  list: <T>(resource: string, q?: string) => request<T[]>(q ? `/${resource}?q=${encodeURIComponent(q)}` : `/${resource}`),
  get: <T>(resource: string, id: string) => request<T>(`/${resource}/${id}`),
  create: <T>(resource: string, payload: unknown) =>
    request<T>(`/${resource}`, { method: "POST", body: JSON.stringify(payload) }),
  update: <T>(resource: string, id: string, payload: unknown) =>
    request<T>(`/${resource}/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (resource: string, id: string) => request<{ ok: boolean }>(`/${resource}/${id}`, { method: "DELETE" }),
};
