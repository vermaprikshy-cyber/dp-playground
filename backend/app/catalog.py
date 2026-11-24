from typing import Any

ALGORITHMS: list[dict[str, Any]] = [
    {
        "id": "fibonacci",
        "name": "Fibonacci",
        "difficulty": "Beginner",
        "family": "Linear DP",
        "topics": ["1D DP", "Recurrence", "Memoization"],
        "strategies": ["recursive", "memoization", "tabulation"],
        "summary": "Compute F(n) and see which earlier states each step reads.",
        "description": (
            "F(n) is the n-th Fibonacci number. The base cases are F(0) = 0 and F(1) = 1. "
            "Every later state adds the two states before it. Recursive calls repeat that work, "
            "memoization stores each state once, and tabulation fills the states from left to right."
        ),
        "state_definition": "F(n) is the n-th Fibonacci number.",
        "recurrence": "F(n) = F(n - 1) + F(n - 2)",
        "base_cases": ["F(0) = 0", "F(1) = 1"],
        "complexity": {
            "recursive": {"time": "O(phi^n)", "space": "O(n)"},
            "memoization": {"time": "O(n)", "space": "O(n)"},
            "tabulation": {"time": "O(n)", "space": "O(n)"},
        },
        "constraints": {
            "n": {
                "min": 0,
                "max": 40,
                "recursive_max": 12,
                "help": "n is an integer from 0 to 40. Recursive mode stops at 12 so the call tree stays readable.",
            }
        },
        "presets": [
            {"id": "classic", "name": "F(10)", "strategy": "tabulation", "input": {"n": 10}},
            {"id": "bases", "name": "Base cases", "strategy": "tabulation", "input": {"n": 1}},
            {"id": "memo", "name": "Memoized F(10)", "strategy": "memoization", "input": {"n": 10}},
            {"id": "tree", "name": "Call tree F(6)", "strategy": "recursive", "input": {"n": 6}},
        ],
    },
    {
        "id": "climbing_stairs",
        "name": "Climbing Stairs",
        "difficulty": "Beginner",
        "family": "Linear DP",
        "topics": ["1D DP", "Counting"],
        "strategies": ["recursive", "memoization", "tabulation"],
        "summary": "Count the ways to climb n stairs when each move takes 1 or 2 steps.",
        "description": (
            "Each climb ends in a 1-step or a 2-step, so ways(n) = ways(n - 1) + ways(n - 2). "
            "One stair has one climb. Two stairs have two climbs: 1+1 and 2. "
            "The same three strategies used for Fibonacci apply here."
        ),
        "state_definition": "ways(n) is the number of ordered ways to climb n stairs taking steps of 1 or 2.",
        "recurrence": "ways(n) = ways(n - 1) + ways(n - 2)",
        "base_cases": ["ways(1) = 1", "ways(2) = 2"],
        "complexity": {
            "recursive": {"time": "O(phi^n)", "space": "O(n)"},
            "memoization": {"time": "O(n)", "space": "O(n)"},
            "tabulation": {"time": "O(n)", "space": "O(n)"},
        },
        "constraints": {
            "n": {
                "min": 1,
                "max": 30,
                "recursive_max": 12,
                "help": "n is an integer from 1 to 30. Recursive mode stops at 12.",
            }
        },
        "presets": [
            {"id": "five", "name": "5 stairs", "strategy": "tabulation", "input": {"n": 5}},
            {"id": "one", "name": "1 stair", "strategy": "tabulation", "input": {"n": 1}},
            {"id": "two", "name": "2 stairs", "strategy": "memoization", "input": {"n": 2}},
            {"id": "tree", "name": "Call tree, 6 stairs", "strategy": "recursive", "input": {"n": 6}},
        ],
    },
    {
        "id": "knapsack_01",
        "name": "0/1 Knapsack",
        "difficulty": "Intermediate",
        "family": "Optimization",
        "topics": ["2D DP", "Include / exclude"],
        "strategies": ["memoization", "tabulation"],
        "summary": "Choose each item at most once to maximize value within a capacity.",
        "description": (
            "Each item may be taken once or not at all. In the table, dp[i][w] is the best value "
            "using only the first i items without exceeding capacity w. The transition compares "
            "excluding item i with including it when the weight fits. Memoization solves the same "
            "family of subproblems from the full capacity downward, and only fills states the original call needs."
        ),
        "state_definition": "dp[i][w] is the maximum value using the first i items within capacity w.",
        "recurrence": "dp[i][w] = max(dp[i - 1][w], value[i] + dp[i - 1][w - weight[i]]) when the item fits",
        "base_cases": ["dp[0][w] = 0", "dp[i][0] = 0"],
        "complexity": {
            "memoization": {"time": "O(n * capacity)", "space": "O(n * capacity)"},
            "tabulation": {"time": "O(n * capacity)", "space": "O(n * capacity)"},
        },
        "constraints": {
            "items": {"max": 10, "help": "At most 10 items."},
            "capacity": {"min": 0, "max": 30, "help": "Capacity is an integer from 0 to 30."},
            "weight": {"min": 1, "max": 1000},
            "value": {"min": 0, "max": 10000},
        },
        "presets": [
            {
                "id": "textbook",
                "name": "Textbook example",
                "strategy": "tabulation",
                "input": {"weights": [1, 3, 4, 5], "values": [1, 4, 5, 7], "capacity": 7},
            },
            {
                "id": "heavy",
                "name": "Nothing fits",
                "strategy": "tabulation",
                "input": {"weights": [5], "values": [9], "capacity": 3},
            },
            {
                "id": "zero",
                "name": "Zero capacity",
                "strategy": "tabulation",
                "input": {"weights": [1, 2], "values": [3, 4], "capacity": 0},
            },
            {
                "id": "single",
                "name": "One item",
                "strategy": "memoization",
                "input": {"weights": [4], "values": [6], "capacity": 5},
            },
            {
                "id": "duplicates",
                "name": "Duplicate weights",
                "strategy": "tabulation",
                "input": {"weights": [2, 2], "values": [3, 4], "capacity": 2},
            },
        ],
    },
]


def list_algorithms() -> list[dict[str, Any]]:
    return ALGORITHMS


def get_algorithm(algorithm_id: str) -> dict[str, Any] | None:
    for algorithm in ALGORITHMS:
        if algorithm["id"] == algorithm_id:
            return algorithm
    return None
