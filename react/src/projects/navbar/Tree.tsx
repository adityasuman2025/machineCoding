import { memo, useState, useMemo, useCallback } from "react";

interface TreeProps {
    treeObj: Record<string, any>,
    parentId: string,
}
function Tree({ treeObj, parentId }: TreeProps) {
    const { childIds, ...rest } = useMemo(() => treeObj[parentId], [treeObj, parentId]);

    const [isExpanded, setIsExpanded] = useState(false);

    const handleClick = useCallback(() => {
        setIsExpanded(prev => !prev)
    }, []);

    return (
        <li >
            <div onClick={handleClick}>{rest.displayText}</div>

            {
                childIds?.length && isExpanded ?
                    <ul>
                        {childIds.map((childId: string) => <Tree key={childId} treeObj={treeObj} parentId={childId} />)}
                    </ul>
                    : null
            }
        </li>
    )
}

export default memo(Tree);