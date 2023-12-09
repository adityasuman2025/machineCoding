const relativeEle = document.getElementById("relative");
const tagsEle = document.getElementById("tags");

const contentEle = document.getElementById("content");
contentEle.addEventListener("click", handleClick);
contentEle.addEventListener("keyup", handleInputChange);

let tags = {}, currClickedPosition = "";
function handleClick(e) {
    if (e.target.id === "content") {
        const { offsetX, offsetY } = e || {};
        currClickedPosition = offsetX + "_" + offsetY;
        renderInputBox(offsetX, offsetY);
    }
}

function renderInputBox(left, top) {
    const tempEle = document.createElement("div");
    const inputEle = document.createElement("input");
    inputEle.style.top = top + "px";
    inputEle.style.left = left + "px";
    inputEle.style.position = "absolute";

    tempEle.append(inputEle);
    relativeEle.innerHTML = tempEle.innerHTML;

    relativeEle.querySelector("input").focus(); // focusing the new input field
}

function handleInputChange(e) {
    const value = e.target.value;
    if (e.key === "Enter" && currClickedPosition) { // if enter is pressed then saving the tag
        tags[currClickedPosition] = value;

        currClickedPosition = ""; // clearing the current clicked position
        relativeEle.innerHTML = ""; // hiding input field
        renderTags(tags)
    }
}

function renderTags(tags) {
    const tempEle = document.createElement("div");
    Object.keys(tags).forEach(tagPos => {
        const tagEle = document.createElement("div");
        tagEle.classList.add("tag");
        tagEle.innerText = tags[tagPos];

        const [left, top] = tagPos.split("_");
        tagEle.style.top = top + "px";
        tagEle.style.left = left + "px";

        tempEle.append(tagEle);
    });

    tagsEle.innerHTML = tempEle.innerHTML;
}
