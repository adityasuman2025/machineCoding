const data = {
    "m51": {
        id: "m51",
        name: "Samsung M51",
        price: "20000",
        camera: "4",
        screenSize: "6.7 inches",
        screenType: "Amoled",
        batteryPower: "7000 mAH",
        ram: "6 gb",
        storage: "128 gb",
        weight: "240 grams",
        count: 11,
    },
    "iphone11": {
        id: "iphone11",
        name: "Apple iphone 11",
        price: "50000",
        camera: "3",
        screenSize: "6.1 inches",
        screenType: "LCD",
        batteryPower: "3500 mAH",
        ram: "4 gb",
        storage: "64 gb",
        weight: "170 grams",
        waterproof: "yes",
        wirelessCharging: "yes",
        count: 2,
    },
    "iqoo5": {
        id: "iqoo5",
        name: "Vivo iQOO 5",
        price: "25,000",
        camera: "5",
        screenSize: "6.7 inches",
        screenType: "lcd",
        batteryPower: "5000 mAH",
        ram: "8 GB",
        storage: "128 GB",
        weight: "200 grams",
        count: 5,
    },
};
const availableProducts = Object.keys(data);

const contentEle = document.getElementById("content");
let selectedProducts = [availableProducts[0]];
renderView(); // rendering intial view by default

function renderView() {
    const uniqueCompPoints = getUniquePoints(selectedProducts);

    const wrapperEle = document.createElement("div");
    const tableEle = document.createElement("table");

    tableEle.append(renderTableHead(selectedProducts)); // rendering table head
    tableEle.append(renderTableBody(uniqueCompPoints, selectedProducts)); // rendering table body

    // rendering table
    wrapperEle.append(tableEle);
    contentEle.innerHTML = wrapperEle.innerHTML;
}

function renderPointTitle(point) {
    const thEle = document.createElement("td");
    thEle.innerText = point;
    thEle.classList.add("pointTitle");

    return thEle;
}

function renderTableBody(uniqueCompPoints, selectedProducts) {
    const tbodyEle = document.createElement("tbody");

    uniqueCompPoints.forEach(point => {
        const trEle = document.createElement("tr");

        trEle.append(renderPointTitle(point)); // rendering point title

        let highestValueIdx, highestValue;
        selectedProducts.forEach((productId, idx) => {
            const thisProductDetails = data?.[productId];
            if (thisProductDetails) { // if we have data for that product
                let thisProductPointValue = thisProductDetails?.[point];

                let tdEle = document.createElement("td");
                tdEle.innerText = thisProductPointValue || "--";
                trEle.append(tdEle);

                if ([null, undefined].includes(highestValueIdx)) {
                    highestValueIdx = idx;
                    highestValue = thisProductPointValue || "0";
                } else {
                    if ((thisProductPointValue) > highestValue) {
                        highestValueIdx = idx;
                        highestValue = (thisProductPointValue);
                    }
                }
            }
        });

        // highlighting highest value
        const highestValueEle = trEle.querySelector(`td:nth-child(${Number(highestValueIdx) + 2})`);
        highestValueEle.classList.add("highlight")

        tbodyEle.append(trEle);
    });

    return tbodyEle;
}

function renderTableHead(selectedProducts) {
    const theadEle = document.createElement("thead");

    const trEle = document.createElement("tr");
    let thEle = document.createElement("th");
    thEle.innerText = "Comparison Points";
    trEle.append(thEle);

    selectedProducts.forEach((productId, idx) => {
        thEle = document.createElement("th");
        thEle.append(renderSelect(productId, idx));

        if (idx === selectedProducts.length - 1) thEle.append(renderAddBtn()); // in last element we have to render + btn to add more products for comparision

        trEle.append(thEle);
    })
    theadEle.append(trEle);

    return theadEle;
}

function renderSelect(thisProductId, thisProductIdx) {
    const selectEle = document.createElement("select");
    const optionEle = document.createElement("option");
    selectEle.append(optionEle);

    availableProducts.forEach(productId => {
        const optionEle = document.createElement("option");
        optionEle.value = productId;
        optionEle.innerText = data?.[productId]?.name;
        optionEle.defaultSelected = thisProductId === productId;

        selectEle.append(optionEle);
    });
    selectEle.dataset.thisProductIdx = thisProductIdx;
    // selectEle.addEventListener("change", handleProductChange); // does not works

    return selectEle;
}
// we need to attach change event listener to the nearest static parent element of select i.e. #content
// because element.addEventListener("event", handleChange); does not work for dynamically created elements 
contentEle.addEventListener('change', handleProductChange);
function handleProductChange(e) {
    const thisProductIdx = e?.target?.dataset?.thisProductIdx;
    const newActiveProductAtIdx = e.target.value;

    if (thisProductIdx >= 0) {
        selectedProducts[thisProductIdx] = newActiveProductAtIdx; //updating the product at that index
        renderView();
    }
}

function renderAddBtn() {
    const btnEle = document.createElement("button");
    btnEle.innerHTML = "+";
    btnEle.dataset.btnId = "add";
    // btnEle.addEventListener("click", handleAddBtnClick);  // does not works

    return btnEle;
}
// we need to attach click event listener to the nearest static parent element of add btn i.e. #content
// because element.addEventListener("event", handleChange); does not work for dynamically created elements 
contentEle.addEventListener('click', handleAddBtnClick);
function handleAddBtnClick(e) {
    const btnId = e?.target?.dataset?.btnId;

    if (btnId === "add") {
        selectedProducts.push("anything"); // it will render a empty table column for new product to compare
        renderView();
    }
}


function getUniquePoints(selectedProducts) {
    let uniqueCompPoints = new Set();

    selectedProducts.forEach(productId => {
        const pointsOfProduct = Object.keys(data?.[productId] || {}) || [];
        uniqueCompPoints = new Set([...uniqueCompPoints, ...pointsOfProduct]);
    });

    return uniqueCompPoints;
}