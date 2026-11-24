import { describe, it, expect } from 'vitest';
import { deriveTableState, stateToKey, keyToCoordinates } from '../features/trace-player/traceReducer';
import { TraceEvent } from '../types';

describe('traceReducer & Table state derivation', () => {
  it('converts state objects to unique string keys and back', () => {
    const state = { i: 2, w: 5 };
    const key = stateToKey(state);
    expect(key).toBe('i=2,w=5');

    const coords = keyToCoordinates(key);
    expect(coords).toEqual({ i: 2, w: 5 });
  });

  it('correctly replays state step-by-step from trace events', () => {
    const trace: TraceEvent[] = [
      {
        step: 0,
        kind: 'initialize',
        state: { n: 0 },
        writes: true,
        value: 0,
        dependencies: [],
        explanation: 'F(0) = 0',
      },
      {
        step: 1,
        kind: 'initialize',
        state: { n: 1 },
        writes: true,
        value: 1,
        dependencies: [],
        explanation: 'F(1) = 1',
      },
      {
        step: 2,
        kind: 'update',
        state: { n: 2 },
        writes: true,
        value: 1,
        dependencies: [{ n: 1 }, { n: 0 }],
        operation: 'F(1) + F(0)',
        explanation: 'F(2) = 1',
      },
      {
        step: 3,
        kind: 'finish',
        state: { n: 2 },
        writes: false,
        value: 1,
        dependencies: [],
        explanation: 'Finished',
      },
    ];

    // At step 0: only n=0 written
    const state0 = deriveTableState(trace, 0);
    expect(state0.cells['n=0']).toBe(0);
    expect(state0.cells['n=1']).toBeUndefined();
    expect(state0.activeEvent?.state).toEqual({ n: 0 });

    // At step 1: n=0 and n=1 written
    const state1 = deriveTableState(trace, 1);
    expect(state1.cells['n=0']).toBe(0);
    expect(state1.cells['n=1']).toBe(1);
    expect(state1.cells['n=2']).toBeUndefined();

    // At step 2: n=2 written, dependencies are n=1 and n=0
    const state2 = deriveTableState(trace, 2);
    expect(state2.cells['n=2']).toBe(1);
    expect(state2.activeDependencies.has('n=1')).toBe(true);
    expect(state2.activeDependencies.has('n=0')).toBe(true);
    expect(state2.recentWriteKey).toBe('n=2');

    // Clamps to step bounds safely
    const stateNegative = deriveTableState(trace, -1);
    expect(Object.keys(stateNegative.cells).length).toBe(0);

    const stateOverflow = deriveTableState(trace, 999);
    expect(stateOverflow.cells['n=2']).toBe(1);
  });
});
