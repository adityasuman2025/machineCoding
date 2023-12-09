const menu = [
    { title: "why prep" },
    {
        title: "courses",
        subMenu: [
            { title: "DSA to development" },
            {
                title: "for professionals",
                subMenu: [{ title: "DSA Classes Live" }, { title: "System Design Live" }, { title: "Java BE Live" }, { title: "Devops Live" }]
            },
            {
                title: "for students",
                subMenu: [{ title: "Interview Prep Course" }, { title: "Data Science Live" }, { title: "Gate CS / IT 2024" }, { title: "Master CP" }]
            }
        ]
    },
    {
        title: "tutorials",
        subMenu: [
            { title: "DSA for beginners" },
            {
                title: "DSA",
                subMenu: [
                    { title: "Arrays" },
                    { title: "String" },
                    {
                        title: "LinkedList",
                        subMenu: [{ title: "Single LinkedList" }, { title: "Double LinkedList" }, { title: "Circular LinkedList" }]
                    },
                    { title: "Stack" },
                    { title: "Queue" },
                    {
                        title: "Tree",
                        subMenu: [{ title: "BST" }, { title: "Binary Tree" }, { title: "AVL Tree" }]
                    },
                    { title: "Heap" },
                    { title: "Graph" },
                ]
            },
            {
                title: "System Design",
                subMenu: [
                    {
                        title: "Design Pattern",
                        subMenu: [{ title: "factory" }]
                    },
                    {
                        title: "Design Tutorial",
                        subMenu: [
                            {
                                title: "What is system design",
                                subMenu: [{ title: "key terminology" }, { title: "databases" }, { title: "HLD" }, { title: "LLD" }]
                            }
                        ]
                    }
                ]
            }
        ]
    }
];
let activeMenuItemKeys = []; // variable to store key of all expanded menu items

const contentEle = document.getElementById("content");

const handleMouseHoverOP = debounce(handleMouseHover, 200);
contentEle.addEventListener("mouseover", handleMouseHoverOP);
contentEle.addEventListener("click", function(e) {
    e.stopPropagation(); // to stop event bubbling of menu item click // because we have a click event listener applied at document to hide the expanded menu
});

document.addEventListener("click", handleDocumentClick);

renderMenu();
function renderMenu() {
    contentEle.innerHTML = getMenuHtml(menu, "").innerHTML;
}

function getMenuHtml(menu, parentKey) {
    const tempEle = document.createElement("div");

    const menuEle = document.createElement("div");
    menuEle.classList.add("menu");
    menu.forEach(({ title, subMenu = [] }, idx) => {
        const key = (parentKey ? parentKey + "_" : "") + idx;

        const menuItemEle = document.createElement("div");
        menuItemEle.classList.add("menuItem");

        // menu item's title
        const menuTitleEle = document.createElement("div");
        menuTitleEle.innerText = title + (subMenu && subMenu.length ? " >" : "");
        menuTitleEle.dataset.key = key;
        menuItemEle.append(menuTitleEle);
        // menu item's title

        // if sub menu exists then appending it it the curr menu item
        if (subMenu && subMenu.length) {
            const subMenuWrapperEle = document.createElement("div");
            subMenuWrapperEle.classList.add("menuWrapper");

            if (activeMenuItemKeys.includes(key)) { // it current item's key exists in activeMenuItemKeys array, then making its subMenu visible
                subMenuWrapperEle.classList.add("visible");
            } else subMenuWrapperEle.classList.add("hidden");

            subMenuWrapperEle.innerHTML = getMenuHtml(subMenu, key).innerHTML;
            menuItemEle.append(subMenuWrapperEle);
        }
        // if sub menu exists then appending it it the curr menu item

        menuEle.append(menuItemEle);
    });
    tempEle.append(menuEle);


    return tempEle;
}

function handleMouseHover(e) {
    const key = e.target.dataset.key;
    if (key) { // if hovered over a menu item
        const keyArr = key.split("_");

        // if hovering over a children, then its parent, parent's parent and so on, will also get expanded
        activeMenuItemKeys = [...chances(keyArr)]; // function get keys of all the parent's of the current menu item (key)

        renderMenu(); // re-rendering menu on hover
    }
}

function chances(inp) {
    let out = [];

    let temp = [];
    for (let i = 0; i < inp.length; i++) {
        temp.push(inp[i]);
        out.push([...temp]);
    }

    return out.map(arr => arr.reduce((acc, i) => (acc ? acc + "_" : "") + i, ""));
}

function handleDocumentClick() {
    // remove expansion of menu items on document (anywhere else click other than menu)
    activeMenuItemKeys = [];
    renderMenu();
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