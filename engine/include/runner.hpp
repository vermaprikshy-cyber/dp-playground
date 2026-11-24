#pragma once

#include "json_mini.hpp"

// Runs one algorithm request. Throws SafeError for invalid input.
Json run_request(const Json& request);
