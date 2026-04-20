const TOKEN_KEY = "adclarity_admin_token";

// Build the API base relative to the current origin so it always routes
// through Replit's proxy correctly — /api goes to the API server regardless
// of the frontend's base path.
const API_BASE = "/api";

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

/**
 * Decode the JWT payload client-side WITHOUT signature verification.
 * Used only for reading claims to set UI state — the real security
 * is enforced server-side when the token was signed.
 */
export function decodeTokenPayload(token: string): AdminSession | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Base64url → base64 → JSON
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    const payload = JSON.parse(json);
    // Validate the claims we care about
    if (payload.role !== "admin" || payload.isAdmin !== true) return null;
    // Check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      clearToken();
      return null;
    }
    return {
      email: payload.email ?? "",
      role: "admin",
      plan: "pro",
      isAdmin: true,
      testMode: false,
    };
  } catch {
    return null;
  }
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
    throw new Error((data as { error?: string }).error ?? "Access denied");
  }
  const data = (await res.json()) as { token: string; role: string; plan: string };
  storeToken(data.token);
  return data;
}

/** Background server verification — optional, does not affect client UI state. */
export async function verifySession(token: string): Promise<AdminSession | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearToken();
      return null;
    }
    return (await res.json()) as AdminSession;
  } catch {
    // Server unreachable — fall back to local decode
    return decodeTokenPayload(token);
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
