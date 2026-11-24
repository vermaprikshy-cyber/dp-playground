# Dynamic Programming Playground

> An interactive DSA learning web application that makes Dynamic Programming visible, testable, and explainable.

[![C++ Engine Tests](https://img.shields.io/badge/engine-passing-teal.svg)](#testing)
[![API Tests](https://img.shields.io/badge/pytest-9%20passed-blue.svg)](#testing)
[![Frontend Tests](https://img.shields.io/badge/vitest-18%20passed-green.svg)](#testing)
[![Version](https://img.shields.io/badge/version-2.0.0--blueprint-navy.svg)](#)

---

## 🌟 Core Product Promise

Users should not only see the final numerical answer; they should understand **which states were computed**, **which transitions produced them**, and **why the chosen answer is optimal**.

Dynamic Programming Playground replaces static formulas and magical tables with an interactive, deterministic step-by-step trace replayer.

---

## 🏗 System Architecture & Request Lifecycle

The application is built on a high-integrity, 3-tier decoupled architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                   React + TypeScript + Vite                 │
│  - Catalogue, Problem Workspace, Trace Player, Practice     │
│  - Immutable Table State Reducer & Dependency Visualizer    │
│  - Version 2.0 Design Tokens & Accessible State Badges      │
└──────────────────────────────▲──────────────────────────────┘
                               │ JSON over HTTP (REST API)
┌──────────────────────────────▼──────────────────────────────┐
│                    Python FastAPI Gateway                   │
│  - Pydantic Schema Validation & Range Limits                │
│  - Safe Subprocess Orchestration & Execution Timeouts       │
│  - Standard Error Contract: { error: { code, message } }    │
└──────────────────────────────▲──────────────────────────────┘
                               │ JSON over stdin / stdout
┌──────────────────────────────▼──────────────────────────────┐
│                  C++14 Algorithm Engine                     │
│  - Authoritative implementations of DP algorithms           │
│  - Emits ordered state updates & dependency graph events    │
│  - Memory bounded, deterministic, and Windows-whitelisted   │
└─────────────────────────────────────────────────────────────┘
```

### Request Lifecycle
1. User chooses an algorithm, strategy, and inputs in the React Workspace.
2. Client performs instant validation (bounds, matching arrays, safe ranges).
3. React posts JSON payload to `/api/v1/run`.
4. FastAPI validates Pydantic schemas, applies caps, and invokes the C++ worker with a strict timeout (`3.0s`).
5. C++ worker executes the algorithm and prints structured JSON with the final result, metrics, and ordered trace events to stdout.
6. FastAPI verifies worker output structure and returns normalized JSON.
7. React reducer (`deriveTableState`) deterministically plays back state transitions.

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.10+) with `pip`
- **MinGW / g++** (supporting C++14/C++17) or pre-built worker

### 1. Build the C++ Algorithm Worker
From the repository root (`dp-playground`):
```powershell
powershell -ExecutionPolicy Bypass -File scripts\build_worker.ps1
```
This compiles the C++ worker into `engine/build/dp_worker.exe` and `engine/build/test_worker.exe` and runs the engine unit tests.

### 2. Start the FastAPI Backend
Open a PowerShell terminal:
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```
*Health endpoint: `http://127.0.0.1:8000/health`*

### 3. Start the React Frontend
Open a second PowerShell terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 One-Command Automated Testing

You can execute all test suites (C++ Engine, Python FastAPI backend, and React frontend) from any directory using the master test runner:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\run_all_tests.ps1
```

Or run each suite individually:
```powershell
# 1. C++ Engine Unit Tests
.\engine\build\test_engine.exe

# 2. FastAPI Backend API Tests
cd backend; python -m pytest; cd ..

# 3. React Frontend Tests
cd frontend; npm run test; cd ..
```

---

## 📚 Algorithms Supported in MVP

| Algorithm | Category | Strategies | State Definition | Time Complexity | Space Complexity |
|---|---|---|---|---|---|
| **Fibonacci** | Linear DP | Tabulation, Memoization, Naive | `F(n)` | $O(n)$ | $O(n)$ |
| **Climbing Stairs** | Linear DP | Tabulation, Memoization, Naive | `ways(n)` | $O(n)$ | $O(n)$ |
| **0/1 Knapsack** | 2D Optimization | Tabulation, Memoization | `dp[i][w]` | $O(n \cdot W)$ | $O(n \cdot W)$ |

---

## 📡 API Endpoints & Error Contract

### 1. Health Check
```bash
curl http://127.0.0.1:8000/health
```
```json
{
  "status": "ok",
  "worker_ready": true
}
```

### 2. Run Algorithm & Return Trace
```bash
curl -X POST http://127.0.0.1:8000/api/v1/run \
  -H "Content-Type: application/json" \
  -d '{"algorithm_id":"knapsack_01","strategy":"tabulation","input":{"weights":[1,3,4,5],"values":[1,4,5,7],"capacity":7},"include_trace":true}'
```

### 3. Error Contract (v2.0 Standard)
```json
{
  "error": {
    "code": "INPUT_VALIDATION_ERROR",
    "message": "Weights and values must have the same length.",
    "field": "input.values",
    "details": {}
  }
}
```

---

## ⏱ 5-Minute Classroom Demo Script

1. **0:00 – 0:30 (Problem Statement):** Explain why DP is hard: static recurrence formulas don't show computation order or decision rules.
2. **0:30 – 1:30 (Linear DP Comparison):** Select Fibonacci $F(10)$. Run Tabulation ($11$ states), then compare against Naive Recursion ($177$ states).
3. **1:30 – 3:00 (2D Table & Decisions):** Select 0/1 Knapsack with capacity 7. Step through cell `dp[3][5]`, highlighting dependency cells `dp[2][5]` and `dp[2][1]`.
4. **3:00 – 4:00 (Complexity vs Measurements):** Contrast asymptotic $O(n \cdot W)$ against CPU runtime in milliseconds.
5. **4:00 – 5:00 (Architecture & Tests):** Showcase test coverage across C++, Python, and React suites.

---

## 🎓 Viva & Exam Q&A Preparation

- **Q: What is a DP state for Knapsack?**  
  *A:* $dp[i][w]$ represents the maximum value obtainable using a subset of the first $i$ items within a maximum remaining capacity $w$.
- **Q: Why does memoization avoid redundant subproblems?**  
  *A:* It intercepts recursive calls and checks if the state key exists in the cache table. If present, it returns in $O(1)$ without re-evaluating sub-trees.
- **Q: Why separate time complexity from measured runtime?**  
  *A:* Big-O is an invariant asymptotic growth model. Measured runtime is affected by CPU clock cycles, process scheduling, memory bus latency, and cache hits.
- **Q: How does the UI guarantee accuracy?**  
  *A:* The frontend computes no DP logic independently. It acts strictly as a deterministic playback player for the authoritative trace emitted by the C++ engine.

---

## 📖 Detailed Documentation

- [Architecture Design & Separation of Concerns](docs/architecture.md)
- [Testing Strategy & Quality Gates](docs/testing-plan.md)
- [Algorithm Notes & Recurrences](docs/algorithm-notes.md)
- [API Contract & Trace Event Schema](docs/api-contract.md)
