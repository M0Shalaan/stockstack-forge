// Lightweight API client for external MongoDB backend
// Stores baseUrl and JWT token in localStorage (no env vars used)

export type ApiConfig = {
  baseUrl: string; // e.g. https://api.yourdomain.com/api
  token?: string;  // JWT
};

export type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: string;
  details?: Array<{ field: string; message: string }>;
};

const STORAGE_KEY = "ims.api.config";
const DEFAULT_BASE_URL = "http://localhost:4000/api";

/* ------------------------- Config helpers ------------------------- */
function readConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { baseUrl: DEFAULT_BASE_URL };
    const parsed = JSON.parse(raw);
    return {
      baseUrl: parsed.baseUrl || DEFAULT_BASE_URL,
      token: parsed.token || undefined,
    };
  } catch {
    return { baseUrl: DEFAULT_BASE_URL };
  }
}

function writeConfig(cfg: ApiConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export const apiConfig = {
  get: readConfig,
  set: writeConfig,
  setBaseUrl: (baseUrl: string) => {
    const current = readConfig();
    writeConfig({ ...current, baseUrl });
  },
  setToken: (token?: string) => {
    const current = readConfig();
    writeConfig({ ...current, token });
  },
  isConfigured: () => Boolean(readConfig().baseUrl),
};

/* ------------------------- Request builder ------------------------- */
function buildUrl(path: string) {
  const { baseUrl } = readConfig();
  if (!baseUrl) throw new Error("API base URL not set. Open Settings to configure it.");

  const trimmedBase = baseUrl.replace(/\/$/, "");
  const trimmedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { token } = readConfig();
  const url = buildUrl(path);

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new Error(`Network error: ${(err as Error).message}`);
  }

  let data: any;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : undefined;
  } catch {
    throw new Error("Invalid JSON response from server.");
  }

  if (!res.ok) {
    const message = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  // If wrapped in ApiResponse
  if (data && typeof data === "object" && "success" in data) {
    return (data.data !== undefined ? data.data : data) as T;
  }

  return data as T;
}

/* ------------------------- API methods ------------------------- */
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

  getProfile: () =>
    request<{ user: { id: string; name: string; email: string; role: string } }>("/auth/profile"),

  // Stock
  getStockLevels: (warehouseId?: string) =>
    request<
      Array<{
        id: string;
        product: any;
        warehouse: any;
        quantity: number;
        isLowStock: boolean;
      }>
    >(warehouseId ? `/stock?warehouse=${warehouseId}` : "/stock"),

  getStockAlerts: () =>
    request<
      Array<{
        id: string;
        product: any;
        warehouse: any;
        quantity: number;
        isLowStock: boolean;
      }>
    >("/stock/alerts"),

  // Generic CRUD helpers with pagination support
  list: <T>(resource: string, q?: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<T[]>(`/${resource}${query}`);
  },

  get:   <T>(resource: string, id: string) => request<T>(`/${resource}/${id}`),
  create:<T>(resource: string, payload: unknown) =>
    request<T>(`/${resource}`, { method: "POST", body: JSON.stringify(payload) }),
  update:<T>(resource: string, id: string, payload: unknown) =>
    request<T>(`/${resource}/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove:(resource: string, id: string) =>
    request<{ success: boolean; message?: string }>(`/${resource}/${id}`, { method: "DELETE" }),
};
