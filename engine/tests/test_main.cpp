#include "errors.hpp"
#include "json_mini.hpp"
#include "runner.hpp"

#include <iostream>
#include <string>

namespace {

int failures = 0;

void expect(bool condition, const std::string& message) {
    if (!condition) {
        std::cerr << "FAIL " << message << "\n";
        ++failures;
    }
}

void expect_error(const std::string& json, const std::string& message) {
    try {
        run_request(Json::parse(json));
        expect(false, message);
    } catch (const SafeError&) {
        expect(true, message);
    }
}

long long fib_ref(long long n) {
    if (n <= 1) {
        return n;
    }
    long long a = 0;
    long long b = 1;
    for (long long i = 2; i <= n; ++i) {
        long long next = a + b;
        a = b;
        b = next;
    }
    return b;
}

bool trace_dependencies_exist(const Json& trace) {
    Json seen = Json::obj();
    if (trace.type != Json::ARR) {
        return false;
    }
    for (std::size_t index = 0; index < trace.a.size(); ++index) {
        const Json& event = trace.a[index];
        if (event.at("step").i != static_cast<long long>(index)) {
            return false;
        }
        if (event.at("writes").b && event.at("value").type == Json::INT) {
            std::string key = event.at("state").dump();
            seen.set(key, event.at("value"));
        }
        if (event.at("kind").s == "update") {
            const Json& dependencies = event.at("dependencies");
            for (std::size_t dep = 0; dep < dependencies.a.size(); ++dep) {
                if (!seen.has(dependencies.a[dep].dump())) {
                    return false;
                }
            }
        }
    }
    return true;
}

}  // namespace

