import { memoizeIt } from "./utils.js";

function filterProducts(products, tag) {
    return products.filter(item => (item.tags).includes(tag));
}
const filterProductsOP = memoizeIt(filterProducts);


function sortProducts(products, type) {
    return products.sort((a, b) => {
        if (type === "rating") return b[type] > a[type];
        if (type === "name") return a[type] > b[type];
        return a[type] - b[type];
    });
}
const sortProductsOP = memoizeIt(sortProducts);


function searchProducts(products, query) {
    console.log("searchProducts", query)
    return products.filter(item => (item.name).toLowerCase().includes(query.toLowerCase()));
}
const searchProductsOP = memoizeIt(searchProducts);

export {
    filterProducts, filterProductsOP,
    sortProducts,
    searchProductsOP
};