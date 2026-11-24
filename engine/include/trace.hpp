#pragma once

#include "errors.hpp"
#include "json_mini.hpp"

#include <string>

// Keep this aligned with TRACE_EVENT_CAP in backend/app/limits.py.
const int kTraceEventCap = 8000;

class TraceBuilder {
public:
    explicit TraceBuilder(bool include_trace) : enabled(include_trace), count(0) {
        events = Json::arr();
    }

    void add(const std::string& kind,
             const Json& state,
             bool has_value,
             long long value,
             const Json& dependencies,
             const std::string& operation,
             const std::string& explanation,
             const std::string& label,
             bool writes,
             const std::string& decision = "") {
        if (!enabled) {
            return;
        }
        if (count >= kTraceEventCap) {
            throw SafeError(
                "This input produces too many trace steps. Use a smaller input or turn the trace off.");
        }
        Json event = Json::obj();
        event.set("step", Json::integer(count));
        event.set("kind", Json::str(kind));
        event.set("state", state);
        event.set("writes", Json::boolean(writes));
        event.set("value", has_value ? Json::integer(value) : Json::nul());
        event.set("dependencies", dependencies);
        if (!operation.empty()) {
            event.set("operation", Json::str(operation));
        }
        event.set("explanation", Json::str(explanation));
        if (!label.empty()) {
            event.set("label", Json::str(label));
        }
        if (!decision.empty()) {
            event.set("decision", Json::str(decision));
        }
        events.push(event);
        ++count;
    }

    Json events;
    bool enabled;
    int count;
};

inline Json state_n(long long n) {
    Json state = Json::obj();
    state.set("n", Json::integer(n));
    return state;
}

inline Json state_cell(long long i, long long capacity) {
    Json state = Json::obj();
    state.set("i", Json::integer(i));
    state.set("capacity", Json::integer(capacity));
    return state;
}

inline Json no_deps() { return Json::arr(); }

inline Json deps_one(const Json& state) {
    Json list = Json::arr();
    list.push(state);
    return list;
}

inline Json deps_two(const Json& first, const Json& second) {
    Json list = Json::arr();
    list.push(first);
    list.push(second);
    return list;
}
