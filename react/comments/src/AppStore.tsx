import { useEffect, useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import CommentItem from "./CommentItemStore";
import storeObj, { Comment, Comments } from "./store";
import "./styles.css";

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

function transformData(data: Comment[]): Comments {
    return data.reduce((acc, item) => {
        const parentId = item.parentId;
        if (parentId && acc.hasOwnProperty(parentId)) acc[parentId].repliesIds.push(item.id);
        acc[item.id] = { ...item, repliesIds: [] };
        return acc;
    }, {})
}

export default function AppStore() {
    const commentInputRef = useRef(null);

    useEffect(() => {
        storeObj.set(transformData(DUMMYDATA))
    }, [])

    const getSnapshot = useCallback(() => storeObj.get(), []);
    const comments = useSyncExternalStore(storeObj.subscribe, getSnapshot);
    const currComments = useMemo(() => Object.values(comments).filter(item => item.parentId === null), [comments]);

    const handlePostComment = useCallback(() => {
        const val = commentInputRef.current.value?.trim();
        if (!val) return;

        const id = String(Date.now());
        storeObj.setCommentById(id, { id, parentId: null, comment: val, repliesIds: [] })
        commentInputRef.current.value = "";
    }, []);

    return (
        <>
            <textarea ref={commentInputRef} />
            <button onClick={handlePostComment}>post comment</button>

            <ul>
                {currComments.map((item) => (
                    <CommentItem key={item.id} id={item.id} />
                ))}
            </ul>
        </>
    );
}
