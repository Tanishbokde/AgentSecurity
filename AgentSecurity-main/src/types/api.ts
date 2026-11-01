export interface HealthResponse {
  status: 'ok' | 'degraded' | string;
  database: 'connected' | 'unavailable' | string;
  execution_mode: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RunMetrics {
  proposed_actions?: number;
  blocked_actions?: number;
  executed_actions?: number;
  unauthorized_executions?: number;
  action_block_rate?: number;
  [key: string]: unknown;
}

export interface Action {
  trace_id: string;
  tool: string;
  arguments?: Record<string, unknown>;
  allowed: boolean;
  reason?: string;
  executed: boolean;
  result?: Record<string, unknown>;
  guardian_policy?: string | Record<string, unknown>;
  risk?: string;
  provenance?: string;
  [key: string]: unknown;
}

export interface Run {
  id: string;
  owner_id?: string;
  scenario: string;
  status: string;
  trace_id: string;
  target_response?: string;
  red_team_attack?: string;
  actions: Action[];
  metrics: RunMetrics;
  execution_mode: string;
  created_at: string;
  [key: string]: unknown;
}

export interface RunsListResponse {
  items: Run[];
  [key: string]: unknown;
}

export interface EvaluationRequest {
  rounds: number;
}

export interface EvaluationSummary {
  rounds?: number;
  proposed_actions?: number;
  blocked_actions?: number;
  executed_actions?: number;
  action_block_rate?: number;
  legitimate_tasks?: number;
  legitimate_task_success_rate?: number;
  unauthorized_executions?: number;
  execution_mode?: string;
  [key: string]: unknown;
}

export interface EvaluationResponse {
  summary: EvaluationSummary;
  runs: Run[];
  [key: string]: unknown;
}

export interface ArenaRequest {
  rounds?: number;
  attacks_per_round?: number;
  include_heldout?: boolean;
}

export interface ArenaCase {
  case_id: string;
  split: 'train' | 'heldout' | string;
  objective: string;
  family: string;
  scenario: string;
  run_id: string;
  trace_id: string;
  verdict: string | Record<string, unknown>;
  [key: string]: unknown;
}

export interface ArenaRound {
  id?: string;
  summary?: {
    round?: number;
    cases?: number;
    guardian_feedback?: string | Record<string, unknown>;
    [key: string]: unknown;
  };
  cases?: ArenaCase[];
  [key: string]: unknown;
}

export interface ArenaResponse {
  status: string;
  execution_mode: string;
  rounds: ArenaRound[];
  note?: string;
  [key: string]: unknown;
}

export interface ArenaHistoryItem {
  id: string;
  round?: number;
  summary?: Record<string, unknown>;
  cases?: ArenaCase[];
  execution_mode?: string;
  created_at: string;
  [key: string]: unknown;
}

export interface ArenaHistoryResponse {
  items: ArenaHistoryItem[];
  [key: string]: unknown;
}

export interface CampaignRequest {
  rounds?: number;
  attacks_per_round?: number;
  include_heldout?: boolean;
  include_benign?: boolean;
}

export interface CampaignSummary {
  round?: number;
  cases?: number;
  attack_cases?: number;
  attack_successes?: number;
  attack_success_rate?: number;
  heldout_cases?: number;
  heldout_block_rate?: number;
  benign_cases?: number;
  usefulness_rate?: number;
  protected_reads?: number;
  canary_hits?: number;
  unauthorized_effects?: number;
  guardian_version?: number | string;
  guardian_feedback?: string | Record<string, unknown>;
  execution_mode?: string;
  [key: string]: unknown;
}

export interface CampaignRound {
  id?: string;
  summary?: CampaignSummary;
  cases?: Record<string, unknown>[];
  [key: string]: unknown;
}

export interface CampaignResponse {
  status: string;
  execution_mode: string;
  rounds: CampaignRound[];
  notes?: string[];
  [key: string]: unknown;
}

export interface GuardianResponse {
  policy: Record<string, unknown>;
  mode: string;
  base_allow_lists_unchanged: boolean;
  heldout_learning_enabled: boolean;
  [key: string]: unknown;
}

export interface AutonomyHistoryItem {
  id: string;
  rounds?: CampaignRound[];
  execution_mode?: string;
  created_at: string;
  [key: string]: unknown;
}

export interface AutonomyHistoryResponse {
  items: AutonomyHistoryItem[];
  [key: string]: unknown;
}

export interface BenchmarkRequest {
  rounds?: number;
  attacks_per_round?: number;
  include_heldout?: boolean;
  include_benign?: boolean;
}

export interface BenchmarkResponse {
  status: string;
  execution_mode: string;
  rounds: Record<string, unknown>[];
  disclaimer?: string;
  [key: string]: unknown;
}

export interface ScoreboardItem {
  id: string;
  summary: Record<string, unknown>;
  created_at: string;
  [key: string]: unknown;
}

export interface ScoreboardResponse {
  items: ScoreboardItem[];
  scope: string;
  execution_mode: string;
  [key: string]: unknown;
}

export interface ReplayTimelineEvent {
  sequence: number;
  trace_id: string;
  tool: string;
  allowed: boolean;
  executed: boolean;
  reason?: string;
  risk?: string;
  policy?: string | Record<string, unknown>;
  provenance?: string;
  [key: string]: unknown;
}

export interface BenchmarkReplayResponse {
  run_id: string;
  trace_id: string;
  scenario: string;
  execution_mode: string;
  timeline: ReplayTimelineEvent[];
  metrics?: RunMetrics;
  note?: string;
  [key: string]: unknown;
}
