from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def replay_cells(trace: list[dict]) -> dict[str, int]:
    cells: dict[str, int] = {}
    for index, event in enumerate(trace):
        assert event["step"] == index
        if event["writes"] and isinstance(event["value"], int):
            cells[_state_key(event["state"])] = event["value"]
        if event["kind"] == "update":
            for dependency in event["dependencies"]:
                assert _state_key(dependency) in cells
    return cells


def _state_key(state: dict) -> str:
    return ",".join(f"{key}={state[key]}" for key in sorted(state))


def knapsack_reference(weights: list[int], values: list[int], capacity: int) -> int:
    best = 0
    total = len(weights)
    for mask in range(1 << total):
        weight = 0
        value = 0
        for index in range(total):
            if mask & (1 << index):
                weight += weights[index]
                value += values[index]
        if weight <= capacity:
            best = max(best, value)
    return best


def assert_selection(body: dict, weights: list[int], values: list[int], capacity: int) -> None:
    result = body["result"]
    indices = result["selected_item_indices"]
    assert indices == sorted(indices)
    assert len(set(indices)) == len(indices)
    total_weight = sum(weights[index] for index in indices)
    total_value = sum(values[index] for index in indices)
    assert total_weight <= capacity
    assert total_value == result["max_value"]
    assert total_value == knapsack_reference(weights, values, capacity)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["worker_ready"] is True
    assert "dp_worker" not in response.text


def test_algorithm_list_and_detail() -> None:
    response = client.get("/api/v1/algorithms")
    assert response.status_code == 200
    ids = [item["id"] for item in response.json()]
    assert ids == ["fibonacci", "climbing_stairs", "knapsack_01"]
    detail = client.get("/api/v1/algorithms/knapsack_01")
    assert detail.status_code == 200
    assert "dp[i][w]" in detail.json()["state_definition"]
    missing = client.get("/api/v1/algorithms/lcs")
    assert missing.status_code == 404


