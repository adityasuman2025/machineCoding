import { useEffect, useRef, useState } from 'react'
import { flushSync } from "react-dom"
import socket from "./Socket";

enum MsgType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
}
interface Message {
    messageId: string,
    message: string,
    sentById: string,
    datetime: Date,
    type: MsgType,
    roomId: string
}

const DUMMY_USER_ID = String(new Date().getTime());

function App() {
    const lastMsgEle = useRef(null);

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMsg, setNewMsg] = useState<string>("");

    useEffect(() => {
        if (socket.connected) setIsConnected(true); // Check if socket is already connected

        socket.on("connect", onSocketConnect);
        socket.on("disconnect", onSocketDisconnect);
        socket.on('msg', onSocketNewMessage);

        return () => {
            socket.off('connect', onSocketConnect);
            socket.off('disconnect', onSocketDisconnect);
            socket.off('msg', onSocketNewMessage);
        };
    }, []);

    function onSocketConnect() {
        setIsConnected(true)
    }

    function onSocketDisconnect() {
        setIsConnected(false)
    }

    function onSocketNewMessage(data: Message) {
        // flushSync is used to do a state update synchronously and update the dom instantly -> so that the scrollIntoView shoule be able scroll to the latest added element
        // read more about this in Web-Tech google doc
        flushSync(() => {
            setMessages((prev) => [...prev, data]);
        });

        lastMsgEle.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    function handleSendMessage(e) {
        e.preventDefault();

        if (!isConnected || !newMsg) return;

        const newMsgObj = {
            messageId: String(new Date().getTime()),
            message: newMsg,
            sentById: DUMMY_USER_ID,
            datetime: new Date(),
            type: MsgType.TEXT,
            roomId: 'string'
        };

        socket.emit("msg", newMsgObj);
        setNewMsg("");
    }

    function handleTypeMsg(e) {
        setNewMsg(e.target.value);
    }

    return (
        <section className='container'>
            <section className='content'>
                <ul className='msgList'>
                    {
                        messages.map((msgItem) => (
                            <li key={msgItem.messageId} className={"msgItemWrapper " + (msgItem.sentById !== DUMMY_USER_ID ? "theirMsg" : "")}>
                                <div className='msgItem'>{msgItem.message}</div>
                            </li>
                        ))
                    }
                    <li ref={lastMsgEle} />
                </ul>

                <form onSubmit={handleSendMessage} className='sendMsgForm'>
                    <input type='text' value={newMsg} onChange={handleTypeMsg} disabled={!isConnected} autoFocus={true} />
                    <input type='submit' value="send" disabled={!isConnected} />
                </form>
            </section>
        </section>
    );
}

export default App
