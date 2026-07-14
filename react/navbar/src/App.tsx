import Tree from "./Tree";

const projectTree = [
    {
        id: 4,
        displayText: "components",
        parentId: 2
    },
    {
        id: 5,
        displayText: "App.js",
        parentId: 4
    },
    {
        id: 6,
        displayText: "styles",
        parentId: 2
    },
    {
        id: 1,
        displayText: "utilities",
        parentId: null
    },
    {
        id: 3,
        displayText: "index.js",
        parentId: 2
    },

    {
        id: 2,
        displayText: "src",
        parentId: null
    },

    {
        id: 7,
        displayText: "main.css",
        parentId: 6
    },
    {
        id: 8,
        displayText: "test",
        parentId: null
    },
    {
        id: 9,
        displayText: "dateUtils.js",
        parentId: 1
    }
];

function process(tree): Record<string, any> {
    const obj = {};

    tree.forEach(item => {
        const { id: _id, parentId: _parentId } = item;
        const id = String(_id), parentId = String(_parentId);

        if (!obj.hasOwnProperty(id)) obj[id] = { ...item, childIds: [] };
        else obj[id] = { ...(obj[id] || {}), ...item };

        if (parentId) {
            if (!obj.hasOwnProperty(parentId)) obj[parentId] = { childIds: [id] }
            else obj[parentId] = { ...(obj[parentId] || {}), childIds: [...(obj[parentId].childIds || []), id] };
        }
    });

    return obj;
}

function App() {
    const treeObj = process(projectTree);
    console.log("treeObj", treeObj)

    return (
        <Tree treeObj={treeObj} parentId={"null"} />
    )
}

export default App
