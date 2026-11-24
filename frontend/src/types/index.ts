export interface TraceEvent {
  step: number;
  kind: 'initialize' | 'evaluate' | 'update' | 'choose' | 'finish';
  state: Record<string, number>;
  writes: boolean;
  value: number;
  dependencies: Array<Record<string, number>>;
  operation?: string;
  explanation: string;
  label?: string;
}

export interface AlgorithmComplexity {
  time: string;
  space: string;
}

export interface RunMetrics {
  state_count: number;
  unique_states?: number;
  elapsed_ms: number;
}

export interface VisualizationConfig {
  kind: 'row' | 'grid';
  title: string;
  index_key?: string;
  offset?: number;
  labels?: string[];
  legend: string;
  row_key?: string;
  col_key?: string;
  row_count?: number;
  col_count?: number;
  row_labels?: string[];
  col_labels?: string[];
}

export interface RunResponse {
  run_id: string;
  algorithm_id: string;
  strategy: string;
  status: 'success' | 'error';
  result: Record<string, any>;
  complexity: AlgorithmComplexity;
  metrics: RunMetrics;
  visualization: VisualizationConfig;
  trace?: TraceEvent[];
  message?: string;
}

export interface Preset {
  id: string;
  name: string;
  strategy: string;
  input: Record<string, any>;
}

export interface AlgorithmDetail {
  id: string;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  family: string;
  topics: string[];
  strategies: string[];
  summary: string;
  description: string;
  state_definition: string;
  recurrence: string;
  base_cases: string[];
  complexity: Record<string, AlgorithmComplexity>;
  constraints: Record<string, any>;
  presets: Preset[];
}

export interface CellDisplayState {
  key: string;
  displayValue: string | number;
  isFilled: boolean;
  isActive: boolean;
  isDependency: boolean;
  isRecentWrite: boolean;
  highlightText?: string;
}

export interface TableState {
  cells: Record<string, number>;
  activeEvent: TraceEvent | null;
  activeDependencies: Set<string>;
  recentWriteKey: string | null;
}
