import { TraceEvent, TableState } from '../../types';

export function stateToKey(state: Record<string, number>): string {
  const keys = Object.keys(state).sort();
  return keys.map((k) => `${k}=${state[k]}`).join(',');
}

export function keyToCoordinates(key: string): Record<string, number> {
  const parts = key.split(',');
  const coords: Record<string, number> = {};
  for (const part of parts) {
    const [k, v] = part.split('=');
    coords[k] = parseInt(v, 10);
  }
  return coords;
}

export function deriveTableState(trace: TraceEvent[], upToStep: number): TableState {
  const cells: Record<string, number> = {};
  const clampedStep = Math.max(-1, Math.min(upToStep, trace.length - 1));

  let activeEvent: TraceEvent | null = null;
  const activeDependencies = new Set<string>();
  let recentWriteKey: string | null = null;

  for (let i = 0; i <= clampedStep; i++) {
    const event = trace[i];
    if (event.writes && typeof event.value === 'number') {
      const key = stateToKey(event.state);
      cells[key] = event.value;
      if (i === clampedStep) {
        recentWriteKey = key;
      }
    }
  }

  if (clampedStep >= 0 && clampedStep < trace.length) {
    activeEvent = trace[clampedStep];
    for (const dep of activeEvent.dependencies || []) {
      activeDependencies.add(stateToKey(dep));
    }
  }

  return {
    cells,
    activeEvent,
    activeDependencies,
    recentWriteKey,
  };
}
