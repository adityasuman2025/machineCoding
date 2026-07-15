import Tree from "./Tree";

interface TreeNode {
    id: number;
    displayText: string;
    parentId: number | null;
}
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

function process(tree: TreeNode[]) {
    const obj: Record<string, any> = {};
    const rootIds: string[] = [];

    tree.forEach(item => {
        const id = String(item.id);
        const parentId = item.parentId !== null && item.parentId !== undefined ? String(item.parentId) : null;

        if (!obj.hasOwnProperty(id)) obj[id] = { ...item, childIds: [] };
        else obj[id] = { ...(obj[id] || {}), ...item };

        if (parentId) {
            if (!obj.hasOwnProperty(parentId)) obj[parentId] = { childIds: [id] }
            else obj[parentId] = { ...(obj[parentId] || {}), childIds: [...(obj[parentId].childIds || []), id] };
        } else rootIds.push(id);
    });

    return { obj, rootIds };
}
const { obj: treeObj, rootIds } = process(projectTree);;

export default function App() {
    return (
        <ul>
            {rootIds.map(item => <Tree key={item} treeObj={treeObj} parentId={item} />)}
        </ul>
    )
}
