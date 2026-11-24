#include "knapsack.hpp"

#include "errors.hpp"
#include "limits.hpp"
#include "trace.hpp"

#include <chrono>
#include <set>
#include <sstream>
#include <string>
#include <utility>
#include <vector>

namespace {

struct Item {
    long long weight;
    long long value;
};

std::string item_name(int index) {
    std::ostringstream out;
    out << "item " << (index + 1);
    return out.str();
}

std::string join_items(const std::vector<int>& indices) {
    if (indices.empty()) {
        return "no items";
    }
    std::ostringstream out;
    for (std::size_t index = 0; index < indices.size(); ++index) {
        if (index) {
            out << (index + 1 == indices.size() ? " and " : ", ");
        }
        out << item_name(indices[index]);
    }
    return out.str();
}

Json read_items(const Json& input, std::vector<Item>& items, long long& capacity) {
    if (!input.has("weights") || input.at("weights").type != Json::ARR) {
        throw SafeError("weights must be a list of positive integers.");
    }
    if (!input.has("values") || input.at("values").type != Json::ARR) {
        throw SafeError("values must be a list of integers from 0 upward.");
    }
    if (!input.has("capacity") || input.at("capacity").type != Json::INT) {
        throw SafeError("capacity must be an integer.");
    }
    const Json& weights = input.at("weights");
    const Json& values = input.at("values");
    if (weights.a.size() != values.a.size()) {
        throw SafeError("weights and values must have the same length.");
    }
    if (static_cast<int>(weights.a.size()) > kKnapsackMaxItems) {
        throw SafeError(
            "Use at most 10 items. The limit keeps the DP table small enough to replay in the browser.");
    }
    capacity = input.at("capacity").i;
    if (capacity < 0 || capacity > kKnapsackMaxCapacity) {
        throw SafeError(
            "capacity must be an integer from 0 to 30. A larger table would make the trace too long to replay.");
    }
    items.clear();
    for (std::size_t index = 0; index < weights.a.size(); ++index) {
        if (weights.a[index].type != Json::INT || values.a[index].type != Json::INT) {
            throw SafeError("weights and values must contain only integers.");
        }
        long long weight = weights.a[index].i;
        long long value = values.a[index].i;
        if (weight < 1 || weight > kKnapsackMaxWeight) {
            throw SafeError("Each weight must be a positive integer up to 1000.");
        }
        if (value < 0 || value > kKnapsackMaxValue) {
            throw SafeError("Each value must be an integer from 0 to 10000.");
        }
        Item item;
        item.weight = weight;
        item.value = value;
        items.push_back(item);
    }
    return Json::nul();
}

Json complexity_for() {
    Json complexity = Json::obj();
    complexity.set("time", Json::str("O(n * capacity)"));
    complexity.set("space", Json::str("O(n * capacity)"));
    return complexity;
}

Json grid_visualization(int n, long long capacity, bool memo) {
    Json row_labels = Json::arr();
    if (memo) {
        for (int row = 0; row < n; ++row) {
            std::ostringstream label;
            label << "from " << item_name(row);
            row_labels.push(Json::str(label.str()));
        }
        row_labels.push(Json::str("no items left"));
    } else {
        row_labels.push(Json::str("0 items"));
        for (int row = 1; row <= n; ++row) {
            std::ostringstream label;
            label << "through " << item_name(row - 1);
            row_labels.push(Json::str(label.str()));
        }
    }
    Json col_labels = Json::arr();
    for (long long column = 0; column <= capacity; ++column) {
        col_labels.push(Json::str(std::to_string(column)));
    }
    Json viz = Json::obj();
    viz.set("kind", Json::str("grid"));
    viz.set("title", Json::str(memo ? "Memoized subproblems" : "0/1 Knapsack table"));
    viz.set("row_key", Json::str("i"));
    viz.set("col_key", Json::str("capacity"));
    viz.set("row_labels", row_labels);
    viz.set("col_labels", col_labels);
    viz.set(
        "legend",
        Json::str(memo
                      ? "Row i is the subproblem that starts at that item and may use only the items from there to the end. The column is remaining capacity. Empty cells were never needed."
                      : "Row i allows only the first i items. Column w is the capacity of that subproblem. dp[i][w] is the best total value."));
    return viz;
}

std::string cell_name(long long i, long long capacity) {
    std::ostringstream out;
    out << "dp[" << i << "][" << capacity << "]";
    return out.str();
}

}  // namespace

