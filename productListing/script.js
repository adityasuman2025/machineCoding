import { debounce, apiCall } from "./utils.js";
import { filterProductsOP, sortProducts, searchProductsOP } from "./helpers.js";

const productsEle = document.getElementById("products");
const searchInputEle = document.getElementById("searchInput");
const sortByEle = document.getElementById("sortBy");
const filterEle = document.getElementById("filter");

filterEle.addEventListener("change", handleFilterChange);

sortByEle.addEventListener("click", handleSortClick);

const handleInputChangeOP = debounce(handleInputChange, 400);
searchInputEle.addEventListener("keyup", handleInputChangeOP);

let products, filters = [];

function loadApp() {
    apiCall("https://jsonblob.com/api/1151502046469152768")
        .then(data => {
            products = data;
            renderProducts(data);
        })
        .catch(error => {
            console.log("error", error);
        });
}
loadApp();

function renderProducts(products, selectedFilterValue) {
    const tempEle = document.createElement("div");

    let tempSet = new Set();
    products.forEach(element => {
        const prodEle = document.createElement("div");
        prodEle.classList.add("product");

        const prodImgEle = document.createElement("img");
        prodImgEle.classList.add("productImg");
        prodImgEle.src = element.img;
        prodImgEle.alt = "prod img";

        const prodDetailsEle = document.createElement("div");
        prodDetailsEle.classList.add("producDetails");

        const prodNameEle = document.createElement("div");
        prodNameEle.classList.add("productName");
        prodNameEle.innerText = element.name;

        const prodDescEle = document.createElement("div");
        prodDescEle.classList.add("productDesc");
        prodDescEle.innerText = element.rating + " | " + element.eta + " mins";

        prodDetailsEle.appendChild(prodNameEle);
        prodDetailsEle.appendChild(prodDescEle);

        prodEle.appendChild(prodImgEle);
        prodEle.appendChild(prodDetailsEle);
        tempEle.append(prodEle);


        tempSet = new Set([...tempSet, ...(element.tags || [])])
    });
    productsEle.innerHTML = tempEle.innerHTML;

    // rendering filter options in select field
    filters = Array.from(tempSet);
    renderFilterOptions(filters, selectedFilterValue || "");
}

function renderFilterOptions(filters, selectedValue) {
    const tempEle = document.createElement("div");
    const optionEle = document.createElement("option");
    optionEle.value = "";
    optionEle.innerText = "";
    tempEle.append(optionEle);

    filters.forEach(filter => {
        const optionEle = document.createElement("option");
        optionEle.value = filter;
        optionEle.innerText = filter;
        optionEle.defaultSelected = filter === selectedValue;

        tempEle.append(optionEle);
    });

    filterEle.innerHTML = tempEle.innerHTML;
}

function handleFilterChange(e) {
    const val = e.target.value;

    if (val) {
        const filteredResults = filterProductsOP(products, val);
        renderProducts(filteredResults, val);
    } else {
        renderProducts(products);
    }
}

function handleInputChange(e) {
    const val = e.target.value;

    if (val) {
        const searchResults = searchProductsOP(products, val);
        renderProducts(searchResults);
    } else {
        renderProducts(products);
    }
}

function handleSortClick(e) {
    const type = e.target.dataset.type;

    if (type) {
        const sortedResults = sortProducts(products, type);
        renderProducts(sortedResults);
    }
}