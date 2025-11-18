import Constants from "expo-constants";

const DEFAULT_API_URL = "http://192.168.100.3:3000";

// Expo SDK terbaru → gunakan expoConfig.extra
const extra = Constants.expoConfig?.extra;

export const API_BASE = extra?.API_URL || DEFAULT_API_URL;

type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T = any>(
  path: string,
  method: HTTPMethod = "GET",
  body?: any,
  token?: string
): Promise<T> {
  const url = `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  const headers: any = { Accept: "application/json" };
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
  });

  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";
  const data =
    contentType.includes("application/json") && text ? JSON.parse(text) : text;

  if (!res.ok) {
    const error = new Error(
      (data && (data.message || JSON.stringify(data))) || res.statusText
    );
    (error as any).status = res.status;
    (error as any).body = data;
    throw error;
  }

  return data as T;
}

export const api = {
  get: <T = any>(path: string, token?: string) =>
    request<T>(path, "GET", undefined, token),
  post: <T = any>(path: string, body?: any, token?: string) =>
    request<T>(path, "POST", body, token),
  put: <T = any>(path: string, body?: any, token?: string) =>
    request<T>(path, "PUT", body, token),
  patch: <T = any>(path: string, body?: any, token?: string) =>
    request<T>(path, "PATCH", body, token),
  del: <T = any>(path: string, token?: string) =>
    request<T>(path, "DELETE", undefined, token),
  API_BASE,
};