Json run_knapsack(const Json& input, const std::string& strategy, bool include_trace) {
    if (strategy != "memoization" && strategy != "tabulation") {
        throw SafeError("0/1 Knapsack supports memoization and tabulation.");
    }
    std::vector<Item> items;
    long long capacity = 0;
    read_items(input, items, capacity);
    int n = static_cast<int>(items.size());

    TraceBuilder trace(include_trace);
    long long state_count = 0;
    std::set<std::pair<long long, long long>> unique;
    long long best = 0;
    std::vector<int> selected;
    std::chrono::steady_clock::time_point started = std::chrono::steady_clock::now();

    if (strategy == "tabulation") {
        std::vector<std::vector<long long>> dp(
            static_cast<std::size_t>(n + 1), std::vector<long long>(static_cast<std::size_t>(capacity + 1), 0));
        std::vector<std::vector<int>> choice(
            static_cast<std::size_t>(n + 1), std::vector<int>(static_cast<std::size_t>(capacity + 1), 0));

        for (long long w = 0; w <= capacity; ++w) {
            ++state_count;
            unique.insert(std::make_pair(0, w));
            std::ostringstream explanation;
            explanation << cell_name(0, w) << " = 0 because no items are available.";
            trace.add("initialize", state_cell(0, w), true, 0, no_deps(), "dp[0][w] = 0", explanation.str(),
                      "0 items", true);
        }
        for (int i = 1; i <= n; ++i) {
            ++state_count;
            unique.insert(std::make_pair(i, 0));
            std::ostringstream explanation;
            explanation << cell_name(i, 0) << " = 0 because the capacity is 0, so " << item_name(i - 1)
                        << " cannot be taken.";
            trace.add("initialize", state_cell(i, 0), true, 0, no_deps(), "dp[i][0] = 0", explanation.str(),
                      cell_name(i, 0), true);
        }
        for (int i = 1; i <= n; ++i) {
            long long weight = items[static_cast<std::size_t>(i - 1)].weight;
            long long value = items[static_cast<std::size_t>(i - 1)].value;
            for (long long w = 1; w <= capacity; ++w) {
                long long exclude = dp[static_cast<std::size_t>(i - 1)][static_cast<std::size_t>(w)];
                long long include = -1;
                bool can_take = w >= weight;
                if (can_take) {
                    include = value + dp[static_cast<std::size_t>(i - 1)][static_cast<std::size_t>(w - weight)];
                }
                bool take = can_take && include >= exclude;
                long long chosen = take ? include : exclude;
                dp[static_cast<std::size_t>(i)][static_cast<std::size_t>(w)] = chosen;
                choice[static_cast<std::size_t>(i)][static_cast<std::size_t>(w)] = take ? 1 : 0;
                ++state_count;
                unique.insert(std::make_pair(i, w));
                std::ostringstream explanation;
                explanation << cell_name(i, w) << " compares excluding " << item_name(i - 1) << " (" << exclude
                            << ") with ";
                if (!can_take) {
                    explanation << "including it, which is impossible because its weight " << weight
                                << " exceeds capacity " << w << ". The cell keeps " << exclude << ".";
                } else if (take) {
                    explanation << "including it (" << include << "). Including it is better or equal, so the cell becomes "
                                << chosen << ".";
                } else {
                    explanation << "including it (" << include << "). Excluding it is better, so the cell stays "
                                << exclude << ".";
                }
                Json dependencies = can_take ? deps_two(state_cell(i - 1, w), state_cell(i - 1, w - weight))
                                             : deps_one(state_cell(i - 1, w));
                trace.add("update", state_cell(i, w), true, chosen, dependencies, "max(exclude, include)",
                          explanation.str(), cell_name(i, w), true, take ? "include" : "exclude");
            }
        }
        best = dp[static_cast<std::size_t>(n)][static_cast<std::size_t>(capacity)];
        int row = n;
        long long w = capacity;
        while (row > 0) {
            bool take = w > 0 && choice[static_cast<std::size_t>(row)][static_cast<std::size_t>(w)] == 1;
            std::ostringstream explanation;
            if (take) {
                selected.push_back(row - 1);
                explanation << "At " << cell_name(row, w) << ", the stored decision includes " << item_name(row - 1)
                            << ". Take it and continue at capacity " << (w - items[static_cast<std::size_t>(row - 1)].weight)
                            << ".";
            } else {
                explanation << "At " << cell_name(row, w) << ", the stored decision excludes " << item_name(row - 1)
                            << ".";
            }
            Json dependency = take ? state_cell(row - 1, w - items[static_cast<std::size_t>(row - 1)].weight)
                                   : state_cell(row - 1, w);
            trace.add("choose", state_cell(row, w), true, dp[static_cast<std::size_t>(row)][static_cast<std::size_t>(w)],
                      deps_one(dependency), take ? "include" : "exclude", explanation.str(), cell_name(row, w), false,
                      take ? "include" : "exclude");
            if (take) {
                w -= items[static_cast<std::size_t>(row - 1)].weight;
            }
            --row;
        }
    } else {
        std::vector<std::vector<long long>> memo(
            static_cast<std::size_t>(n + 1), std::vector<long long>(static_cast<std::size_t>(capacity + 1), -1));
        std::vector<std::vector<int>> choice(
            static_cast<std::size_t>(n + 1), std::vector<int>(static_cast<std::size_t>(capacity + 1), 0));
        struct Solver {
            const std::vector<Item>& items;
            std::vector<std::vector<long long>>& memo;
            std::vector<std::vector<int>>& choice;
            TraceBuilder& trace;
            long long& state_count;
            std::set<std::pair<long long, long long>>& unique;
            int n;
            long long solve(int i, long long rem) {
                if (memo[static_cast<std::size_t>(i)][static_cast<std::size_t>(rem)] != -1) {
                    ++state_count;
                    std::ostringstream explanation;
                    explanation << "Subproblem starting at " << (i == n ? std::string("the end") : item_name(i))
                                << " with remaining capacity " << rem << " is already memoized as "
                                << memo[static_cast<std::size_t>(i)][static_cast<std::size_t>(rem)] << ".";
                    trace.add("cache_hit", state_cell(i, rem), true,
                              memo[static_cast<std::size_t>(i)][static_cast<std::size_t>(rem)], no_deps(), "memo[i][rem]",
                              explanation.str(), cell_name(i, rem), false);
                    return memo[static_cast<std::size_t>(i)][static_cast<std::size_t>(rem)];
                }
                if (i == n || rem == 0) {
                    memo[static_cast<std::size_t>(i)][static_cast<std::size_t>(rem)] = 0;
                    ++state_count;
                    unique.insert(std::make_pair(i, rem));
                    std::ostringstream explanation;
                    if (i == n) {
                        explanation << cell_name(i, rem) << " = 0 because no items are left.";
                    } else {
                        explanation << cell_name(i, rem) << " = 0 because remaining capacity is 0.";
                    }
                    trace.add("initialize", state_cell(i, rem), true, 0, no_deps(), "base = 0", explanation.str(),
                              cell_name(i, rem), true);
                    return 0;
                }
                ++state_count;
                unique.insert(std::make_pair(i, rem));
                std::ostringstream entered;
                entered << "Enter the subproblem that starts at " << item_name(i) << " with remaining capacity " << rem
                        << ".";
                trace.add("enter", state_cell(i, rem), false, 0, no_deps(), "", entered.str(), cell_name(i, rem), false);
                long long exclude = solve(i + 1, rem);
                long long weight = items[static_cast<std::size_t>(i)].weight;
                long long value = items[static_cast<std::size_t>(i)].value;
                bool can_take = weight <= rem;
                long long include = -1;
                if (can_take) {
                    include = value + solve(i + 1, rem - weight);
                }
                bool take = can_take && include >= exclude;
                long long chosen = take ? include : exclude;
                memo[static_cast<std::size_t>(i)][static_cast<std::size_t>(rem)] = chosen;
                choice[static_cast<std::size_t>(i)][static_cast<std::size_t>(rem)] = take ? 1 : 0;
                std::ostringstream explanation;
                explanation << cell_name(i, rem) << " compares excluding " << item_name(i) << " (" << exclude
                            << ") with ";
                if (!can_take) {
                    explanation << "including it, which does not fit in the remaining capacity " << rem
                                << ". The subproblem keeps " << exclude << ".";
                } else if (take) {
                    explanation << "including it (" << include << "). Including it is better or equal, so store "
                                << chosen << ".";
                } else {
                    explanation << "including it (" << include << "). Excluding it is better, so store " << exclude
                                << ".";
                }
                Json dependencies = can_take ? deps_two(state_cell(i + 1, rem), state_cell(i + 1, rem - weight))
                                             : deps_one(state_cell(i + 1, rem));
                trace.add("update", state_cell(i, rem), true, chosen, dependencies, "max(exclude, include)",
                          explanation.str(), cell_name(i, rem), true, take ? "include" : "exclude");
                std::ostringstream returned;
                returned << "Return " << chosen << " from " << cell_name(i, rem) << ".";
                trace.add("return", state_cell(i, rem), true, chosen, no_deps(), "", returned.str(), cell_name(i, rem),
                          false);
                return chosen;
            }
        } solver{items, memo, choice, trace, state_count, unique, n};
        best = solver.solve(0, capacity);
        int i = 0;
        long long rem = capacity;
        while (i < n && rem > 0) {
            bool take = choice[static_cast<std::size_t>(i)][static_cast<std::size_t>(rem)] == 1;
            std::ostringstream explanation;
            if (take) {
                selected.push_back(i);
                explanation << "The stored decision at " << cell_name(i, rem) << " includes " << item_name(i) << ".";
            } else {
                explanation << "The stored decision at " << cell_name(i, rem) << " excludes " << item_name(i) << ".";
            }
            trace.add("choose", state_cell(i, rem), true, memo[static_cast<std::size_t>(i)][static_cast<std::size_t>(rem)],
                      no_deps(), take ? "include" : "exclude", explanation.str(), cell_name(i, rem), false,
                      take ? "include" : "exclude");
            if (take) {
                rem -= items[static_cast<std::size_t>(i)].weight;
            }
            ++i;
        }
    }

    std::vector<int> ascending = selected;
    if (strategy == "tabulation") {
        std::vector<int> flipped;
        for (int index = static_cast<int>(selected.size()) - 1; index >= 0; --index) {
            flipped.push_back(selected[static_cast<std::size_t>(index)]);
        }
        ascending = flipped;
    }

    std::ostringstream finished_text;
    if (ascending.empty()) {
        finished_text << "The best value is 0 because no selected item fits. This is a valid result, not a failed run.";
    } else {
        finished_text << "The best value is " << best << " by taking " << join_items(ascending)
                      << ". When include and exclude tie, this trace prefers include.";
    }
    long long final_i = strategy == "tabulation" ? n : 0;
    trace.add("finish", state_cell(final_i, capacity), true, best, no_deps(), "", finished_text.str(), "answer", false);

    std::chrono::steady_clock::time_point finished = std::chrono::steady_clock::now();
    double elapsed = std::chrono::duration<double, std::milli>(finished - started).count();

    Json indices = Json::arr();
    Json selected_items = Json::arr();
    for (std::size_t index = 0; index < ascending.size(); ++index) {
        int item_index = ascending[index];
        indices.push(Json::integer(item_index));
        Json described = Json::obj();
        described.set("index", Json::integer(item_index));
        described.set("weight", Json::integer(items[static_cast<std::size_t>(item_index)].weight));
        described.set("value", Json::integer(items[static_cast<std::size_t>(item_index)].value));
        selected_items.push(described);
    }

    Json response = Json::obj();
    response.set("status", Json::str("success"));
    Json result_json = Json::obj();
    result_json.set("max_value", Json::integer(best));
    result_json.set("selected_item_indices", indices);
    result_json.set("selected_items", selected_items);
    response.set("result", result_json);
    response.set("complexity", complexity_for());
    Json metrics = Json::obj();
    metrics.set("state_count", Json::integer(state_count));
    metrics.set("unique_states", Json::integer(static_cast<long long>(unique.size())));
    metrics.set("elapsed_ms", Json::floating(elapsed));
    response.set("metrics", metrics);
    response.set("visualization", grid_visualization(n, capacity, strategy == "memoization"));
    if (include_trace) {
        response.set("trace", trace.events);
    }
    return response;
}
