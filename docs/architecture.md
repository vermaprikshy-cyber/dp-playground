# Architecture Design & Separation of Concerns

## 1. Architectural Philosophy

Dynamic Programming Playground separates concerns across three autonomous tiers:

```
Client (Browser)                 Application Gateway                Core DSA Engine
+-------------------------+     +------------------------+         +----------------------+
| React + TypeScript UI   |     | Python FastAPI         |         | C++14 Binary Worker  |
| - Trace Player Reducer  | <-> | - Request Validation   | <-----> | - State transitions  |
| - DP Table & SVG Links  |     | - Process Timeout & Cap| (stdio) | - Base cases & logic |
| - Complexity & Practice |     | - Error Sanitization   |         | - Event stream dump  |
+-------------------------+     +------------------------+         +----------------------+
```

### Key Principles
1. **Authoritative Execution in C++**: The frontend never recomputes or approximates the dynamic programming solution. All values, decision branches, and dependency linkages originate from the C++ algorithm engine.
2. **Deterministic Trace Playback**: The frontend stores the returned trace event list as an immutable sequence. The UI state at step $k$ is derived through a pure reducer function:
   $$\text{visibleState} = \text{deriveTableState}(\text{trace}[0 \dots k])$$
3. **Defense in Depth**:
   - Pydantic models validate input types, array lengths, and positive bounds.
   - Child subprocesses run under strict execution timeouts (`WORKER_TIMEOUT_SECONDS = 3.0`).
   - Maximum trace event counts (`TRACE_EVENT_CAP = 5000`) and payload size limits (`MAX_BODY_BYTES = 100,000`) prevent denial-of-service and browser DOM exhaustion.

---

## 2. Component Directory Structure

```
dp-playground/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI initialization and CORS setup
│   │   ├── catalog.py           # Algorithm catalog and metadata registry
│   │   ├── limits.py            # Safety constraints and timeouts
│   │   ├── errors.py            # Learner-facing application errors
│   │   ├── validation.py        # Algorithmic input validation
│   │   ├── routes/              # Health, algorithms, and execution routes
│   │   ├── schemas/             # Pydantic request and response schemas
│   │   └── services/worker.py   # Subprocess invocation and stdout parsing
│   └── tests/test_api.py        # Integration test suite
├── engine/
│   ├── include/                 # Header declarations (json, trace, algorithms)
│   ├── src/                     # C++ implementations (fibonacci, stairs, knapsack)
│   └── tests/test_main.cpp      # Standalone C++ verification suite
├── frontend/
│   ├── src/
│   │   ├── components/          # DPTable, TraceControls, InputForm, panels
│   │   ├── features/            # Trace reducer and selectors
│   │   ├── lib/                 # API client and client-side validators
│   │   ├── pages/               # Home, Catalogue, Workspace, LearnDP, About
│   │   └── test/                # Vitest unit and component tests
│   └── vite.config.ts           # Vite proxy and configuration
└── docs/                        # Specifications, notes, and API contract
```

---

## 3. Trace Event Architecture

Rather than shipping massive table snapshots for every iteration, the engine emits compact delta events:
- `step`: Zero-based sequential step index.
- `kind`: Phase category (`initialize`, `evaluate`, `update`, `choose`, `finish`).
- `state`: Dimensional coordinate map (e.g. `{"i": 2, "capacity": 5}`).
- `writes`: Boolean indicating whether this event assigns a value to the state cell.
- `value`: Computed numeric value.
- `dependencies`: List of coordinate objects for earlier states read during this transition.
- `operation`: Human-readable formula substitution string (e.g. `max(4, 3 + 4)`).
- `explanation`: Pedagogical sentence explaining why this branch was chosen.

---

## 4. Security Safeguards

- **No Arbitrary Code Execution**: The backend accepts only numeric configuration parameters for known algorithm IDs.
- **Process Isolation**: The worker binary is invoked directly via `subprocess.run` with a predefined argument vector, completely avoiding shell evaluation (`shell=False`).
- **No Leaked Stack Traces**: System errors, file path discrepancies, and runtime exceptions are sanitized into clear user-facing messages.
