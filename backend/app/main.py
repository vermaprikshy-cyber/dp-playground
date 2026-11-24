import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.limits import MAX_BODY_BYTES
from app.routes.algorithms import router as algorithms_router
from app.routes.health import router as health_router
from app.routes.run import router as run_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Dynamic Programming Playground",
    version="1.0.0",
    summary="Run Fibonacci, Climbing Stairs, and 0/1 Knapsack and return an ordered trace.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept"],
)


@app.middleware("http")
async def limit_request_body(request: Request, call_next):
    raw_length = request.headers.get("content-length")
    if raw_length:
        try:
            size = int(raw_length)
        except ValueError:
            size = MAX_BODY_BYTES + 1
        if size > MAX_BODY_BYTES:
            return JSONResponse(
                status_code=413,
                content={
                    "detail": {"message": "The request is too large."},
                    "error": {
                        "code": "PAYLOAD_TOO_LARGE",
                        "message": "The request is too large.",
                        "field": None,
                        "details": {},
                    },
                },
            )
    return await call_next(request)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, _exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "detail": {"message": "The request body does not match the expected fields."},
            "error": {
                "code": "SCHEMA_VALIDATION_ERROR",
                "message": "The request body does not match the expected fields.",
                "field": None,
                "details": {},
            },
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail
    message = detail.get("message", str(detail)) if isinstance(detail, dict) else str(detail)
    field = detail.get("field") if isinstance(detail, dict) else None
    code = (
        "NOT_FOUND"
        if exc.status_code == 404
        else (
            "INPUT_VALIDATION_ERROR"
            if exc.status_code == 422
            else (
                "TIMEOUT_ERROR"
                if exc.status_code == 504
                else ("SERVICE_UNAVAILABLE" if exc.status_code == 503 else "HTTP_ERROR")
            )
        )
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": detail if isinstance(detail, dict) else {"message": message},
            "error": {
                "code": code,
                "message": message,
                "field": field,
                "details": {},
            },
        },
    )


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "Dynamic Programming Playground API",
        "health": "/health",
        "algorithms": "/api/v1/algorithms",
    }


app.include_router(health_router)
app.include_router(algorithms_router, prefix="/api/v1")
app.include_router(run_router, prefix="/api/v1")
