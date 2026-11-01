import type {
  HealthResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RunsListResponse,
  Run,
  EvaluationRequest,
  EvaluationResponse,
  ArenaRequest,
  ArenaResponse,
  ArenaHistoryResponse,
  CampaignRequest,
  CampaignResponse,
  GuardianResponse,
  AutonomyHistoryResponse,
  BenchmarkRequest,
  BenchmarkResponse,
  ScoreboardResponse,
  BenchmarkReplayResponse,
} from '../types/api';

export class ApiError extends Error {
  status: number;
  data?: unknown;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, data?: unknown, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.fieldErrors = fieldErrors;
  }
}

// Token management callbacks for decoupling AuthContext from API client
let currentToken: string | null = null;
let onAuthExpiredCallback: (() => void) | null = null;

export function setApiToken(token: string | null) {
  currentToken = token;
}

export function setOnAuthExpired(callback: () => void) {
  onAuthExpiredCallback = callback;
}

export function getApiBaseUrl(): string {
  // If explicitly configured to disable local proxying:
  if (import.meta.env.VITE_USE_PROXY === 'false') {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
      return envUrl.trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '');
    }
    return 'https://agent-security-4.onrender.com';
  }

  // In development, default to relative paths so all requests are same-origin
  // and handled by Vite's proxy. This eliminates all CORS issues across any origin,
  // including localhost, 127.0.0.1, and dynamic ports.
  if (import.meta.env.DEV) {
    return '';
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '');
  }
  return 'https://agent-security-4.onrender.com';
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

/**
 * Format FastAPI 422 validation detail array into user-friendly message & field map
 */
function parseValidationError(detail: unknown): { message: string; fieldErrors?: Record<string, string> } {
  if (Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {};
    const messages = detail.map((err) => {
      const loc = Array.isArray(err.loc) ? err.loc.filter((l: unknown) => l !== 'body').join('.') : 'field';
      const msg = err.msg || 'Invalid value';
      const cleanMsg = `${loc}: ${msg}`;
      if (loc) {
        fieldErrors[loc] = msg;
      }
      return cleanMsg;
    });
    return {
      message: messages.join(' | ') || 'Validation error',
      fieldErrors,
    };
  }
  if (typeof detail === 'string') {
    return { message: detail };
  }
  return { message: 'Invalid request data' };
}

/**
 * Execute HTTP fetch with timeout, headers, retry for 429, and automatic fallback
 */
async function request<T>(path: string, options: RequestOptions = {}, retries = 2): Promise<T> {
  const isHealth = path === '/health';
  const normPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  const primaryUrl = isHealth ? `${baseUrl}/health` : `${baseUrl}/api/v1${normPath}`;

  // Resilient fallback URL: if primary was relative (proxy), fallback is direct remote;
  // if primary was direct remote, fallback is relative (proxy).
  const fallbackUrl = baseUrl
    ? (isHealth ? '/health' : `/api/v1${normPath}`)
    : (isHealth ? 'https://agent-security-4.onrender.com/health' : `https://agent-security-4.onrender.com/api/v1${normPath}`);

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (!options.skipAuth && currentToken) {
    headers.set('Authorization', `Bearer ${currentToken}`);
  }

  const timeoutMs = options.timeoutMs ?? 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Link caller-supplied signal if provided
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    let response: Response;
    try {
      response = await fetch(primaryUrl, {
        ...options,
        credentials: 'include',
        headers,
        signal: controller.signal,
      });
    } catch (primaryErr: any) {
      // If primary fetch failed with NetworkError or CORS block, attempt transparent fallback
      if (fallbackUrl && fallbackUrl !== primaryUrl && primaryErr.name !== 'AbortError') {
        try {
          response = await fetch(fallbackUrl, {
            ...options,
            credentials: 'include',
            headers,
            signal: controller.signal,
          });
        } catch {
          throw primaryErr;
        }
      } else {
        throw primaryErr;
      }
    }

    clearTimeout(timeoutId);

    // Handle 429 Rate Limited with backoff retry
    if (response.status === 429 && retries > 0) {
      await new Promise((r) => setTimeout(r, 1200 * (3 - retries)));
      return request<T>(path, options, retries - 1);
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
      if (!options.skipAuth && onAuthExpiredCallback) {
        onAuthExpiredCallback();
      }
      throw new ApiError(401, 'Your session has expired or is invalid. Please sign in again.');
    }

    // Parse response body
    let body: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        body = await response.json();
      } catch {
        body = null;
      }
    } else {
      body = await response.text();
    }

    if (!response.ok) {
      if (response.status === 403) {
        throw new ApiError(403, 'Access denied. You do not have permission to access this resource.', body);
      }
      if (response.status === 404) {
        const msg = typeof body?.detail === 'string' ? body.detail : 'The requested resource was not found.';
        throw new ApiError(404, msg, body);
      }
      if (response.status === 422) {
        const { message, fieldErrors } = parseValidationError(body?.detail);
        throw new ApiError(422, message, body, fieldErrors);
      }
      if (response.status >= 500) {
        const msg = response.status === 503
          ? 'Service temporarily unavailable. Please retry in a moment.'
          : 'A server error occurred. Please try again.';
        throw new ApiError(response.status, msg, body);
      }

      const msg = typeof body?.detail === 'string' ? body.detail : (body?.message || `Request failed with status ${response.status}`);
      throw new ApiError(response.status, msg, body);
    }

    return body as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError(408, `Request timed out after ${Math.round(timeoutMs / 1000)}s. Please retry.`);
    }

    // Network / CORS / unreachable error
    const isCorsOrNetwork = error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError');
    if (isCorsOrNetwork) {
      throw new ApiError(
        0,
        `Unable to connect to AgentShield backend. Ensure the server is reachable and running.`
      );
    }

    throw new ApiError(0, error.message || 'An unexpected network error occurred.');
  }
}

