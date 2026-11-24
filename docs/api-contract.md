# Dynamic Programming Playground API Contract

## Specification Version 1.0.0

All endpoints return JSON responses with standard HTTP status codes.

---

## Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service and worker readiness health check |
| `GET` | `/api/v1/algorithms` | List all supported algorithm specifications |
| `GET` | `/api/v1/algorithms/{id}` | Retrieve detailed metadata for a specific algorithm |
| `POST` | `/api/v1/run` | Execute an algorithm and return result + trace |

---

## 1. `GET /health`

### Response `200 OK`
```json
{
  "status": "ok",
  "worker_ready": true
}
```

---

## 2. `GET /api/v1/algorithms`

### Response `200 OK`
Returns an array of algorithm summaries:
```json
[
  {
    "id": "fibonacci",
    "name": "Fibonacci",
    "difficulty": "Beginner",
    "family": "Linear DP",
    "topics": ["1D DP", "Recurrence", "Memoization"],
    "strategies": ["recursive", "memoization", "tabulation"],
    "summary": "Compute F(n) and see which earlier states each step reads.",
    "complexity": {
      "tabulation": {"time": "O(n)", "space": "O(n)"}
    }
  }
]
```

---

## 3. `GET /api/v1/algorithms/{id}`

### Parameters
- `id`: Path string (`fibonacci`, `climbing_stairs`, or `knapsack_01`).

### Response `200 OK`
Returns full algorithm schema including recurrence, base cases, constraints, and presets.

### Response `404 Not Found`
```json
{
  "detail": {
    "message": "Algorithm 'unknown_id' not found."
  }
}
```

---

## 4. `POST /api/v1/run`

Executes the requested dynamic programming algorithm and returns the optimal solution along with the ordered execution trace.

### Request Body Schema
```json
{
  "algorithm_id": "knapsack_01",
  "strategy": "tabulation",
  "input": {
    "weights": [1, 3, 4, 5],
    "values": [1, 4, 5, 7],
    "capacity": 7
  },
  "include_trace": true
}
```

### Response `200 OK`
```json
{
  "run_id": "run_a1b2c3d4e5f6",
  "algorithm_id": "knapsack_01",
  "strategy": "tabulation",
  "status": "success",
  "result": {
    "max_value": 9,
    "selected_item_indices": [1, 2]
  },
  "complexity": {
    "time": "O(n * capacity)",
    "space": "O(n * capacity)"
  },
  "metrics": {
    "state_count": 40,
    "unique_states": 40,
    "elapsed_ms": 0.042
  },
  "visualization": {
    "kind": "grid",
    "title": "0/1 Knapsack DP Table (i x w)",
    "row_key": "i",
    "col_key": "w",
    "row_count": 5,
    "col_count": 8,
    "row_labels": ["0: empty", "1: wt=1, val=1", "2: wt=3, val=4", "3: wt=4, val=5", "4: wt=5, val=7"],
    "col_labels": ["w=0", "w=1", "w=2", "w=3", "w=4", "w=5", "w=6", "w=7"],
    "legend": "dp[i][w] is max value using first i items with capacity w."
  },
  "trace": [
    {
      "step": 0,
      "kind": "initialize",
      "state": {"i": 0, "w": 0},
      "writes": true,
      "value": 0,
      "dependencies": [],
      "operation": "dp[0][0] = 0",
      "explanation": "Base case: 0 items has total value 0.",
      "label": "dp[0][0]"
    },
    {
      "step": 15,
      "kind": "update",
      "state": {"i": 2, "w": 3},
      "writes": true,
      "value": 4,
      "dependencies": [{"i": 1, "w": 3}, {"i": 1, "w": 0}],
      "operation": "max(1, 4 + 0)",
      "explanation": "Item 2 (wt 3, val 4) fits: max(exclude: 1, include: 4 + 0) = 4.",
      "label": "dp[2][3]"
    }
  ]
}
```

---

## 5. Error Responses

- **`404 Not Found`**: Algorithm ID does not exist.
- **`413 Payload Too Large`**: Request body exceeds `100,000` bytes.
- **`422 Unprocessable Entity`**: Input validation failure (e.g. negative values, missing fields, or parameter bound violations).
- **`502 Bad Gateway`**: C++ worker subprocess crashed or returned non-conforming JSON.
- **`503 Service Unavailable`**: Algorithm worker binary missing or not yet compiled.
- **`504 Gateway Timeout`**: Execution exceeded the allowed CPU time limit (3.0 seconds).
