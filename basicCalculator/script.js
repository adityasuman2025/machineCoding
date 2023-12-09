const OPERATORS = ["+", "-", "/", "x"];

const displayEle = document.getElementById("display");
const keysEle = document.getElementById("keys");
keysEle.addEventListener("click", handleKeyClick);
renderScreen(0);

let prevVal, currVal = "", operator, isAnsCalculated = false;
function handleKeyClick(e) {
    const key = e?.target?.dataset.key;
    if (!key) return;

    if (key === "C") {
        prevVal = "";
        currVal = "";
        operator = "";
        isAnsCalculated = false;

        renderScreen(0);
    } else if (OPERATORS.includes(key)) {
        if (prevVal) {
            if (operator) currVal = doCalculation(operator, prevVal, currVal);
            else currVal = doCalculation(key, prevVal, currVal);

            prevVal = "";
            operator = key;
            renderScreen(currVal);

            isAnsCalculated = true;
        } else {
            prevVal = currVal;
            currVal = "";
            operator = key;

            isAnsCalculated = false;
        }
    } else if (key === "=") {
        if (prevVal && operator) {
            currVal = doCalculation(operator, prevVal, currVal);
            prevVal = "";
            operator = "";
            renderScreen(currVal);

            isAnsCalculated = true;
        } else {
            prevVal = currVal;
            currVal = "";

            isAnsCalculated = false;
        }
    } else {
        if (isAnsCalculated) {
            prevVal = currVal;
            currVal = key;
        } else {
            currVal += key;
        }

        isAnsCalculated = false;
        renderScreen(currVal);
    }

    highlightOperator(operator);
}

function doCalculation(action, first, second) {
    if (!action) return second;

    if (action === "+") return Number(first) + Number(second);
    else if (action === "-") return Number(first) - Number(second);
    else if (action === "x") return Number(first) * Number(second);
    else if (action === "/") return Number(first) / Number(second);
}

function highlightOperator(operator) {
    const operators = document.getElementsByClassName("operator") || [];
    for (let i = 0; i < operators.length; i++) {
        const key = operators[i].dataset.key;

        if (key === operator) operators[i].classList.add("highlighted");
        else operators[i].classList.remove("highlighted");
    }
}

function renderScreen(val) {
    displayEle.innerText = val;
}