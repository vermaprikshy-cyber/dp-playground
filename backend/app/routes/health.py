from fastapi import APIRouter

from app.schemas.models import HealthResponse
from app.services.worker import worker_ready

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", worker_ready=worker_ready())
