from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.get_json()
    expression = data.get("expression", "")

    try:
        # Only allow safe characters
        allowed = set("0123456789+-*/.() ")
        if not all(c in allowed for c in expression):
            return jsonify({"error": "Invalid characters in expression"}), 400

        result = eval(expression)  # nosec - input is sanitized above

        # Handle division by zero and infinity
        if result == float("inf") or result == float("-inf"):
            return jsonify({"error": "Division by zero"})

        # Format result: remove trailing zeros for floats
        if isinstance(result, float) and result == int(result):
            result = int(result)

        return jsonify({"result": str(result)})
    except ZeroDivisionError:
        return jsonify({"error": "Division by zero"})
    except Exception:
        return jsonify({"error": "Invalid expression"})


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)
