#pragma once

#include <stdexcept>
#include <string>

// User-facing failure. The message is safe to return from the API.
struct SafeError : std::runtime_error {
    explicit SafeError(const std::string& message) : std::runtime_error(message) {}
};
