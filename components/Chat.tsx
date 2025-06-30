"use client";

import { useEffect, useState , useRef } from "react";
import { useSocket } from "@/context/SocketContext";

export default function Chat({ currentUserId, chatId }: { currentUserId: string, chatId: string }) {
    const socket = useSocket();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/messages?chatId=${chatId}`);
                const data = await res.json();
                setMessages(data.messages || []);
            } catch (err) {
                console.error("❌ Error fetching messages:", err);
            }
        };

        fetchMessages();
    }, [chatId]);

    useEffect(() => {
        if (!socket) return;

        socket.emit("join-room", chatId);

        const handleReceive = (msg: any) => {
            if (msg.chatId === chatId) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        socket.on("receive-message", handleReceive);

        return () => {
            socket.off("receive-message", handleReceive);
            socket.emit("leave-room", chatId);
        };
    }, [socket, chatId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!message.trim()) return;

        const msgData = {
            chatId,
            senderId: currentUserId,
            content: message,
            timestamp: new Date().toISOString()
        };

        socket.emit("send-message", msgData);
        setMessages((prev) => [...prev, msgData]);
        setMessage("");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] mt-8 max-w-lg mx-auto border rounded-lg shadow-sm bg-white overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-100">
                {messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`flex ${
                    msg.senderId === currentUserId ? "justify-end" : "justify-start"
                    }`}
                >
                    <div
                        className={`px-4 py-2 rounded-lg text-sm break-words whitespace-pre-wrap ${
                        msg.senderId === currentUserId
                        ? "bg-green-500 text-white self-end"
                        : "bg-white text-gray-800 border self-start"
                        }`}
                    >
                    {msg.content}
                    </div>
                </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className="flex items-center p-2 border-t bg-white gap-2">
                <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button
                onClick={handleSend}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full"
                >
                Send
                </button>
            </div>
        </div>
    );
}
