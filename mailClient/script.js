const TYPE_INBOX = "inbox";
const TYPE_SENT = "sent";
const TYPE_DRAFT = "draft";

const FOLDERS = [
    {
        type: TYPE_INBOX,
        title: "Inbox",
    },
    {
        type: TYPE_SENT,
        title: "Sent",
    },
    {
        type: TYPE_DRAFT,
        title: "Draft",
    }
];

const mails = {
    inbox: [
        {
            id: "refdsvb",
            from: "bhemujee@gmail.com",
            to: "aditya@mngo.in",
            subject: "Download this game",
            body: "hey bro. \nplz download this game: http://mngo.in \nThanks & Regards \nBhemu Singh"
        },
        {
            id: "uyvghoijhbv",
            from: "bhemujee@gmail.com",
            to: "aditya@mngo.in",
            subject: "Diwali Crackers",
            body: "hello sir. \nwe have to go to market today to buys crackers",
        },
        {
            id: "trgfddfsv",
            from: "aditi5480@gmail.com",
            to: "aditya@mngo.in",
            subject: "Khana kha lo",
            body: "khana kha lo aake, tym ho gaya hai",
        }
    ],

    sent: [
        {
            id: "joihujb",
            to: "bhemujee@gmail.com",
            from: "aditya@mngo.in",
            subject: "this game is urs now",
            body: "had download the game bro \nThanks & Regards \nAditya Suman"
        },
        {
            id: "bjk",
            to: "aditi5480@gmail.com",
            from: "aditya@mngo.in",
            subject: "Don't fire crackers",
            body: "pakada mat phodiye sir. dhuan dhuan ho jata hai",
        }
    ],

    draft: [
        {
            id: "jhbgvdc",
            to: "bhemujee@gmail.com",
            subject: "car driving",
            body: "Hello bhemu \nToday we will have ur first driving class \nThanks & Regards \nAditya Suman"
        },
    ]
}

let activeFolderIndex = null;
let activeMailId = null;

//rendering folders
const foldersEle = document.getElementById("folders");
foldersEle.addEventListener("click", handleFoldersClick);

function renderFolders() {
    const readMails = JSON.parse(localStorage.getItem("readMails") || "[]"); //getting read mails list from localStorage

    foldersEle.innerHTML = ""; //clearing old html
    FOLDERS.forEach((folder, i) => {
        const folderEle = document.createElement("li");
        folderEle.innerText = folder.title;
        folderEle.dataset.key = i;
        folderEle.classList = (activeFolderIndex == i) ? "active": "";

        //getting the undread mails count of this folder type
        const thisFolderMails = mails[folder.type];
        const thisFolderUnreadMailCount = (thisFolderMails.filter(mail => !readMails.includes(mail.id)) || []).length;
        const unreadEle = document.createElement("span");
        unreadEle.classList.add("unreadCount")
        unreadEle.innerText = thisFolderUnreadMailCount;

        if (thisFolderUnreadMailCount > 0) folderEle.append(unreadEle);

        foldersEle.append(folderEle);
    });
}
renderFolders();

function handleFoldersClick(event) {
    const key = parseInt(event.target.dataset.key);
    if (key >= 0) {
        activeFolderIndex = key;
        activeMailId = null; //resetting the active mail index

        renderFolders(); //to update the selected folder highlight in folders component
        renderFolderMails(FOLDERS[key].type); //to render mails of the selected folder type
    }
}

//rendering selected folder mails
const folderMails = document.getElementById("folderMails");

function renderFolderMails(activeFolderType) {
    if (activeFolderType) {
        const readMails = JSON.parse(localStorage.getItem("readMails") || "[]"); //getting read mails list from localStorage

        folderMails.innerHTML = ""; //clearing old folder mails html

        mails[activeFolderType].forEach((mail, i) => {
            const { id, subject, from, to } = mail;

            const mailEle = document.createElement("li");
            mailEle.classList = (activeMailId == id) ? "active": "";
            mailEle.classList = readMails.includes(id) ? mailEle.classList: mailEle.classList + " unread"; //adding undread class
            mailEle.addEventListener("click", (e) => handleMailClick(id, activeFolderType, i));

            const mailSubEle = document.createElement("div");
            mailSubEle.innerText = subject

            const mailFromToEle = document.createElement("div");
            mailFromToEle.classList.add("mailFromTo");
            mailFromToEle.innerText = activeFolderType == TYPE_INBOX ? from : to;

            mailEle.append(mailSubEle);
            mailEle.append(mailFromToEle);
    
            folderMails.append(mailEle);
        });
    }
}

function handleMailClick(mailId, activeFolderType) {
    if (activeFolderType && mailId) {
        activeMailId = mailId;

        //storing read mails list in localStorage;
        let readMails = JSON.parse(localStorage.getItem("readMails") || "[]");
        readMails = !readMails.includes(mailId) ? [...readMails, mailId] : readMails;
        localStorage.setItem("readMails", JSON.stringify(readMails))

        renderFolders(); //to update the unread msg count in folders component
        renderFolderMails(activeFolderType); //to update the unread/selected mail highlight in mails list component
        renderActiveMailInfo(activeFolderType, activeMailId);
    }
}

//render active mail info
const mailInfo = document.getElementById("mailInfo");

function renderActiveMailInfo(activeFolderType, activeMailId) {
    if (activeFolderType && activeMailId) {
        const activeMailInfo = mails[activeFolderType].filter(mail => mail.id == activeMailId)[0] || {};
        if (Object.keys(activeMailInfo).length) {
            const { subject, body, from, to } = activeMailInfo;
            
            const mailInfoEle = document.createElement("div");
            
            const subjEle = document.createElement("div");
            subjEle.classList.add("mailSubject");
            subjEle.innerText = subject;

            const fromEle = document.createElement("div");
            subjEle.classList.add("mailFromTo");
            fromEle.innerText = "From: " + from;

            const toEle = document.createElement("div");
            subjEle.classList.add("mailFromTo");
            toEle.innerText = "To: " + to;

            const bodyEle = document.createElement("div");
            bodyEle.innerText = body;

            const brELE = document.createElement("br");

            mailInfoEle.append(subjEle);
            if (activeFolderType == TYPE_INBOX) mailInfoEle.append(fromEle);
            mailInfoEle.append(toEle);
            mailInfoEle.append(brELE);
            mailInfoEle.append(brELE);
            mailInfoEle.append(bodyEle);


            mailInfo.innerHTML = ""; //removing old mail info
            mailInfo.append(mailInfoEle)
        }
    }
}