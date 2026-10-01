import { useState, useCallback, memo } from "react";

// interface TreeNode {
//     id: string;
//     text: string;
//     children?: TreeNode[];
// }
// const tree: TreeNode[] = [
//     {
//         id: "1",
//         text: "food",
//         children: [
//             {
//                 id: "1.1",
//                 text: "pizza"
//             },
//             {
//                 id: "1.2",
//                 text: "samosa"
//             },
//             {
//                 id: "1.3",
//                 text: "amritsari kulcha"
//             },
//         ]
//     },
//     {
//         id: "2",
//         text: "game",
//         children: [
//             {
//                 id: "2.1",
//                 text: "football"
//             },
//             {
//                 id: "2.2",
//                 text: "cricket"
//             },
//             {
//                 id: "2.3",
//                 text: "badminton"
//             },
//             {
//                 id: "2.4",
//                 text: "chess"
//             },
//             {
//                 id: "2.5",
//                 text: "ludo"
//             }
//         ]
//     },
//     {
//         id: "3",
//         text: "os",
//         children: [
//             {
//                 id: "3.1",
//                 text: "mac os"
//             },
//             {
//                 id: "3.2",
//                 text: "window"
//             },
//             {
//                 id: "3.3",
//                 text: "linux"
//             }
//         ]
//     }
// ];

// interface SelectProps {
//     data: TreeNode;
//     selectedIds: Set<string>;
//     onSelectClick: (isAllSelected: boolean, ids: string[]) => void;
// }
// const Select = memo(function Select({
//     data,
//     selectedIds,
//     onSelectClick,
// }: SelectProps) {
//     const { id, text, children = [] } = data;

//     const childIds = children.map(item => item.id);
//     const hasChild = childIds.length > 0;

//     const selectedChildIds = childIds.filter(id => selectedIds.has(id));

//     const isAllSelected = hasChild ? (selectedChildIds.length === childIds.length) : selectedIds.has(id);
//     const isPartialSelected = isAllSelected ? false : selectedChildIds.length > 0;

//     function handleSelectClick() {
//         onSelectClick(isAllSelected, hasChild ? childIds : [id]);
//     }

//     return (
//         <li className="ml-3">
//             <div className="flex items-center gap-2 cursor-pointer" onClick={handleSelectClick}>
//                 {
//                     isAllSelected ? (
//                         <div className="w-4 h-4 bg-indigo-300" />
//                     ) : isPartialSelected ? (
//                         <div className="w-4 h-4 border-1 border-zinc-300 flex items-center justify-center">
//                             <div className="w-2 h-2 bg-indigo-300" />
//                         </div>
//                     ) : (
//                         <div className="w-4 h-4 border-1 border-zinc-300" />
//                     )
//                 }
//                 {text}
//             </div>

//             {
//                 children && children.length > 0 ? (
//                     <ul>
//                         {
//                             children.map((item) => (
//                                 <Select
//                                     key={item.id}
//                                     data={item}
//                                     selectedIds={selectedIds}
//                                     onSelectClick={onSelectClick}
//                                 />
//                             ))
//                         }
//                     </ul>
//                 ) : null
//             }
//         </li>
//     );
// });

// export default function MultiLevelSelect() {
//     const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

//     const handleSelectClick = useCallback((isAllSelected: boolean, ids: string[]) => {
//         setSelectedIds(prev => {
//             const next = new Set(prev);

//             if (isAllSelected) {
//                 ids.forEach(id => {
//                     next.delete(id);
//                 });
//             } else {
//                 ids.forEach(id => {
//                     next.add(id);
//                 });
//             }

//             return next;
//         });
//     }, []);

//     return (
//         <main className="">
//             <h1 className="text-2xl font-bold mb-4">Multi-Level Select</h1>
//             <ul>
//                 {
//                     tree.map(item => (
//                         <Select
//                             key={item.id}
//                             data={item}
//                             selectedIds={selectedIds}
//                             onSelectClick={handleSelectClick}
//                         />
//                     ))
//                 }
//             </ul>
//         </main>
//     );
// }


