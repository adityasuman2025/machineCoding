import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import CommentItem from "./CommentItem";
import "./styles.scoped.css";

/*
    Build a Nested Comments System similar to the comment threads on Reddit or Facebook.

    1. Display a list of root-level comments.
    2. Users can add a new root comment.
    3. Users can reply to any existing comment.
    4. Replies can themselves have replies (unlimited nesting).
    5. Users can edit any existing comment.
    6. Users can delete a comment.
    7. Users can collapse and expand the replies of any comment.
*/

const DUMMYDATA: Comment[] = [
    {
        id: "0",
        parentId: null,
        comment: "my name is aditya suman",
    },

    {
        id: "0.0",
        parentId: "0",
        comment: "hey aditya",
    },

    {
        id: "0.0.0",
        parentId: "0.0",
        comment: "hello nimisha",
    },

    {
        id: "1",
        parentId: null,
        comment: "my name is khan",
    },


    {
        id: "1.0",
        parentId: "1",
        comment: "khan bhai",
    },


    {
        id: "1.1",
        parentId: "1",
        comment: "tu srk hai?",
    },
];

interface Comment {
    id: string,
    parentId: string | null,
    comment: string,
    repliesIds?: string[]
}
export interface Comments {
    [key: string]: Comment
}

function transformData(data: Comment[]): Comments {
    const obj = {};

    data.forEach(item => {
        const id = String(item.id);
        const parentId = item.parentId !== null && item.parentId !== undefined ? String(item.parentId) : null;

        if (!obj.hasOwnProperty(id)) obj[id] = { ...item, repliesIds: [] };
        else obj[id] = { ...(obj[id] || {}), ...item };

        if (parentId) {
            if (!obj.hasOwnProperty(parentId)) obj[parentId] = { repliesIds: [id] }
            else obj[parentId] = { ...(obj[parentId] || {}), repliesIds: [...(obj[parentId].repliesIds || []), id] };
        }
    });

    return obj;
}

const PARENT_ID = null;

export default function App() {
    const commentInputRef = useRef(null);
    const [comments, setComments] = useState<Comments>(transformData(DUMMYDATA));
    const currCumments = useMemo(() => Object.values(comments).filter(item => item.parentId === PARENT_ID), [comments]);

    const handlePostComment = useCallback(() => {
        const val = commentInputRef.current.value?.trim();
        if (!val) return;

        const id = String(Date.now());
        setComments((prev) => ({ ...prev, [id]: { id, parentId: null, comment: val, repliesIds: [] } }));
        commentInputRef.current.value = "";
    }, []);

    const handleDeleteClick = useCallback((id, parentId) => {
        console.log("handleDeleteClick", id, parentId)
        setComments(prev => {
            const repliesIds = prev[id].repliesIds || [];
            const keys = Object.keys(prev);
            const res = {};
            for (let i = 0; i < keys.length; i++) {
                const currId = keys[i];
                if (currId === id || repliesIds.includes(currId)) continue; // skip the deleted element
                else if (currId === parentId) {
                    res[currId] = {
                        ...prev[currId],
                        repliesIds: (prev[currId].repliesIds || []).filter(j => j !== id)
                    }
                } else res[currId] = prev[currId];
            }
            return res;
        });
    }, []);

    const handleEditClick = useCallback((id, parentId, newVal) => {
        console.log("handleEditClick", id, parentId, newVal);
        setComments(prev => ({ ...prev, [id]: { ...(prev[id] || {}), comment: newVal } }));
    }, []);

    const handleReplyClick = useCallback((id, parentId, newVal) => {
        console.log("handleReplyClick", id, parentId, newVal);
        setComments(prev => ({
            ...prev,
            [parentId]: { ...(prev[parentId] || {}), repliesIds: [...(prev[parentId]?.repliesIds || []), id] },
            [id]: { id, parentId, comment: newVal, repliesIds: [] }
        }));
    }, []);

    return (
        <>
            <textarea ref={commentInputRef} />
            <button onClick={handlePostComment}>post comment</button>

            <ul className="commentList">
                {currCumments.map((item) => (
                    <CommentItem
                        key={item.id}
                        id={item.id}
                        parentId={PARENT_ID}
                        comment={item.comment}
                        repliesIds={item.repliesIds}
                        comments={comments}
                        onDeleteClick={handleDeleteClick}
                        onEditClick={handleEditClick}
                        onReplyClick={handleReplyClick}
                    />
                ))}
            </ul>
        </>
    );
}