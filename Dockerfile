FROM python:3.12-slim

# Install system build dependencies: g++, make, cmake
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy source code
COPY backend /app/backend
COPY engine /app/engine

# Build C++ worker with CMake
RUN cmake -S /app/engine -B /app/engine/build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build /app/engine/build --config Release \
    && chmod +x /app/engine/build/dp_worker

# Environment variables
ENV PYTHONPATH=/app/backend
ENV DP_WORKER=/app/engine/build/dp_worker

# Expose port (Render sets $PORT, defaults to 10000)
EXPOSE 10000

# Start command
CMD ["sh", "-c", "uvicorn app.main:app --app-dir /app/backend --host 0.0.0.0 --port ${PORT:-10000}"]