interface FlatNode {
    id: string;
    text: string;
    parentId: string | null;
    childIds: string[];
}
const tree: Record<string, FlatNode> = {
    "1": {
        id: "1",
        text: "food",
        parentId: null,
        childIds: ["1.1", "1.2", "1.3"],
    },
    "1.1": {
        id: "1.1",
        text: "pizza",
        parentId: "1",
        childIds: [],
    },
    "1.2": {
        id: "1.2",
        text: "samosa",
        parentId: "1",
        childIds: [],
    },
    "1.3": {
        id: "1.3",
        text: "amritsari kulcha",
        parentId: "1",
        childIds: [],
    },
    "2": {
        id: "2",
        text: "game",
        parentId: null,
        childIds: ["2.1", "2.2", "2.3", "2.4", "2.5"],
    },
    "2.1": {
        id: "2.1",
        text: "football",
        parentId: "2",
        childIds: [],
    },
    "2.2": {
        id: "2.2",
        text: "cricket",
        parentId: "2",
        childIds: [],
    },
    "2.3": {
        id: "2.3",
        text: "badminton",
        parentId: "2",
        childIds: [],
    },
    "2.4": {
        id: "2.4",
        text: "chess",
        parentId: "2",
        childIds: [],
    },
    "2.5": {
        id: "2.5",
        text: "ludo",
        parentId: "2",
        childIds: [],
    },
    "3": {
        id: "3",
        text: "os",
        parentId: null,
        childIds: ["3.1", "3.2", "3.3"],
    },
    "3.1": {
        id: "3.1",
        text: "mac os",
        parentId: "3",
        childIds: [],
    },
    "3.2": {
        id: "3.2",
        text: "window",
        parentId: "3",
        childIds: [],
    },
    "3.3": {
        id: "3.3",
        text: "linux",
        parentId: "3",
        childIds: [],
    },
};
const rootIds = Object.values(tree).filter(item => item.parentId === null).map(item => item.id);

function getLeafIds(id: string): string[] {
    const node = tree[id];
    if (!node || !node.childIds.length) return [id];

    return node.childIds.flatMap(id => getLeafIds(id));
}

interface SelectProps {
    id: string;
    selectedIds: Set<string>;
    onSelectClick: (isAllSelected: boolean, ids: string[]) => void;
}
const Select = memo(function Select({
    id,
    selectedIds,
    onSelectClick,
}: SelectProps) {
    const { text, childIds = [] } = tree?.[id];

    const hasChild = childIds.length > 0;
    const allChildIds = getLeafIds(id);

    const selectedLeafIds = allChildIds.filter(leafId => selectedIds.has(leafId));
    const isAllSelected = allChildIds.length === selectedLeafIds.length;
    const isPartialSelected = isAllSelected ? false : selectedLeafIds.length > 0;

    function handleSelectClick() {
        onSelectClick(isAllSelected, allChildIds);
    }

    return (
        <li
            role="treeitem"
            aria-checked={isAllSelected ? "true" : isPartialSelected ? "mixed" : "false"}
            aria-expanded={hasChild ? true : undefined}
            className="ml-3 list-none my-0.5"
        >
            <button
                type="button"
                onClick={handleSelectClick}
                className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-1 text-left text-inherit focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
            >
                {
                    isAllSelected ? (
                        <span aria-hidden="true" className="w-4 h-4 bg-indigo-300 inline-block" />
                    ) : isPartialSelected ? (
                        <span aria-hidden="true" className="w-4 h-4 border-1 border-zinc-300 flex items-center justify-center">
                            <span className="w-2 h-2 bg-indigo-300" />
                        </span>
                    ) : (
                        <span aria-hidden="true" className="w-4 h-4 border-1 border-zinc-300 inline-block" />
                    )
                }
                <span>{text}</span>
            </button>

            {
                hasChild ? (
                    <ul role="group" className="list-none">
                        {
                            childIds.map(childId => (
                                <Select
                                    key={childId}
                                    id={childId}
                                    selectedIds={selectedIds}
                                    onSelectClick={onSelectClick}
                                />
                            ))
                        }
                    </ul>
                ) : null
            }
        </li>
    );
});

export default function MultiLevelSelect() {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

    const handleSelectClick = useCallback((isAllSelected: boolean, ids: string[]) => {
        setSelectedIds(prev => {
            const next = new Set(prev);

            if (isAllSelected) {
                ids.forEach(id => {
                    next.delete(id);
                });
            } else {
                ids.forEach(id => {
                    next.add(id);
                });
            }

            return next;
        });
    }, []);

    return (
        <main>
            <h1 className="text-2xl font-bold mb-4">Multi-Level Select</h1>
            <ul role="tree" aria-multiselectable="true" aria-label="Multi-Level Select" className="list-none p-0">
                {
                    rootIds.map(id => (
                        <Select
                            key={id}
                            id={id}
                            selectedIds={selectedIds}
                            onSelectClick={handleSelectClick}
                        />
                    ))
                }
            </ul>
        </main>
    );
}