let tasks = {
    "toDo": ["eat pizza", "go market", "make video", "do exercise", "drink water"],
    "inProgress": [],
    "devDone": [],
    "inQa": [],
    "done": [],
};
const stages = Object.keys(tasks);

const formEle = document.getElementById("form");
formEle.addEventListener("submit", handleAddTask);

const stagesEle = document.getElementById("stages");
stagesEle.addEventListener("drag", handleDrag);
stagesEle.addEventListener("dragend", handleDragEnd);
stagesEle.addEventListener("dragover", handleDragOver);
stagesEle.addEventListener('drop', handleDrop);
// here we attached event listeners to the nearest static parent element of task and stage
// because element.addEventListener("event", handleChange); does not work for dynamically created elements 


renderStages();
function renderStages() {
    const tempEle = document.createElement("div");
    stages.forEach(stage => {
        const stageEle = document.createElement("div");
        stageEle.classList.add("stage");
        stageEle.dataset.stage = stage;

        const h3Ele = document.createElement("h3");
        h3Ele.innerText = stage;
        stageEle.append(h3Ele);

        stageEle.append(renderTasksOfASTage(stage, tasks[stage]));

        tempEle.append(stageEle);
    });

    stagesEle.innerHTML = tempEle.innerHTML;
}

function renderTasksOfASTage(stage, tasks) {
    const tempEle = document.createElement("div");
    tasks.forEach((task, idx) => {
        const taskEle = document.createElement("div");
        taskEle.dataset.taskIdx = idx;
        taskEle.dataset.stage = stage;
        taskEle.draggable = true;
        taskEle.classList.add("task");
        taskEle.innerText = task;

        tempEle.append(taskEle);
    });

    return tempEle;
}

function handleAddTask(e) {
    e.preventDefault();

    const val = e?.target?.todo?.value;
    if (val) {
        tasks["toDo"].push(val);
        renderStages();

        e.target.todo.value = "";
    }
}

let dragItem = null;
function handleDrag(e) {
    dragItem = e.target; // selecting the picked element

    e.target.style.opacity = 0; // hiding that element (task)
}

function handleDragEnd(e) {
    dragItem = null;

    e.target.style.opacity = 1; // showing that element (task)
}

function handleDragOver(e) {
    e.preventDefault(); // this is very important otherwise on drop (handleDrop) will not be triggered
}

function handleDrop(e) {
    if (dragItem) {
        let { stage: prevStage, taskIdx: prevIdx } = dragItem?.dataset || {};
        prevIdx = Number(prevIdx);
        const newStage = e.target?.dataset?.stage, taskText = dragItem.innerText;

        if (newStage === prevStage) return;

        if (prevStage && newStage && prevIdx >= 0) {
            tasks[newStage].push(taskText); // adding the picked/dragged task in the new stage

            const prevStageTasks = tasks[prevStage];
            tasks[prevStage] = [...(prevStageTasks.slice(0, prevIdx)), ...(prevStageTasks.slice(prevIdx + 1))]; // remvoing the picked/dragged task from the prev/old stage

            renderStages();
        }
    }
}