int main() {
    Json round = Json::parse("{\"a\":[1,true,null,\"x\\\"y\"],\"b\":-3}");
    expect(round.at("a").a[0].i == 1, "json int");
    expect(round.at("a").a[1].b, "json bool");
    expect(round.at("a").a[2].type == Json::NUL, "json null");
    expect(round.at("a").a[3].s == "x\"y", "json string");
    expect(round.at("b").i == -3, "json negative");
    Json again = Json::parse(round.dump());
    expect(again.at("b").i == -3, "json roundtrip");

    Json fib = run_request(Json::parse(
        "{\"algorithm_id\":\"fibonacci\",\"strategy\":\"tabulation\",\"input\":{\"n\":10},\"include_trace\":true}"));
    expect(fib.at("result").at("value").i == 55, "fib 10");
    expect(fib.at("metrics").at("state_count").i == 11, "fib state count");
    expect(trace_dependencies_exist(fib.at("trace")), "fib dependencies");

    Json fib_edges = run_request(Json::parse(
        "{\"algorithm_id\":\"fibonacci\",\"strategy\":\"memoization\",\"input\":{\"n\":0},\"include_trace\":true}"));
    expect(fib_edges.at("result").at("value").i == 0, "fib 0");

    Json fib_rec = run_request(Json::parse(
        "{\"algorithm_id\":\"fibonacci\",\"strategy\":\"recursive\",\"input\":{\"n\":10},\"include_trace\":false}"));
    expect(fib_rec.at("result").at("value").i == 55, "fib recursive value");
    expect(fib_rec.at("metrics").at("state_count").i > fib.at("metrics").at("state_count").i, "recursion does more work");
    expect(!fib_rec.has("trace"), "trace omitted");

    for (long long n = 0; n <= 12; ++n) {
        std::string body = std::string("{\"algorithm_id\":\"fibonacci\",\"strategy\":\"memoization\",\"input\":{\"n\":") +
                           std::to_string(n) + "},\"include_trace\":false}";
        Json result = run_request(Json::parse(body));
        expect(result.at("result").at("value").i == fib_ref(n), "fib memo " + std::to_string(n));
    }

    Json stairs = run_request(Json::parse(
        "{\"algorithm_id\":\"climbing_stairs\",\"strategy\":\"tabulation\",\"input\":{\"n\":5},\"include_trace\":true}"));
    expect(stairs.at("result").at("ways").i == 8, "stairs 5");
    expect(trace_dependencies_exist(stairs.at("trace")), "stairs dependencies");

    Json stairs_one = run_request(Json::parse(
        "{\"algorithm_id\":\"climbing_stairs\",\"strategy\":\"recursive\",\"input\":{\"n\":1},\"include_trace\":true}"));
    expect(stairs_one.at("result").at("ways").i == 1, "stairs 1");

    Json knapsack = run_request(Json::parse(
        "{\"algorithm_id\":\"knapsack_01\",\"strategy\":\"tabulation\",\"input\":{\"weights\":[1,3,4,5],\"values\":[1,4,5,7],\"capacity\":7},\"include_trace\":true}"));
    expect(knapsack.at("result").at("max_value").i == 9, "knapsack value");
    expect(knapsack.at("result").at("selected_item_indices").a.size() == 2, "knapsack count");
    expect(knapsack.at("result").at("selected_item_indices").a[0].i == 1, "knapsack first");
    expect(knapsack.at("result").at("selected_item_indices").a[1].i == 2, "knapsack second");
    expect(trace_dependencies_exist(knapsack.at("trace")), "knapsack dependencies");

    Json memo_knapsack = run_request(Json::parse(
        "{\"algorithm_id\":\"knapsack_01\",\"strategy\":\"memoization\",\"input\":{\"weights\":[1,3,4,5],\"values\":[1,4,5,7],\"capacity\":7},\"include_trace\":true}"));
    expect(memo_knapsack.at("result").at("max_value").i == 9, "memo knapsack value");
    expect(trace_dependencies_exist(memo_knapsack.at("trace")), "memo knapsack dependencies");

    Json heavy = run_request(Json::parse(
        "{\"algorithm_id\":\"knapsack_01\",\"strategy\":\"tabulation\",\"input\":{\"weights\":[5],\"values\":[9],\"capacity\":3},\"include_trace\":false}"));
    expect(heavy.at("result").at("max_value").i == 0, "too heavy");
    expect(heavy.at("result").at("selected_item_indices").a.empty(), "too heavy items");

    Json empty = run_request(Json::parse(
        "{\"algorithm_id\":\"knapsack_01\",\"strategy\":\"memoization\",\"input\":{\"weights\":[],\"values\":[],\"capacity\":4},\"include_trace\":true}"));
    expect(empty.at("result").at("max_value").i == 0, "empty knapsack");

    Json zero_cap = run_request(Json::parse(
        "{\"algorithm_id\":\"knapsack_01\",\"strategy\":\"tabulation\",\"input\":{\"weights\":[1,2],\"values\":[3,4],\"capacity\":0},\"include_trace\":true}"));
    expect(zero_cap.at("result").at("max_value").i == 0, "zero capacity");

    Json one = run_request(Json::parse(
        "{\"algorithm_id\":\"knapsack_01\",\"strategy\":\"tabulation\",\"input\":{\"weights\":[2,2],\"values\":[3,4],\"capacity\":2},\"include_trace\":false}"));
    expect(one.at("result").at("max_value").i == 4, "duplicate weights");

    expect_error("{\"algorithm_id\":\"fibonacci\",\"strategy\":\"tabulation\",\"input\":{\"n\":-1}}", "negative fib");
    expect_error("{\"algorithm_id\":\"fibonacci\",\"strategy\":\"recursive\",\"input\":{\"n\":13}}", "recursive cap");
    expect_error("{\"algorithm_id\":\"nope\",\"strategy\":\"tabulation\",\"input\":{}}", "unknown");
    expect_error("{\"algorithm_id\":\"knapsack_01\",\"strategy\":\"recursive\",\"input\":{\"weights\":[1],\"values\":[1],\"capacity\":1}}",
                 "knapsack strategy");

    if (failures) {
        std::cerr << failures << " failure(s)\n";
        return 1;
    }
    std::cout << "engine tests passed\n";
    return 0;
}
