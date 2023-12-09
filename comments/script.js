let comments = [
    {
        comment: "0",
        replies: [
            {
                comment: "0.0",
                replies: [{ comment: "0.0.0", replies: [], }],
            }
        ],
    },
    { comment: "1", replies: [], }
];

const commentsContainerEle = document.getElementById("commentsContainer");
commentsContainerEle.addEventListener("click", handleContainerClick);
function handleContainerClick(event) {
    const target = event.target || {};
    const { type, id, replycount } = target.dataset || {}

    if (type === "reply") {
        handleReplyClick(event, id, replycount);
    } else if (type === "delete") {
        handleDeleteClick(event, id);
    }
}

function viewRenderer(comments, idPath = "") {
    return comments.reduce((acc, { comment, replies } = {}, idx) => {
        const id = (idPath ? idPath + "." : "") + idx;
        // let thisCommentHtml = `
        //     <div class="commentBox">
        //         <div>
        //             ${comment}
        //             <button data-id="${id}" data-type="delete">delete</button>
        //         </div>

        //         <textarea id="${id}"></textarea>
        //         <button data-id="${id}" data-type="reply" data-replycount="${replies.length}">reply</button>
        //         <div class="replies">${viewRenderer(replies, id)}</div>
        //     </div>
        // `;

        const commentBox = document.createElement("div");
        commentBox.classList.add("commentBox");

        const commentText = document.createElement("div");
        commentText.innerText = (comment)
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "delete";
        deleteBtn.dataset.id = id;
        deleteBtn.dataset.type = "delete";
        commentText.appendChild(deleteBtn);

        const textEle = document.createElement("textarea");
        textEle.id = id;

        const replyBtn = document.createElement("button");
        replyBtn.innerText = "reply";
        replyBtn.dataset.id = id;
        replyBtn.dataset.type = "reply";
        replyBtn.dataset.replycount = replies.length

        const repliesDiv = document.createElement("div");
        repliesDiv.classList.add("replies");
        repliesDiv.innerHTML = viewRenderer(replies, id)

        commentBox.appendChild(commentText);
        commentBox.appendChild(textEle);
        commentBox.appendChild(replyBtn);
        commentBox.appendChild(repliesDiv);

        const temp = document.createElement("div");
        temp.appendChild(commentBox);

        return acc + temp.innerHTML;
    }, "");
}

function render() {
    console.log("comments", comments)
    const html = viewRenderer(comments);
    commentsContainerEle.innerHTML = html;
}
render();

function handleCommentClick(event) {
    const thistextAreaEle = document.getElementById("comment");
    comments.push({ comment: thistextAreaEle.value, replies: [] });

    render();
    thistextAreaEle.value = ""
}

function handleReplyClick(event, commentBoxId, repliesCount) {
    const replyId = commentBoxId + "." + repliesCount; // id of this reply

    const thistextAreaEle = document.getElementById(commentBoxId);

    const replyIdArr = replyId.split(".").reduce((acc, i, idx) => {
        if (idx > 0) acc.push('replies'); // comment will go in replies array of the given comment
        acc.push(i);

        return acc;
    }, []);

    set(comments, replyIdArr, { comment: thistextAreaEle.value, replies: [] });
    render();
}

function handleDeleteClick(event, commentBoxId) {
    const replyIdArr = commentBoxId.split(".").reduce((acc, i, idx) => {
        if (idx > 0) acc.push('replies'); // comment will go in replies array of the given comment
        acc.push(i);

        return acc;
    }, []);

    omit(comments, replyIdArr);
    render();
}


// lodash functions
function set(obj, key, value) {
    let keyArr = Array.isArray(key) ? key : key.split(".");

    const thisKey = Number(keyArr[0]) || keyArr[0];
    const nextKey = keyArr[1];
    if (keyArr.length === 1) obj[thisKey] = value;
    else {
        if (!obj.hasOwnProperty(thisKey)) obj[thisKey] = isNaN(Number(nextKey)) ? {} : [];

        set(obj[thisKey], keyArr.slice(1), value);
    }
}

function omit(obj, path) {
    let pathArr = Array.isArray(path) ? path : path.split(".");

    const thisKey = Number(pathArr[0]) || pathArr[0];
    if (pathArr.length === 1) {
        if (Array.isArray(obj)) obj.splice(thisKey, 1);
        else delete obj[thisKey];
    } else {
        omit(obj[thisKey], pathArr.slice(1));
    }
}