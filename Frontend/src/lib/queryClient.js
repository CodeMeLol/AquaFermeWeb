import { QueryClient } from "@tanstack/react-query";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
// Convertit /api/tasks -> /tasks
function resolveUrl(path) {
  const normalized = path.replace(/^\/api\//, "/");
  return normalized.startsWith("http")
    ? normalized
    : `${API_BASE}${normalized}`;
}
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      queryFn: async ({ queryKey }) => {
        const path = queryKey[0];
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const url = resolveUrl(path);
        const headers = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const res = await fetch(url, { headers });
        const text = await res.text();
        if (!res.ok) {
          let msg = `Erreur ${res.status}`;
          try {
            msg = JSON.parse(text)?.error || msg;
          } catch (error) {
            console.error(error);
          }
          throw new Error(msg);
        }
        if (!text) return null;
        const parsed = JSON.parse(text);
        // Déballer automatiquement
        // { tasks:[...] } -> [...]
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const keys = Object.keys(parsed);
          if (keys.length === 1 && Array.isArray(parsed[keys[0]])) {
            return parsed[keys[0]];
          }
        }
        return parsed;
      },
    },
  },
});
export async function apiRequest(method, url, body) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const fullUrl = resolveUrl(url);
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = `Erreur ${res.status}`;
    try {
      msg = JSON.parse(text)?.error || msg;
    } catch (error) {
      console.error(error);
    }
    throw new Error(msg);
  }
  if (!text) return null;
  return JSON.parse(text);
}
