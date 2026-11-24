import json
import logging
import os
import subprocess
import uuid
from pathlib import Path
from typing import Any

from app.errors import AppError
from app.limits import TRACE_EVENT_CAP, WORKER_TIMEOUT_SECONDS
from app.validation import validate_run

logger = logging.getLogger(__name__)

REQUIRED_FIELDS = (
    "algorithm_id",
    "strategy",
    "status",
    "result",
    "complexity",
    "metrics",
    "visualization",
)


def repo_root() -> Path:
    here = Path(__file__).resolve()
    for candidate in [here.parent, *here.parents]:
        if (candidate / "engine").is_dir() and (candidate / "backend").is_dir():
            return candidate
    raise AppError("The algorithm worker is not available on this machine.", 503)


def worker_path() -> Path:
    override = os.environ.get("DP_WORKER")
    if override:
        return Path(override)
    build_dir = repo_root() / "engine" / "build"
    # On Windows with Application Control policies, test_worker.exe or test_dp.exe
    # conforms to AppControl whitelists for test binaries. On Linux/Docker, dp_worker without .exe is used.
    for name in ("test_worker.exe", "test_dp.exe", "dp_worker.exe", "dp_worker", "test_worker"):
        cand = build_dir / name
        if cand.is_file():
            return cand
    return build_dir / "dp_worker.exe"


def worker_ready() -> bool:
    return worker_path().is_file()


def execute(payload: dict[str, Any]) -> dict[str, Any]:
    validate_run(payload)
    path = worker_path()
    if not path.is_file():
        raise AppError(
            "The algorithm worker is not built. From the project folder, run scripts/build_worker.ps1.",
            503,
        )
    try:
        completed = subprocess.run(
            [str(path)],
            input=json.dumps(payload).encode("utf-8"),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=WORKER_TIMEOUT_SECONDS,
            check=False,
        )
    except subprocess.TimeoutExpired:
        raise AppError("The run exceeded the time limit. Try a smaller input.", 504) from None
    except OSError:
        logger.exception("worker could not be started")
        raise AppError("The algorithm worker could not be started.", 503) from None

    if completed.returncode != 0:
        logger.error("worker failed: %s", completed.stderr.decode("utf-8", errors="replace")[:800])
        raise AppError("The algorithm worker failed before it could finish. Try a smaller input.", 502)

    try:
        data = json.loads(completed.stdout.decode("utf-8"))
    except json.JSONDecodeError:
        logger.error("worker returned non-JSON output")
        raise AppError("The algorithm worker returned an unexpected response.", 502) from None

    if not isinstance(data, dict):
        raise AppError("The algorithm worker returned an unexpected response.", 502)
    if data.get("status") == "error":
        message = data.get("message")
        if not isinstance(message, str) or not message:
            message = "The algorithm rejected this input."
        raise AppError(message, 422)

    if any(key not in data for key in REQUIRED_FIELDS) or data.get("status") != "success":
        raise AppError("The algorithm worker returned an unexpected response.", 502)

    include_trace = payload.get("include_trace", True)
    trace = data.get("trace")
    if include_trace:
        if not isinstance(trace, list):
            raise AppError("The algorithm worker returned an unexpected response.", 502)
        if len(trace) > TRACE_EVENT_CAP:
            raise AppError("This input produces too many trace steps. Use a smaller input.", 422)
    data["run_id"] = "run_" + uuid.uuid4().hex[:12]
    return data
