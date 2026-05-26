const BASE_URL = (process.env.REACT_APP_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const TIMEOUT_MS = 45_000;

export interface ChatPayload {
  query: string;
  session_id?: string;
  chapter_id?: string;
}

export interface ChatSelectPayload {
  query: string;
  session_id?: string;
  chapter_id: string;
}

export interface SourceRef {
  chapter_id: string;
  heading: string;
  score: number;
}

export interface ChatResponse {
  answer: string;
  session_id: string;
  sources: SourceRef[];
}

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export function postChat(payload: ChatPayload): Promise<ChatResponse> {
  return postJSON<ChatResponse>('/api/chat', payload);
}

export function postChatSelect(payload: ChatSelectPayload): Promise<ChatResponse> {
  return postJSON<ChatResponse>('/api/chat/select', payload);
}
