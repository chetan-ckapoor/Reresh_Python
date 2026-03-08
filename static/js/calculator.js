let currentValue = "0";
let expression = "";
let shouldResetDisplay = false;
let activeOperator = null;

const resultEl = document.getElementById("result");
const expressionEl = document.getElementById("expression");

function updateDisplay() {
  resultEl.textContent = currentValue;

  // Adjust font size for long numbers
  if (currentValue.length > 9) {
    resultEl.className = "result small";
  } else {
    resultEl.className = "result";
  }

  expressionEl.textContent = expression;
}

function appendNumber(num) {
  // Clear error state
  if (resultEl.classList.contains("error")) {
    clearAll();
  }

  if (shouldResetDisplay) {
    currentValue = num;
    shouldResetDisplay = false;
  } else {
    if (currentValue === "0" && num !== ".") {
      currentValue = num;
    } else {
      if (currentValue.length >= 12) return;
      currentValue += num;
    }
  }

  highlightOperator(null);
  updateDisplay();
}

function appendDot() {
  if (shouldResetDisplay) {
    currentValue = "0.";
    shouldResetDisplay = false;
    updateDisplay();
    return;
  }
  if (!currentValue.includes(".")) {
    currentValue += ".";
    updateDisplay();
  }
}

function appendOperator(op) {
  if (resultEl.classList.contains("error")) return;

  // If we have a pending expression, calculate it first
  if (expression && !shouldResetDisplay) {
    computeResult(false);
  }

  expression = currentValue + " " + displayOp(op) + " ";
  activeOperator = op;
  shouldResetDisplay = true;
  highlightOperator(op);
  updateDisplay();
}

function displayOp(op) {
  const map = { "*": "×", "/": "÷", "+": "+", "-": "−" };
  return map[op] || op;
}

function highlightOperator(op) {
  document.querySelectorAll(".btn-operator").forEach((btn) => {
    btn.classList.remove("active");
    if (op && btn.textContent === displayOp(op)) {
      btn.classList.add("active");
    }
  });
}

function clearAll() {
  currentValue = "0";
  expression = "";
  shouldResetDisplay = false;
  activeOperator = null;
  highlightOperator(null);
  resultEl.className = "result";
  updateDisplay();
}

function toggleSign() {
  if (currentValue === "0") return;
  if (currentValue.startsWith("-")) {
    currentValue = currentValue.slice(1);
  } else {
    currentValue = "-" + currentValue;
  }
  updateDisplay();
}

function percentage() {
  const val = parseFloat(currentValue);
  if (isNaN(val)) return;
  currentValue = String(val / 100);
  updateDisplay();
}

function computeResult(updateExpression = true) {
  if (!expression) return;

  // Build the raw expression for evaluation
  const rawExpr = expression.replace("×", "*").replace("÷", "/").replace("−", "-");
  const fullExpr = rawExpr + currentValue;

  if (updateExpression) {
    expressionEl.textContent = expression + currentValue;
  }

  fetch("/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expression: fullExpr }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        resultEl.className = "result error";
        resultEl.textContent = data.error;
        expression = "";
        shouldResetDisplay = true;
        activeOperator = null;
        highlightOperator(null);
      } else {
        currentValue = data.result;
        expression = updateExpression ? "" : rawExpr;
        shouldResetDisplay = true;
        activeOperator = null;
        highlightOperator(null);
        updateDisplay();
      }
    })
    .catch(() => {
      resultEl.className = "result error";
      resultEl.textContent = "Error";
    });
}

function calculate() {
  computeResult(true);
}

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") appendNumber(e.key);
  else if (e.key === ".") appendDot();
  else if (e.key === "+") appendOperator("+");
  else if (e.key === "-") appendOperator("-");
  else if (e.key === "*") appendOperator("*");
  else if (e.key === "/") { e.preventDefault(); appendOperator("/"); }
  else if (e.key === "Enter" || e.key === "=") calculate();
  else if (e.key === "Escape") clearAll();
  else if (e.key === "Backspace") {
    if (currentValue.length > 1) {
      currentValue = currentValue.slice(0, -1);
    } else {
      currentValue = "0";
    }
    updateDisplay();
  }
  else if (e.key === "%") percentage();
});
