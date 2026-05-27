import siteConfig from '@generated/docusaurus.config';

const BASE_URL = (
  ((siteConfig.customFields?.apiUrl) as string | undefined) ?? 'http://localhost:8000'
).replace(/\/$/, '');

const TOKEN_KEY = 'physical_ai_auth_token';
const USER_KEY = 'physical_ai_auth_user';

export interface UserSession {
  user_id: string;
  email: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  software_level: string;
  python_familiarity: string;
  linux_familiarity: string;
  hardware_background: string;
  ai_ml_familiarity: string;
}

export interface SigninPayload {
  email: string;
  password: string;
}

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string, user: UserSession): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore storage errors
  }
}

function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore storage errors
  }
}

function getCachedUser(): UserSession | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const authClient = {
  async signUp(payload: SignupPayload): Promise<{ user_id: string; token: string }> {
    const data = await apiFetch<{ user_id: string; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setToken(data.token, { user_id: data.user_id, email: payload.email });
    return data;
  },

  async signIn(payload: SigninPayload): Promise<{ user_id: string; token: string }> {
    const data = await apiFetch<{ user_id: string; token: string }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const session = await apiFetch<UserSession>('/api/auth/session', {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    setToken(data.token, session);
    return data;
  },

  signOut(): void {
    clearToken();
  },

  getToken,

  getCachedUser,

  async getSession(): Promise<UserSession | null> {
    const token = getToken();
    if (!token) return null;
    try {
      const session = await apiFetch<UserSession>('/api/auth/session', {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem(USER_KEY, JSON.stringify(session));
      return session;
    } catch {
      clearToken();
      return null;
    }
  },
};
