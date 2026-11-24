from app.catalog import get_algorithm
from app.errors import AppError, require_int, require_int_list
from app.limits import (
    FIB_MAX,
    FIB_RECURSIVE_MAX,
    KNAPSACK_MAX_CAPACITY,
    KNAPSACK_MAX_ITEMS,
    KNAPSACK_MAX_VALUE,
    KNAPSACK_MAX_WEIGHT,
    STAIRS_MAX,
    STAIRS_MIN,
    STAIRS_RECURSIVE_MAX,
)


def validate_run(payload: dict) -> None:
    algorithm = get_algorithm(str(payload.get("algorithm_id", "")))
    if algorithm is None:
        raise AppError("Unknown algorithm.", 404, "algorithm_id")
    strategy = payload.get("strategy")
    if strategy not in algorithm["strategies"]:
        raise AppError(
            f"{algorithm['name']} does not support that strategy.",
            422,
            "strategy",
        )
    raw_input = payload.get("input")
    if not isinstance(raw_input, dict):
        raise AppError("input must be an object.", 422, "input")
    if algorithm["id"] == "fibonacci":
        _validate_n(raw_input, strategy, 0, FIB_MAX, FIB_RECURSIVE_MAX, "Fibonacci")
    elif algorithm["id"] == "climbing_stairs":
        _validate_n(raw_input, strategy, STAIRS_MIN, STAIRS_MAX, STAIRS_RECURSIVE_MAX, "Climbing Stairs")
    elif algorithm["id"] == "knapsack_01":
        _validate_knapsack(raw_input)
    else:
        raise AppError("Unknown algorithm.", 404, "algorithm_id")


def _validate_n(
    raw_input: dict,
    strategy: str,
    minimum: int,
    maximum: int,
    recursive_max: int,
    name: str,
) -> None:
    limit = recursive_max if strategy == "recursive" else maximum
    number = require_int(raw_input.get("n"), "n", "n must be an integer.")
    if number < minimum or number > limit:
        reason = ""
        if strategy == "recursive":
            reason = " Recursive mode is capped because the call tree grows exponentially."
        raise AppError(
            f"n must be an integer from {minimum} to {limit} for the {strategy} strategy.{reason}",
            422,
            "n",
        )


def _validate_knapsack(raw_input: dict) -> None:
    weights = require_int_list(
        raw_input.get("weights"),
        "weights",
        "weights must be a list of positive integers.",
    )
    values = require_int_list(
        raw_input.get("values"),
        "values",
        "values must be a list of integers from 0 upward.",
    )
    if len(weights) != len(values):
        raise AppError("weights and values must have the same length.", 422, "values")
    if len(weights) > KNAPSACK_MAX_ITEMS:
        raise AppError(
            "Use at most 10 items. The limit keeps the DP table small enough to replay in the browser.",
            422,
            "weights",
        )
    capacity = require_int(raw_input.get("capacity"), "capacity", "capacity must be an integer.")
    if capacity < 0 or capacity > KNAPSACK_MAX_CAPACITY:
        raise AppError(
            "capacity must be an integer from 0 to 30. A larger table would make the trace too long to replay.",
            422,
            "capacity",
        )
    for weight in weights:
        if weight < 1 or weight > KNAPSACK_MAX_WEIGHT:
            raise AppError("Each weight must be a positive integer up to 1000.", 422, "weights")
    for value in values:
        if value < 0 or value > KNAPSACK_MAX_VALUE:
            raise AppError("Each value must be an integer from 0 to 10000.", 422, "values")
