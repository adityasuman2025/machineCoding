const TOTAL_ALLOWED_CREATIVES = 5;

let colors = [
    // "red", "green", "orange", "blue", "lime", "yellow", "grey"
];
let creatives = [
    // { title: "1", subtitle: "one", color: "red" }, { title: "2", subtitle: "two", color: "green" }, { title: "3", subtitle: "three", color: "blue" }, { title: "4", subtitle: "four", color: "lime" }, { title: "5", subtitle: "five", color: "yellow" }, { title: "6", subtitle: "six", color: "orange" }, { title: "7", subtitle: "seven", color: "grey" },
];

let selectedFilterColor = "", selectedFormColor = "";

const pageContentEle = document.getElementById("pageContent");
pageContentEle.addEventListener("click", handlePageContentClick);
pageContentEle.addEventListener("keyup", filterByText);

const modalEle = document.getElementById("modal");
const addCreativeBtnEle = document.getElementById("addCreativeBtn");

function handlePageContentClick(e) {
    const type = e?.target?.dataset?.type;

    if (type === "addCreativeBtn") handleAddBtnClick(e);
    else if (type === "colorCircle") {
        const color = e?.target?.dataset?.color;
        filterByColor(color);
    }
}

function filterByColor(color) {
    if (selectedFilterColor === color) { // clearing color filter
        selectedFilterColor = "";
        renderCreatives(creatives);
    } else {
        selectedFilterColor = color;
        const filteredCreatives = creatives.filter(item => item.color === color);
        renderCreatives(filteredCreatives);
    }

    renderFilterColors(); // updating filter color view
}

function filterByText(e) {
    const val = e.target.value;
    if (val) {
        const filteredCreatives = creatives.filter(item => {
            return (item.title.toLowerCase().includes(val.toLowerCase()) || item.subtitle.toLowerCase().includes(val.toLowerCase()))
        });
        renderCreatives(filteredCreatives);
    } else {
        renderCreatives(creatives);
    }
}

function handleAddBtnClick(e) {
    modalEle.style.display = "block";
    addCreativeBtnEle.classList.add("disabledBtn");
}

getColors();
function getColors() {
    apiCall("https://random-flat-colors.vercel.app/api/random?count=10")
        .then(resp => {
            colors.push(...resp.colors);
            renderFilterColors();
            renderBackgrndColors();
        });
}

function renderFilterColors() {
    const filterColorsEle = document.getElementById("filterColors");
    filterColorsEle.innerHTML = getColorsHtml().innerHTML;
}

function renderProgressBar(items, totalItems) {
    const progressbarContainer = document.getElementById("progressbarContainer");

    progressbarContainer.innerHTML = getProgressBarHtml(items, totalItems).innerHTML;
}
renderProgressBar(creatives.length, TOTAL_ALLOWED_CREATIVES);
renderCreatives(creatives);


function renderCreatives(creatives) {
    const creativesEle = document.getElementById("creatives");

    let tempEle = document.createElement("div");
    creatives.forEach(({ title = "", subtitle = "", color = "" }) => {
        let creativeEle = document.createElement("div");
        creativeEle.classList.add("creative");
        creativeEle.style.backgroundColor = color;

        const titleEle = document.createElement("div");
        titleEle.innerText = title;

        const subTitleEle = document.createElement("div");
        subTitleEle.innerText = subtitle;
        subTitleEle.classList.add("creativeSubTitle");

        creativeEle.append(titleEle);
        creativeEle.append(subTitleEle);

        tempEle.append(creativeEle);
    });

    creativesEle.innerHTML = tempEle.innerHTML;

    renderProgressBar(creatives.length, TOTAL_ALLOWED_CREATIVES);
}


// modal part
let formData = { title: "", subtitle: "", color: "" };
modalEle.addEventListener("keyup", handleFormChange);
modalEle.addEventListener("click", handleFormClick);

function renderBackgrndColors() {
    const backgrndColorsEle = document.getElementById("backgrndColors");
    backgrndColorsEle.innerHTML = getColorsHtml().innerHTML;
}

function handleFormChange(e) {
    const name = e.target.name;
    const value = e.target.value;

    if (name) {
        formData[name] = value;
        checkDoneBtnVisiblity();
    }
}

function handleFormClick(e) {
    const type = e?.target?.dataset?.type;

    if (type === "colorCircle") {
        const color = e?.target?.dataset?.color;
        formData["color"] = color;

        checkDoneBtnVisiblity();

        selectedFormColor = color;
        renderBackgrndColors()
    } else if (type === "createCreativeBtn") {
        creatives.push(formData);

        handleModalClose(); // closing form modal

        renderCreatives(creatives); // re-rendering the creative list
    } else if (type === "modalCloseBtn") {
        handleModalClose();
    }
}

function checkDoneBtnVisiblity() {
    const createCreativeBtnEle = document.getElementById("createCreativeBtn");

    const { title, subtitle, color } = formData || {};
    if (title && subtitle && color) {
        createCreativeBtnEle.classList.remove("disabledBtn");
    } else {
        createCreativeBtnEle.classList.add("disabledBtn");
    }
}

function handleModalClose() {
    modalEle.style.display = "none";
    addCreativeBtnEle.classList.remove("disabledBtn");

    formData = { title: "", subtitle: "", color: "" }; // resetting form
    checkDoneBtnVisiblity(); // resetting done btn visibility

    // resetting form input field value
    selectedFormColor = "";
    const formInputEles = modalEle.querySelectorAll("input");
    formInputEles.forEach(formInputEle => {
        formInputEle.value = "";
    });
}


// helpers
function getProgressBarHtml(items, totalItems) {
    let tempEle = document.createElement("div");

    const progressbarEle = document.createElement("div");
    progressbarEle.classList.add("progressbar");

    const progressEle = document.createElement("div");
    progressEle.classList.add("progress");

    const barEle = document.createElement("div");
    barEle.classList.add("bar");
    barEle.style.width = (items / totalItems) * 100 + "%";
    progressEle.append(barEle);

    const stausEle = document.createElement("div");
    stausEle.innerText = `${items} / ${totalItems} Creatives`;

    progressbarEle.append(progressEle);
    progressbarEle.append(stausEle);
    tempEle.append(progressbarEle);

    return tempEle;
}

function getColorsHtml() {
    let tempEle = document.createElement("div");
    colors.forEach(color => {
        const colorEle = document.createElement("div");
        colorEle.classList.add("colorCircle");
        colorEle.dataset.color = color;
        colorEle.dataset.type = "colorCircle";
        colorEle.style.background = color;

        if ([selectedFilterColor, selectedFormColor].includes(color)) {
            colorEle.classList.add("selectedColorCircle");
        } else {
            colorEle.classList.remove("selectedColorCircle");
        }

        tempEle.append(colorEle);
    });

    return tempEle;
}

//utils
function apiCall(url) {
    return new Promise(async function(resolve, reject) {
        try {
            const resp = await fetch(url);
            const jsonResp = await resp.json();
            resolve(jsonResp);
        } catch (error) {
            reject({ error });
        }
    })
}