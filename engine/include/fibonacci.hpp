#pragma once

#include "json_mini.hpp"

#include <string>

Json run_fibonacci(const Json& input, const std::string& strategy, bool include_trace);
