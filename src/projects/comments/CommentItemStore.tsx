import { useState, memo, useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import storeObj from "./store";
import "./styles.scoped.css";

const CommentItemStore = memo(({ id }: { id: string }) => {
    const inputRef = useRef(null);
    const replyInputRef = useRef(null);

    const [isEditting, setIsEditting] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [isRepliesVis, setIsRepliesVis] = useState(true);

    const getSnapshot = useCallback(() => storeObj.getCommentById(id), []);
    const thisCommentData = useSyncExternalStore(storeObj.subscribe, getSnapshot);
    const { comment, parentId, repliesIds = [], replies = [] } = useMemo(() => {
        const commentsData = storeObj.get();
        const repliesIds = thisCommentData?.repliesIds || [];
        return {
            parentId: thisCommentData?.parentId,
            comment: thisCommentData?.comment,
            repliesIds,
            replies: repliesIds.map((replyId) => commentsData?.[replyId]).filter(Boolean)
        };
    }, [thisCommentData]);
    console.log("CommentItem render:", comment);

    const handleDeleteClick = useCallback(() => {
        const commentsData = storeObj.get();

        const keys = Object.keys(commentsData);
        const res = {};
        for (let i = 0; i < keys.length; i++) {
            const currId = keys[i];
            if (currId === id || repliesIds.includes(currId)) continue; // skip the deleted element
            else if (currId === parentId) {
                res[currId] = {
                    ...commentsData[currId],
                    repliesIds: (commentsData[currId].repliesIds || []).filter(j => j !== id)
                }
            } else res[currId] = commentsData[currId];
        }

        storeObj.set(res);
    }, [id, parentId, repliesIds]);

    const handleEditClick = useCallback(() => {
        setIsEditting(true)
    }, []);

    const handleSaveEditClick = useCallback(() => {
        const newVal = inputRef.current.value?.trim();
        if (newVal) {
            storeObj.setCommentById(id, { ...thisCommentData, comment: newVal });
            setIsEditting(false);
        }
    }, [id, thisCommentData])

    const handleHideReplies = useCallback(() => {
        setIsRepliesVis((prev) => !prev);
    }, []);

    const handleReplyClick = useCallback(() => {
        setIsReplying(true);
    }, []);

    const handleReplyDoneClick = useCallback(() => {
        const newVal = replyInputRef.current.value?.trim();
        setIsReplying(false);

        const newId = String(Date.now()), newParentId = id;
        if (newVal) {
            const commentsData = storeObj.get();
            storeObj.set({
                ...commentsData,
                [newParentId]: { ...thisCommentData, repliesIds: [...(thisCommentData?.repliesIds || []), newId] },
                [newId]: { id: newId, parentId: newParentId, comment: newVal, repliesIds: [] }
            });
        }
    }, [id, thisCommentData]);

    return (
        <li>
            {
                isEditting ? (
                    <div>
                        <input ref={inputRef} type="text" defaultValue={comment} autoFocus />
                        <button onClick={handleSaveEditClick}>save</button>
                    </div>
                ) : <div>{comment}</div>
            }

            <div>
                <button onClick={handleDeleteClick}>delete</button>
                {!isEditting && <button onClick={handleEditClick}>Edit</button>}
                {!isReplying && <button onClick={handleReplyClick}>Reply</button>}
                <button onClick={handleHideReplies}>{isRepliesVis ? "Hide" : "Show"} Replies</button>
            </div>

            {
                isReplying ? (
                    <div>
                        <textarea ref={replyInputRef} autoFocus />
                        <button onClick={handleReplyDoneClick}>reply</button>
                    </div>
                ) : null
            }

            {isRepliesVis && replies.length ? (
                <ul className="border">
                    {replies.map((item) => (
                        <CommentItemStore key={item.id} id={item.id} />
                    ))}
                </ul>
            ) : null}
        </li>
    );
});

export default CommentItemStore;
