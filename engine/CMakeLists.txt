cmake_minimum_required(VERSION 3.14)
project(dp_engine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

# Core library sources
set(ENGINE_SOURCES
    src/runner.cpp
    src/fibonacci.cpp
    src/climbing_stairs.cpp
    src/knapsack.cpp
)

# CLI Worker Executable
add_executable(dp_worker
    src/main.cpp
    ${ENGINE_SOURCES}
)

# Test Executable
add_executable(test_engine
    tests/test_main.cpp
    ${ENGINE_SOURCES}
)
