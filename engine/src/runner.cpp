#include "runner.hpp"

#include "climbing_stairs.hpp"
#include "errors.hpp"
#include "fibonacci.hpp"
#include "knapsack.hpp"

Json run_request(const Json& request) {
    if (request.type != Json::OBJ) {
        throw SafeError("The request must be a JSON object.");
    }
    if (!request.has("algorithm_id") || request.at("algorithm_id").type != Json::STR) {
        throw SafeError("algorithm_id is required.");
    }
    if (!request.has("strategy") || request.at("strategy").type != Json::STR) {
        throw SafeError("strategy is required.");
    }
    if (!request.has("input") || request.at("input").type != Json::OBJ) {
        throw SafeError("input must be an object.");
    }
    bool include_trace = true;
    if (request.has("include_trace")) {
        if (request.at("include_trace").type != Json::BOOL) {
            throw SafeError("include_trace must be true or false.");
        }
        include_trace = request.at("include_trace").b;
    }

    const std::string algorithm_id = request.at("algorithm_id").s;
    const std::string strategy = request.at("strategy").s;
    const Json& input = request.at("input");

    Json response;
    if (algorithm_id == "fibonacci") {
        response = run_fibonacci(input, strategy, include_trace);
    } else if (algorithm_id == "climbing_stairs") {
        response = run_climbing_stairs(input, strategy, include_trace);
    } else if (algorithm_id == "knapsack_01") {
        response = run_knapsack(input, strategy, include_trace);
    } else {
        throw SafeError("Unknown algorithm.");
    }
    response.set("algorithm_id", Json::str(algorithm_id));
    response.set("strategy", Json::str(strategy));
    return response;
}