// Long-running endpoints use 150s timeout
const LONG_TIMEOUT_MS = 150000;

export const api = {
  // System Health
  health: (signal?: AbortSignal) =>
    request<HealthResponse>('/health', { method: 'GET', skipAuth: true, timeoutMs: 15000, signal }),

  // Authentication
  register: (data: RegisterRequest) =>
    request<RegisterResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),

  login: (data: LoginRequest) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),

  // Runs
  getRuns: (limit = 20, signal?: AbortSignal) =>
    request<RunsListResponse>(`/runs?limit=${Math.min(Math.max(limit, 1), 100)}`, { method: 'GET', signal }),

  getRun: (runId: string, signal?: AbortSignal) =>
    request<Run>(`/runs/${encodeURIComponent(runId)}`, { method: 'GET', signal }),

  // Evaluations (synchronous long-running)
  runEvaluation: (data: EvaluationRequest, signal?: AbortSignal) =>
    request<EvaluationResponse>('/evaluations/run', {
      method: 'POST',
      body: JSON.stringify(data),
      timeoutMs: LONG_TIMEOUT_MS,
      signal,
    }),

  // Arena (synchronous long-running)
  runArena: (data: ArenaRequest, signal?: AbortSignal) =>
    request<ArenaResponse>('/arena/run', {
      method: 'POST',
      body: JSON.stringify(data),
      timeoutMs: LONG_TIMEOUT_MS,
      signal,
    }),

  getArenaHistory: (limit = 20, signal?: AbortSignal) =>
    request<ArenaHistoryResponse>(`/arena/history?limit=${Math.min(Math.max(limit, 1), 100)}`, { method: 'GET', signal }),

  getArenaReplay: (runId: string, signal?: AbortSignal) =>
    request<Run>(`/arena/replay/${encodeURIComponent(runId)}`, { method: 'GET', signal }),

  // Autonomous Campaign (synchronous long-running)
  runCampaign: (data: CampaignRequest, signal?: AbortSignal) =>
    request<CampaignResponse>('/autonomy/campaign', {
      method: 'POST',
      body: JSON.stringify(data),
      timeoutMs: LONG_TIMEOUT_MS,
      signal,
    }),

  getGuardian: (signal?: AbortSignal) =>
    request<GuardianResponse>('/autonomy/guardian', { method: 'GET', signal }),

  getAutonomyHistory: (limit = 20, signal?: AbortSignal) =>
    request<AutonomyHistoryResponse>(`/autonomy/history?limit=${Math.min(Math.max(limit, 1), 100)}`, { method: 'GET', signal }),

  // Benchmarks (synchronous long-running)
  runBenchmark: (data: BenchmarkRequest, signal?: AbortSignal) =>
    request<BenchmarkResponse>('/benchmarks/run', {
      method: 'POST',
      body: JSON.stringify(data),
      timeoutMs: LONG_TIMEOUT_MS,
      signal,
    }),

  getBenchmarkScoreboard: (limit = 20, signal?: AbortSignal) =>
    request<ScoreboardResponse>(`/benchmarks/scoreboard?limit=${Math.min(Math.max(limit, 1), 100)}`, { method: 'GET', signal }),

  getBenchmarkHistory: (limit = 20, signal?: AbortSignal) =>
    request<ScoreboardResponse>(`/benchmarks/history?limit=${Math.min(Math.max(limit, 1), 100)}`, { method: 'GET', signal }),

  getBenchmarkReplay: (runId: string, signal?: AbortSignal) =>
    request<BenchmarkReplayResponse>(`/benchmarks/replay/${encodeURIComponent(runId)}`, { method: 'GET', signal }),
};
