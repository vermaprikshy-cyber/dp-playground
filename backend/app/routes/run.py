from fastapi import APIRouter, HTTPException

from app.errors import AppError
from app.schemas.models import RunRequest
from app.services.worker import execute

router = APIRouter()


@router.post("/run")
def run(body: RunRequest) -> dict:
    try:
        return execute(body.model_dump())
    except AppError as error:
        detail: dict[str, str] = {"message": str(error)}
        if error.field:
            detail["field"] = error.field
        raise HTTPException(status_code=error.status_code, detail=detail) from error
