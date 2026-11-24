#include "fibonacci.hpp"

#include "errors.hpp"
#include "limits.hpp"
#include "trace.hpp"

#include <chrono>
#include <set>
#include <sstream>
#include <string>
#include <vector>

namespace {

std::string fib_label(long long n) {
    std::ostringstream out;
    out << "F(" << n << ")";
    return out.str();
}

Json complexity_for(const std::string& strategy) {
    Json complexity = Json::obj();
    if (strategy == "recursive") {
        complexity.set("time", Json::str("O(phi^n)"));
        complexity.set("space", Json::str("O(n)"));
    } else {
        complexity.set("time", Json::str("O(n)"));
        complexity.set("space", Json::str("O(n)"));
    }
    return complexity;
}

Json row_visualization(long long n, bool recursion) {
    Json labels = Json::arr();
    for (long long index = 0; index <= n; ++index) {
        labels.push(Json::str(fib_label(index)));
    }
    Json viz = Json::obj();
    viz.set("kind", Json::str(recursion ? "recursion" : "row"));
    viz.set("title", Json::str(recursion ? "Recursive calls" : "Fibonacci states"));
    viz.set("index_key", Json::str("n"));
    viz.set("offset", Json::integer(0));
    viz.set("labels", labels);
    viz.set("legend",
            Json::str(recursion
                          ? "Each cell shows the latest value returned for that F(n) and how many times the call was entered. Without memory, smaller states are solved again and again."
                          : "Cell n stores F(n). A highlighted dependency is a state the current step reads."));
    return viz;
}

Json finish_event(TraceBuilder& trace, long long n, long long value) {
    std::ostringstream explanation;
    explanation << "F(" << n << ") = " << value
                << ". The answer is the value stored for state n = " << n << ".";
    trace.add("finish", state_n(n), true, value, no_deps(), "", explanation.str(), fib_label(n), false);
    return Json::integer(value);
}

}  // namespace

