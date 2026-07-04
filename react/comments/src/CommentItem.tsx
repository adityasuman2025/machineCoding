import { useState, memo, useCallback, useMemo, useRef } from "react";
import { Comments } from "./App"

interface CommentItemProps {
    comments: Comments,
    id: string,
    parentId: string,
    comment: string,
    repliesIds: string[],
    onDeleteClick: (id: string, parentId: string) => void,
    onEditClick: (id: string, parentId: string, newVal: string) => void,
    onReplyClick: (id: string, parentId: string, newVal: string) => void,
}
function CommentItem({
    comments,
    id,
    parentId,
    comment,
    repliesIds,
    onDeleteClick,
    onEditClick,
    onReplyClick,
}: CommentItemProps) {
    const inputRef = useRef(null);
    const replyInputRef = useRef(null);
    console.log("CommentItem render:", comment);

    const [isEditting, setIsEditting] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [isRepliesVis, setIsRepliesVis] = useState(true);
    const replies = useMemo(() => repliesIds.map((id) => comments[id]), [comments]);

    const handleDeleteClick = useCallback(() => {
        onDeleteClick(id, parentId);
    }, [id, parentId]);

    const handleEditClick = useCallback(() => {
        setIsEditting(true)
    }, []);

    const handleSaveEditClick = useCallback((e) => {
        const val = inputRef.current.value?.trim();
        if (val) {
            onEditClick(id, parentId, val);
            setIsEditting(false);
        }
    }, [id, parentId])

    const handleHideReplies = useCallback(() => {
        setIsRepliesVis((prev) => !prev);
    }, []);

    const handleReplyClick = useCallback(() => {
        setIsReplying(true);
    }, []);

    const handleReplyDoneClick = useCallback(() => {
        const val = replyInputRef.current.value?.trim();
        setIsReplying(false);

        const newId = String(Date.now());
        if (val) onReplyClick(newId, id, val);
    }, [id,]);

    return (
        <li>
            {
                isEditting ? (
                    <div>
                        <input ref={inputRef} type="text" defaultValue={comment} />
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
                        <textarea ref={replyInputRef} />
                        <button onClick={handleReplyDoneClick}>reply</button>
                    </div>
                ) : null}

            {isRepliesVis && replies.length ? (
                <ul className="border">
                    {replies.map((item, idx) => (
                        <CommentItem
                            key={item.id}
                            id={item.id}
                            parentId={item.parentId}
                            comment={item.comment}
                            repliesIds={item.repliesIds}
                            comments={comments}
                            onDeleteClick={onDeleteClick}
                            onEditClick={onEditClick}
                            onReplyClick={onReplyClick}
                        />
                    ))}
                </ul>
            ) : null}
        </li>
    );
}

export default memo(CommentItem);