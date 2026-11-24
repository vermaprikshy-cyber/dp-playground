from fastapi import APIRouter, HTTPException

from app.catalog import get_algorithm, list_algorithms

router = APIRouter()


@router.get("/algorithms")
def algorithms() -> list[dict]:
    return list_algorithms()


@router.get("/algorithms/{algorithm_id}")
def algorithm_detail(algorithm_id: str) -> dict:
    algorithm = get_algorithm(algorithm_id)
    if algorithm is None:
        raise HTTPException(status_code=404, detail={"message": "Unknown algorithm.", "field": "algorithm_id"})
    return algorithm
