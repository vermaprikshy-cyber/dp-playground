import { AlgorithmDetail, RunResponse } from '../types';

const API_BASE = '/api/v1';

export async function fetchHealth(): Promise<{ status: string; worker_ready: boolean }> {
  const res = await fetch('/health');
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchAlgorithms(): Promise<AlgorithmDetail[]> {
  const res = await fetch(`${API_BASE}/algorithms`);
  if (!res.ok) {
    throw new Error(`Failed to load algorithms list: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchAlgorithm(id: string): Promise<AlgorithmDetail> {
  const res = await fetch(`${API_BASE}/algorithms/${id}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Algorithm '${id}' not found.`);
    }
    throw new Error(`Failed to load algorithm details: ${res.statusText}`);
  }
  return res.json();
}

export interface RunPayload {
  algorithm_id: string;
  strategy: string;
  input: Record<string, any>;
  include_trace?: boolean;
}

export async function executeAlgorithm(payload: RunPayload): Promise<RunResponse> {
  const res = await fetch(`${API_BASE}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.detail?.message || data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}