Json run_fibonacci(const Json& input, const std::string& strategy, bool include_trace) {
    if (!input.has("n") || input.at("n").type != Json::INT) {
        throw SafeError("n must be an integer.");
    }
    long long n = input.at("n").i;
    if (n < 0) {
        throw SafeError("n must be an integer from 0 to 40.");
    }
    if (strategy != "recursive" && strategy != "memoization" && strategy != "tabulation") {
        throw SafeError("Fibonacci does not support that strategy.");
    }
    long long max_n = strategy == "recursive" ? kFibRecursiveMax : kFibMax;
    if (n > max_n) {
        std::ostringstream message;
        message << "n must be an integer from 0 to " << max_n << " for the " << strategy << " strategy.";
        throw SafeError(message.str());
    }

    TraceBuilder trace(include_trace);
    long long state_count = 0;
    std::set<long long> unique;
    long long result = 0;

    std::chrono::steady_clock::time_point started = std::chrono::steady_clock::now();

    if (strategy == "tabulation") {
        std::vector<long long> dp(static_cast<std::size_t>(n + 1), 0);
        dp[0] = 0;
        ++state_count;
        unique.insert(0);
        trace.add("initialize", state_n(0), true, 0, no_deps(), "F(0) = 0",
                  "Base case: F(0) = 0. There is no positive index left to split.", fib_label(0), true);
        if (n >= 1) {
            dp[1] = 1;
            ++state_count;
            unique.insert(1);
            trace.add("initialize", state_n(1), true, 1, no_deps(), "F(1) = 1",
                      "Base case: F(1) = 1. The recurrence starts at n = 2.", fib_label(1), true);
        }
        for (long long index = 2; index <= n; ++index) {
            long long left = dp[static_cast<std::size_t>(index - 1)];
            long long right = dp[static_cast<std::size_t>(index - 2)];
            dp[static_cast<std::size_t>(index)] = left + right;
            ++state_count;
            unique.insert(index);
            std::ostringstream operation;
            operation << "F(" << (index - 1) << ") + F(" << (index - 2) << ")";
            std::ostringstream explanation;
            explanation << "F(" << index << ") = F(" << (index - 1) << ") + F(" << (index - 2) << ") = "
                        << left << " + " << right << " = " << dp[static_cast<std::size_t>(index)] << ".";
            trace.add("update", state_n(index), true, dp[static_cast<std::size_t>(index)],
                      deps_two(state_n(index - 1), state_n(index - 2)), operation.str(), explanation.str(),
                      fib_label(index), true);
        }
        result = dp[static_cast<std::size_t>(n)];
        finish_event(trace, n, result);
    } else if (strategy == "memoization") {
        std::vector<long long> memo(static_cast<std::size_t>(n + 1), -1);
        struct Solver {
            std::vector<long long>& memo;
            TraceBuilder& trace;
            long long& state_count;
            std::set<long long>& unique;
            long long solve(long long k) {
                if (memo[static_cast<std::size_t>(k)] != -1) {
                    ++state_count;
                    std::ostringstream explanation;
                    explanation << fib_label(k) << " is already memoized as " << memo[static_cast<std::size_t>(k)]
                                << ", so this call returns without new work.";
                    trace.add("cache_hit", state_n(k), true, memo[static_cast<std::size_t>(k)], no_deps(),
                              "memo[n]", explanation.str(), fib_label(k), false);
                    return memo[static_cast<std::size_t>(k)];
                }
                ++state_count;
                unique.insert(k);
                if (k <= 1) {
                    memo[static_cast<std::size_t>(k)] = k;
                    std::ostringstream explanation;
                    explanation << "Base case: " << fib_label(k) << " = " << k << ". Store it before returning.";
                    trace.add("initialize", state_n(k), true, k, no_deps(), k == 0 ? "F(0) = 0" : "F(1) = 1",
                              explanation.str(), fib_label(k), true);
                    return k;
                }
                std::ostringstream entered;
                entered << "Enter " << fib_label(k) << ". It needs " << fib_label(k - 1) << " and "
                        << fib_label(k - 2) << " before it can be stored.";
                trace.add("enter", state_n(k), false, 0, no_deps(), "", entered.str(), fib_label(k), false);
                long long left = solve(k - 1);
                long long right = solve(k - 2);
                long long value = left + right;
                memo[static_cast<std::size_t>(k)] = value;
                std::ostringstream operation;
                operation << "F(" << (k - 1) << ") + F(" << (k - 2) << ")";
                std::ostringstream explanation;
                explanation << "Store " << fib_label(k) << " = " << left << " + " << right << " = " << value
                            << ". Later calls with n = " << k << " can reuse it.";
                trace.add("update", state_n(k), true, value, deps_two(state_n(k - 1), state_n(k - 2)),
                          operation.str(), explanation.str(), fib_label(k), true);
                std::ostringstream returned;
                returned << "Return " << value << " from " << fib_label(k) << ".";
                trace.add("return", state_n(k), true, value, no_deps(), "", returned.str(), fib_label(k), false);
                return value;
            }
        } solver{memo, trace, state_count, unique};
        result = solver.solve(n);
        finish_event(trace, n, result);
    } else {
        struct Solver {
            TraceBuilder& trace;
            long long& state_count;
            std::set<long long>& unique;
            long long solve(long long k) {
                ++state_count;
                unique.insert(k);
                std::ostringstream entered;
                entered << "Enter " << fib_label(k) << " with no memory of earlier calls.";
                trace.add("enter", state_n(k), false, 0, no_deps(), "", entered.str(), fib_label(k), false);
                if (k <= 1) {
                    std::ostringstream explanation;
                    explanation << "Base case: " << fib_label(k) << " = " << k
                                << ". This value is computed again every time the call is reached.";
                    trace.add("initialize", state_n(k), true, k, no_deps(), k == 0 ? "F(0) = 0" : "F(1) = 1",
                              explanation.str(), fib_label(k), true);
                    std::ostringstream returned;
                    returned << "Return " << k << " from " << fib_label(k) << ".";
                    trace.add("return", state_n(k), true, k, no_deps(), "", returned.str(), fib_label(k), false);
                    return k;
                }
                long long left = solve(k - 1);
                long long right = solve(k - 2);
                long long value = left + right;
                std::ostringstream operation;
                operation << "F(" << (k - 1) << ") + F(" << (k - 2) << ")";
                std::ostringstream explanation;
                explanation << fib_label(k) << " = " << left << " + " << right << " = " << value
                            << ". Nothing is saved, so another call with n = " << k << " will repeat this work.";
                trace.add("update", state_n(k), true, value, deps_two(state_n(k - 1), state_n(k - 2)),
                          operation.str(), explanation.str(), fib_label(k), true);
                std::ostringstream returned;
                returned << "Return " << value << " from " << fib_label(k) << ".";
                trace.add("return", state_n(k), true, value, no_deps(), "", returned.str(), fib_label(k), false);
                return value;
            }
        } solver{trace, state_count, unique};
        result = solver.solve(n);
        finish_event(trace, n, result);
    }

    std::chrono::steady_clock::time_point finished = std::chrono::steady_clock::now();
    double elapsed = std::chrono::duration<double, std::milli>(finished - started).count();

    Json response = Json::obj();
    response.set("status", Json::str("success"));
    Json result_json = Json::obj();
    result_json.set("value", Json::integer(result));
    response.set("result", result_json);
    response.set("complexity", complexity_for(strategy));
    Json metrics = Json::obj();
    metrics.set("state_count", Json::integer(state_count));
    metrics.set("unique_states", Json::integer(static_cast<long long>(unique.size())));
    metrics.set("elapsed_ms", Json::floating(elapsed));
    response.set("metrics", metrics);
    response.set("visualization", row_visualization(n, strategy == "recursive"));
    if (include_trace) {
        response.set("trace", trace.events);
    }
    return response;
}
