#pragma once

#include <cctype>
#include <cstdio>
#include <sstream>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

// Minimal JSON type for the worker contract. Objects keep insertion order.
// Numbers used by algorithms are integers; elapsed time is the only float.
class Json {
public:
    enum Type { NUL, BOOL, INT, FLOAT, STR, ARR, OBJ };

    Type type;
    bool b;
    long long i;
    double f;
    std::string s;
    std::vector<Json> a;
    std::vector<std::pair<std::string, Json>> o;

    Json() : type(NUL), b(false), i(0), f(0.0) {}

    static Json nul() { return Json(); }

    static Json boolean(bool value) {
        Json json;
        json.type = BOOL;
        json.b = value;
        return json;
    }

    static Json integer(long long value) {
        Json json;
        json.type = INT;
        json.i = value;
        return json;
    }

    static Json floating(double value) {
        Json json;
        json.type = FLOAT;
        json.f = value;
        return json;
    }

    static Json str(const std::string& value) {
        Json json;
        json.type = STR;
        json.s = value;
        return json;
    }

    static Json arr() {
        Json json;
        json.type = ARR;
        return json;
    }

    static Json obj() {
        Json json;
        json.type = OBJ;
        return json;
    }

    Json& push(const Json& value) {
        a.push_back(value);
        return *this;
    }

    Json& set(const std::string& key, const Json& value) {
        for (std::size_t index = 0; index < o.size(); ++index) {
            if (o[index].first == key) {
                o[index].second = value;
                return *this;
            }
        }
        o.push_back(std::make_pair(key, value));
        return *this;
    }

    bool has(const std::string& key) const { return find(key) != 0; }

    const Json& at(const std::string& key) const {
        const Json* found = find(key);
        if (!found) {
            throw std::runtime_error("missing field");
        }
        return *found;
    }

    const Json* find(const std::string& key) const {
        for (std::size_t index = 0; index < o.size(); ++index) {
            if (o[index].first == key) {
                return &o[index].second;
            }
        }
        return 0;
    }

    std::string dump() const {
        std::ostringstream out;
        write(out);
        return out.str();
    }

    static Json parse(const std::string& text);

private:
    const Json* find(const std::string& key) {
        for (std::size_t index = 0; index < o.size(); ++index) {
            if (o[index].first == key) {
                return &o[index].second;
            }
        }
        return 0;
    }

    void write(std::ostream& out) const {
        switch (type) {
            case NUL:
                out << "null";
                break;
            case BOOL:
                out << (b ? "true" : "false");
                break;
            case INT:
                out << i;
                break;
            case FLOAT: {
                char buffer[64];
                std::snprintf(buffer, sizeof(buffer), "%.4f", f);
                out << buffer;
                break;
            }
            case STR:
                out << '"' << escape(s) << '"';
                break;
            case ARR:
                out << '[';
                for (std::size_t index = 0; index < a.size(); ++index) {
                    if (index) {
                        out << ',';
                    }
                    a[index].write(out);
                }
                out << ']';
                break;
            case OBJ:
                out << '{';
                for (std::size_t index = 0; index < o.size(); ++index) {
                    if (index) {
                        out << ',';
                    }
                    out << '"' << escape(o[index].first) << '"';
                    out << ':';
                    o[index].second.write(out);
                }
                out << '}';
                break;
        }
    }

    static std::string escape(const std::string& value) {
        std::string out;
        out.reserve(value.size() + 8);
        for (std::size_t index = 0; index < value.size(); ++index) {
            unsigned char ch = static_cast<unsigned char>(value[index]);
            switch (ch) {
                case '"':
                    out += "\\\"";
                    break;
                case '\\':
                    out += "\\\\";
                    break;
                case '\b':
                    out += "\\b";
                    break;
                case '\f':
                    out += "\\f";
                    break;
                case '\n':
                    out += "\\n";
                    break;
                case '\r':
                    out += "\\r";
                    break;
                case '\t':
                    out += "\\t";
                    break;
                default:
                    if (ch < 0x20) {
                        char buffer[8];
                        std::snprintf(buffer, sizeof(buffer), "\\u%04x", ch);
                        out += buffer;
                    } else {
                        out += static_cast<char>(ch);
                    }
            }
        }
        return out;
    }
};

class JsonParser {
public:
    explicit JsonParser(const std::string& text) : in(text), p(0) {}

    Json parse() {
        Json value = parse_value();
        skip();
        if (p != in.size()) {
            throw std::runtime_error("invalid json");
        }
        return value;
    }

private:
    const std::string& in;
    std::size_t p;

    void skip() {
        while (p < in.size() && std::isspace(static_cast<unsigned char>(in[p]))) {
            ++p;
        }
    }

    char peek() {
        skip();
        if (p >= in.size()) {
            throw std::runtime_error("invalid json");
        }
        return in[p];
    }

    Json parse_value() {
        char ch = peek();
        if (ch == '{') {
            return parse_object();
        }
        if (ch == '[') {
            return parse_array();
        }
        if (ch == '"') {
            return Json::str(parse_string());
        }
        if (ch == 't' || ch == 'f') {
            return parse_bool();
        }
        if (ch == 'n') {
            return parse_null();
        }
        if (ch == '-' || std::isdigit(static_cast<unsigned char>(ch))) {
            return parse_number();
        }
        throw std::runtime_error("invalid json");
    }

