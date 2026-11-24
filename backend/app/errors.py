from typing import Any


class AppError(Exception):
    def __init__(self, message: str, status_code: int, field: str | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.field = field


def require_int(value: Any, field: str, message: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise AppError(message, 422, field)
    return value


def require_int_list(value: Any, field: str, message: str) -> list[int]:
    if not isinstance(value, list):
        raise AppError(message, 422, field)
    numbers: list[int] = []
    for item in value:
        if isinstance(item, bool) or not isinstance(item, int):
            raise AppError(message, 422, field)
        numbers.append(item)
    return numbers
