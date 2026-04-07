const TOKEN_KEY = "adclarity_admin_token";
const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") + "/api";

export type AdminSession = {
  email: string;
  role: "admin";
  plan: "pro";
  isAdmin: true;
  testMode: boolean;
};

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function adminLogin(
  email: string,
  accessCode: string
): Promise<{ token: string; role: string; plan: string }> {
  const res = await fetch(`${API_BASE}/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, accessCode }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Access denied");
  }
  const data = await res.json();
  storeToken(data.token);
  return data;
}

export async function verifySession(token: string): Promise<AdminSession | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearToken();
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

export async function adminLogout() {
  const token = getStoredToken();
  if (token) {
    await fetch(`${API_BASE}/auth/admin-logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  clearToken();
}