def test_fibonacci_tabulation_trace() -> None:
    response = client.post(
        "/api/v1/run",
        json={"algorithm_id": "fibonacci", "strategy": "tabulation", "input": {"n": 10}, "include_trace": True},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["result"]["value"] == 55
    assert body["metrics"]["state_count"] == 11
    assert body["complexity"]["time"] == "O(n)"
    cells = replay_cells(body["trace"])
    assert cells["n=10"] == 55
    assert body["run_id"].startswith("run_")


def test_fibonacci_strategies_agree_and_recursion_does_more_work() -> None:
    counts = {}
    for strategy in ("recursive", "memoization", "tabulation"):
        response = client.post(
            "/api/v1/run",
            json={
                "algorithm_id": "fibonacci",
                "strategy": strategy,
                "input": {"n": 10},
                "include_trace": strategy != "recursive",
            },
        )
        assert response.status_code == 200
        body = response.json()
        assert body["result"]["value"] == 55
        counts[strategy] = body["metrics"]["state_count"]
    assert counts["recursive"] > counts["memoization"]
    assert counts["tabulation"] == 11


def test_fibonacci_edges_and_validation() -> None:
    zero = client.post(
        "/api/v1/run",
        json={"algorithm_id": "fibonacci", "strategy": "memoization", "input": {"n": 0}},
    )
    assert zero.status_code == 200
    assert zero.json()["result"]["value"] == 0
    negative = client.post(
        "/api/v1/run",
        json={"algorithm_id": "fibonacci", "strategy": "tabulation", "input": {"n": -1}},
    )
    assert negative.status_code == 422
    assert "n must" in negative.json()["detail"]["message"]
    too_big = client.post(
        "/api/v1/run",
        json={"algorithm_id": "fibonacci", "strategy": "recursive", "input": {"n": 13}},
    )
    assert too_big.status_code == 422
    unknown = client.post(
        "/api/v1/run",
        json={"algorithm_id": "edit_distance", "strategy": "tabulation", "input": {"n": 3}},
    )
    assert unknown.status_code == 404


def test_climbing_stairs() -> None:
    response = client.post(
        "/api/v1/run",
        json={"algorithm_id": "climbing_stairs", "strategy": "tabulation", "input": {"n": 5}, "include_trace": True},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["result"]["ways"] == 8
    cells = replay_cells(body["trace"])
    assert cells["n=5"] == 8
    one = client.post(
        "/api/v1/run",
        json={"algorithm_id": "climbing_stairs", "strategy": "recursive", "input": {"n": 1}},
    )
    assert one.json()["result"]["ways"] == 1
    invalid = client.post(
        "/api/v1/run",
        json={"algorithm_id": "climbing_stairs", "strategy": "tabulation", "input": {"n": 0}},
    )
    assert invalid.status_code == 422
    capped = client.post(
        "/api/v1/run",
        json={"algorithm_id": "climbing_stairs", "strategy": "tabulation", "input": {"n": 31}},
    )
    assert capped.status_code == 422


def test_knapsack_examples() -> None:
    weights = [1, 3, 4, 5]
    values = [1, 4, 5, 7]
    response = client.post(
        "/api/v1/run",
        json={
            "algorithm_id": "knapsack_01",
            "strategy": "tabulation",
            "input": {"weights": weights, "values": values, "capacity": 7},
            "include_trace": True,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["result"]["max_value"] == 9
    assert body["result"]["selected_item_indices"] == [1, 2]
    assert body["complexity"] == {"time": "O(n * capacity)", "space": "O(n * capacity)"}
    cells = replay_cells(body["trace"])
    assert cells["capacity=7,i=4"] == 9

    memo = client.post(
        "/api/v1/run",
        json={
            "algorithm_id": "knapsack_01",
            "strategy": "memoization",
            "input": {"weights": weights, "values": values, "capacity": 7},
            "include_trace": True,
        },
    )
    assert memo.status_code == 200
    assert_selection(memo.json(), weights, values, 7)
    replay_cells(memo.json()["trace"])


def test_knapsack_boundaries() -> None:
    cases = [
        ({"weights": [5], "values": [9], "capacity": 3}, 0),
        ({"weights": [], "values": [], "capacity": 4}, 0),
        ({"weights": [1, 2], "values": [3, 4], "capacity": 0}, 0),
        ({"weights": [4], "values": [6], "capacity": 5}, 6),
        ({"weights": [2, 2], "values": [3, 4], "capacity": 2}, 4),
    ]
    for raw, expected in cases:
        for strategy in ("tabulation", "memoization"):
            response = client.post(
                "/api/v1/run",
                json={"algorithm_id": "knapsack_01", "strategy": strategy, "input": raw, "include_trace": False},
            )
            assert response.status_code == 200
            body = response.json()
            assert "trace" not in body
            assert_selection(body, raw["weights"], raw["values"], raw["capacity"])
            assert body["result"]["max_value"] == expected


def test_knapsack_rejects_bad_input() -> None:
    mismatch = client.post(
        "/api/v1/run",
        json={
            "algorithm_id": "knapsack_01",
            "strategy": "tabulation",
            "input": {"weights": [1, 2], "values": [3], "capacity": 2},
        },
    )
    assert mismatch.status_code == 422
    assert mismatch.json()["error"]["code"] == "INPUT_VALIDATION_ERROR"
    zero_weight = client.post(
        "/api/v1/run",
        json={
            "algorithm_id": "knapsack_01",
            "strategy": "tabulation",
            "input": {"weights": [0], "values": [3], "capacity": 2},
        },
    )
    assert zero_weight.status_code == 422
    recursive = client.post(
        "/api/v1/run",
        json={
            "algorithm_id": "knapsack_01",
            "strategy": "recursive",
            "input": {"weights": [1], "values": [1], "capacity": 1},
        },
    )
    assert recursive.status_code == 422
    malformed = client.post("/api/v1/run", content=b"{", headers={"content-type": "application/json"})
    assert malformed.status_code == 422
    assert malformed.json()["error"]["code"] == "SCHEMA_VALIDATION_ERROR"
