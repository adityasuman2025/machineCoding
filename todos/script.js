let todos = [
    { text: "eat pizza", isDone: false },
    { text: "go to market", isDone: false },
    { text: "make video", isDone: true },
    { text: "do exercise", isDone: false },
    { text: "drink water", isDone: true }
];

const inputEle = document.getElementById("input");
inputEle.addEventListener("keyup", handleInputChange);

const todosEle = document.getElementById("todos");
const optimisedHandleToDoChange = debounce(handleToDoChange, 300);
todosEle.addEventListener("keyup", optimisedHandleToDoChange);
todosEle.addEventListener("click", handleDoneBtnClick);

renderToDos();
function renderToDos() {
    const tempEle = document.createElement("div");
    todos.forEach((todo, idx) => {
        const todoEle = document.createElement("div");
        const toDoInputEle = document.createElement("input");
        toDoInputEle.type = "text";
        toDoInputEle.setAttribute("value", todo.text); // `toDoInputEle.value = todo.text` was not working, don't know why
        toDoInputEle.dataset.toDoIdx = idx;

        const doneBtnEle = document.createElement("button");
        doneBtnEle.innerText = "done";
        doneBtnEle.dataset.toDoIdx = idx;

        if (todo.isDone) {
            toDoInputEle.classList.add("done");
            doneBtnEle.innerText = "undone";
        }

        todoEle.append(toDoInputEle);
        todoEle.append(doneBtnEle);

        tempEle.append(todoEle);
    });

    todosEle.innerHTML = tempEle.innerHTML;
}

function handleInputChange(e) {
    if (e.key === "Enter") {
        const val = e.target.value;
        todos.push({ isDone: false, text: val });
        e.target.value = "";

        renderToDos();
    }
}

function handleToDoChange(e) {
    const toDoIdx = e?.target?.dataset?.toDoIdx;
    if (toDoIdx >= 0) {
        const val = e.target.value;
        todos[toDoIdx]["text"] = val;
    }
}

function handleDoneBtnClick(e) {
    const toDoIdx = e?.target?.dataset?.toDoIdx;
    const type = e?.target?.type;

    if (toDoIdx >= 0 && type === "submit") {
        todos[toDoIdx]["isDone"] = !todos[toDoIdx]["isDone"];

        renderToDos();
    }
}


// utils
function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.call(this, ...args);
        }, delay);
    }
}