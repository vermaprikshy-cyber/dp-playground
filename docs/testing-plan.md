# Comprehensive Testing Strategy & Quality Gates

> Reference: Dynamic Programming Playground Specification v2.0, Sections 12 & 13.

This document details the multi-layered testing harness, deterministic test suites, edge case matrices, and release quality gates for the Dynamic Programming Playground.

---

## 1. Test Layers & Verification Matrix

| Layer | Scope / Cases Covered | Harness / Tool | Evidence / Artifact |
|---|---|---|---|
| **C++ Algorithm Core** | Deterministic outputs, base cases ($0, 1$), recurrence invariants, monotonic trace indexing, memory boundaries. | Standalone C++ test runner (`test_engine.exe`) | Process exit code 0; `engine tests passed` console output. |
| **FastAPI Backend** | Request body validation, per-algorithm constraints, subprocess timeout, sanitized error responses, catalog endpoints. | `pytest` + `fastapi.testclient.TestClient` | 9 automated pytest tests in `backend/tests/test_api.py`. |
| **React Frontend** | Client-side validators, trace playback reducer (`deriveTableState`), component rendering, keyboard navigation, empty trace fallback. | `vitest` + `@testing-library/react` + `jsdom` | 18 automated unit and component tests in `frontend/src/test/`. |
| **End-to-End Integration** | Cross-layer payload delivery: input $\to$ C++ engine worker $\to$ FastAPI gateway $\to$ frontend rendering. | Automated integration script (`scripts/run_all_tests.ps1`) | Verification of all 3 test suites passing consecutively. |

---

## 2. Minimum Deterministic Test Set

### A. Fibonacci Sequence
- **$n = 0$**: Returns $0$ (base case $F(0) = 0$).
- **$n = 1$**: Returns $1$ (base case $F(1) = 1$).
- **$n = 10$**: Returns $55$ across Tabulation, Memoization, and Naive Recursion.
  - Tabulation evaluates 11 states ($F(0) \dots F(10)$).
  - Naive Recursion evaluates 177 recursive calls ($> \text{memoization}$).
- **Boundaries**:
  - $n = 40$ (maximum supported in Tabulation/Memoization).
  - $n = 13$ rejected in Recursive strategy ($422$ Unprocessable Entity to protect browser thread).
  - Negative $n = -1$ rejected ($422$ Unprocessable Entity with `"n must be non-negative"` message).

### B. Climbing Stairs
- **$n = 1$**: Returns $1$ way ($[1]$).
- **$n = 2$**: Returns $2$ ways ($[1+1], [2]$).
- **$n = 5$**: Returns $8$ ways.
- **Boundaries**:
  - $n = 0$ rejected (minimum is 1 stair).
  - $n = 31$ rejected (capped at $30$ stairs).
  - $n > 12$ rejected in recursive mode.

### C. 0/1 Knapsack Problem
- **Textbook Case**: Weights `[1, 3, 4, 5]`, Values `[1, 4, 5, 7]`, Capacity `7` $\implies$ Max Value `9`, Selected Items `[1, 2]`.
- **Capacity = 0**: Returns `0` max value; zero capacity base case verified.
- **Single Item**: Fits $\implies$ included; does not fit $\implies$ `0`.
- **All Items Too Heavy**: Returns `0` with empty selection.
- **Duplicate Weights**: Correctly handles identical weights with different values.
- **Array Length Mismatch**: Weights length 2 vs Values length 1 $\implies 422$ validation rejection before invoking worker.
- **Zero or Negative Weights**: Rejected ($422$) as weight must be a positive integer $\ge 1$.
- **Recursive Strategy for Knapsack**: Safely rejected ($422$) with clear explanatory message.

### D. Trace Player Invariants
- **Deterministic Playback**: Replaying up to step $k$ always yields the identical subset of filled cells and active dependencies.
- **Boundaries**:
  - Step $< 0$ clamps to empty table without exception.
  - Step $\ge \text{total}$ clamps to final step without index overflow.
- **Dependency Integrity**: Every dependency referenced in an `update` event was previously written or initialized in the trace.
- **Trace Toggle**: Disabling `include_trace` returns the authoritative answer without crashing the table visualizer (`Empty trace` state).

---

## 3. Example Test Matrix & Prioritization

| ID | Scenario | Expected Behavior | Priority | Tested In |
|---|---|---|---|---|
| **TM-01** | Run preset Fibonacci $F(10)$ | Correct result ($55$) and 12 trace events emitted. | P0 | `test_api.py`, `traceReducer.test.ts` |
| **TM-02** | Change input after a run | Prior result marked stale; warning banner appears. | P0 | `Workspace.tsx`, Manual QA |
| **TM-03** | Step controls at boundary | Previous disabled at step 0; Next disabled at final step. | P0 | `components.test.tsx` |
| **TM-04** | Worker execution timeout | Subprocess terminates; returns 504 with safe message. | P0 | `worker.py`, `test_api.py` |
| **TM-05** | Array length mismatch | 422 returned with `field: "input.values"`; worker not spawned. | P0 | `validation.py`, `validation.test.ts` |
| **TM-06** | Keyboard navigation | `Space` toggles play/pause, `←`/`→` steps, `R` resets. | P1 | `TraceControls.tsx` |
| **TM-07** | High-contrast & reduced motion | Accessible badges (`[CUR]`, `[DEP]`); animations disabled when preferred. | P1 | `index.css`, `DPTable.tsx` |
| **TM-08** | Mobile screen responsiveness | Two-column desktop layout collapses to single column with horizontal table scroll. | P1 | `index.css`, Workspace layout |

---

## 4. Quality Gates for Release

Every release must satisfy the following gates before merging:
1. **Automated Suite**: `powershell -File scripts/run_all_tests.ps1` completes with **0 failures**.
2. **Type Safety & Build**: `npm run build` in `frontend/` succeeds without TypeScript or bundler errors.
3. **Trace Fidelity**: The final cell value in the trace matches the authoritative `result` object in the API response.
4. **Error Sanitization**: No raw server file paths, shell error codes, or unhandled exceptions are surfaced to the browser client.
5. **Portability**: A fresh git clone can build and launch from the documented README instructions without undocumented manual intervention.
