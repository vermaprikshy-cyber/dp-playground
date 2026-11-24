#include "errors.hpp"
#include "json_mini.hpp"
#include "runner.hpp"

#include <iostream>
#include <sstream>
#include <string>

namespace {

std::string read_stdin() {
    std::ostringstream buffer;
    buffer << std::cin.rdbuf();
    return buffer.str();
}

void write_error(const std::string& message) {
    Json error = Json::obj();
    error.set("status", Json::str("error"));
    error.set("message", Json::str(message));
    std::cout << error.dump();
}

}  // namespace

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(0);
    std::string text = read_stdin();
    if (text.size() > 100000) {
        write_error("The request is too large.");
        return 0;
    }
    Json request;
    try {
        request = Json::parse(text);
    } catch (const std::exception&) {
        write_error("The request was not valid JSON.");
        return 0;
    }
    try {
        std::cout << run_request(request).dump();
        return 0;
    } catch (const SafeError& error) {
        write_error(error.what());
        return 0;
    } catch (const std::exception&) {
        write_error("The algorithm worker could not complete this run.");
        return 1;
    }
}
