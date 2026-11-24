from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class RunRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    algorithm_id: str
    strategy: str
    input: dict[str, Any]
    include_trace: bool = True


class HealthResponse(BaseModel):
    status: str
    worker_ready: bool


class ErrorBody(BaseModel):
    message: str
    field: str | None = None


class ErrorDetail(BaseModel):
    code: str
    message: str
    field: str | None = None
    details: dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    error: ErrorDetail


class RunAccepted(BaseModel):
    """Documented shape. The route returns the worker payload plus run_id."""

    run_id: str = Field(examples=["run_local"])
    algorithm_id: str
    strategy: str
    status: str
    result: dict[str, Any]
    complexity: dict[str, str]
    metrics: dict[str, float | int]