    Json parse_object() {
        ++p;
        Json object = Json::obj();
        skip();
        if (p < in.size() && in[p] == '}') {
            ++p;
            return object;
        }
        while (true) {
            skip();
            if (p >= in.size() || in[p] != '"') {
                throw std::runtime_error("invalid json");
            }
            std::string key = parse_string();
            skip();
            if (p >= in.size() || in[p] != ':') {
                throw std::runtime_error("invalid json");
            }
            ++p;
            object.set(key, parse_value());
            skip();
            if (p >= in.size()) {
                throw std::runtime_error("invalid json");
            }
            if (in[p] == ',') {
                ++p;
                continue;
            }
            if (in[p] == '}') {
                ++p;
                break;
            }
            throw std::runtime_error("invalid json");
        }
        return object;
    }

    Json parse_array() {
        ++p;
        Json array = Json::arr();
        skip();
        if (p < in.size() && in[p] == ']') {
            ++p;
            return array;
        }
        while (true) {
            array.push(parse_value());
            skip();
            if (p >= in.size()) {
                throw std::runtime_error("invalid json");
            }
            if (in[p] == ',') {
                ++p;
                continue;
            }
            if (in[p] == ']') {
                ++p;
                break;
            }
            throw std::runtime_error("invalid json");
        }
        return array;
    }

    std::string parse_string() {
        if (p >= in.size() || in[p] != '"') {
            throw std::runtime_error("invalid json");
        }
        ++p;
        std::string out;
        while (p < in.size()) {
            unsigned char ch = static_cast<unsigned char>(in[p++]);
            if (ch == '"') {
                return out;
            }
            if (ch == '\\') {
                if (p >= in.size()) {
                    throw std::runtime_error("invalid json");
                }
                char esc = in[p++];
                switch (esc) {
                    case '"':
                    case '\\':
                    case '/':
                        out += esc;
                        break;
                    case 'b':
                        out += '\b';
                        break;
                    case 'f':
                        out += '\f';
                        break;
                    case 'n':
                        out += '\n';
                        break;
                    case 'r':
                        out += '\r';
                        break;
                    case 't':
                        out += '\t';
                        break;
                    case 'u': {
                        if (p + 4 > in.size()) {
                            throw std::runtime_error("invalid json");
                        }
                        int code = 0;
                        for (int digit = 0; digit < 4; ++digit) {
                            char hex = in[p++];
                            code <<= 4;
                            if (hex >= '0' && hex <= '9') {
                                code += hex - '0';
                            } else if (hex >= 'a' && hex <= 'f') {
                                code += hex - 'a' + 10;
                            } else if (hex >= 'A' && hex <= 'F') {
                                code += hex - 'A' + 10;
                            } else {
                                throw std::runtime_error("invalid json");
                            }
                        }
                        if (code < 0x80) {
                            out += static_cast<char>(code);
                        } else {
                            throw std::runtime_error("invalid json");
                        }
                        break;
                    }
                    default:
                        throw std::runtime_error("invalid json");
                }
            } else if (ch < 0x20) {
                throw std::runtime_error("invalid json");
            } else {
                out += static_cast<char>(ch);
            }
        }
        throw std::runtime_error("invalid json");
    }

    Json parse_bool() {
        if (in.compare(p, 4, "true") == 0) {
            p += 4;
            return Json::boolean(true);
        }
        if (in.compare(p, 5, "false") == 0) {
            p += 5;
            return Json::boolean(false);
        }
        throw std::runtime_error("invalid json");
    }

    Json parse_null() {
        if (in.compare(p, 4, "null") == 0) {
            p += 4;
            return Json::nul();
        }
        throw std::runtime_error("invalid json");
    }

    Json parse_number() {
        std::size_t start = p;
        if (in[p] == '-') {
            ++p;
        }
        if (p >= in.size() || !std::isdigit(static_cast<unsigned char>(in[p]))) {
            throw std::runtime_error("invalid json");
        }
        if (in[p] == '0') {
            ++p;
        } else {
            while (p < in.size() && std::isdigit(static_cast<unsigned char>(in[p]))) {
                ++p;
            }
        }
        bool is_float = false;
        if (p < in.size() && in[p] == '.') {
            is_float = true;
            ++p;
            if (p >= in.size() || !std::isdigit(static_cast<unsigned char>(in[p]))) {
                throw std::runtime_error("invalid json");
            }
            while (p < in.size() && std::isdigit(static_cast<unsigned char>(in[p]))) {
                ++p;
            }
        }
        if (p < in.size() && (in[p] == 'e' || in[p] == 'E')) {
            is_float = true;
            ++p;
            if (p < in.size() && (in[p] == '+' || in[p] == '-')) {
                ++p;
            }
            if (p >= in.size() || !std::isdigit(static_cast<unsigned char>(in[p]))) {
                throw std::runtime_error("invalid json");
            }
            while (p < in.size() && std::isdigit(static_cast<unsigned char>(in[p]))) {
                ++p;
            }
        }
        std::string token = in.substr(start, p - start);
        if (!is_float) {
            try {
                std::size_t used = 0;
                long long value = std::stoll(token, &used, 10);
                if (used != token.size()) {
                    throw std::runtime_error("invalid json");
                }
                return Json::integer(value);
            } catch (const std::invalid_argument&) {
                throw std::runtime_error("invalid json");
            } catch (const std::out_of_range&) {
                throw std::runtime_error("invalid json");
            }
        }
        try {
            std::size_t used = 0;
            double value = std::stod(token, &used);
            if (used != token.size()) {
                throw std::runtime_error("invalid json");
            }
            return Json::floating(value);
        } catch (const std::invalid_argument&) {
            throw std::runtime_error("invalid json");
        } catch (const std::out_of_range&) {
            throw std::runtime_error("invalid json");
        }
    }
};

inline Json Json::parse(const std::string& text) {
    return JsonParser(text).parse();
}
