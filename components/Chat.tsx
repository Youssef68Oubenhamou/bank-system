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
        <div className="flex flex-col h-[calc(100vh-4rem)] mt-8 max-w-2xl mx-auto border rounded-lg shadow-md bg-white overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-100">
                {messages.map((msg, idx) => {
                    const isSender = msg.senderId === currentUserId;
                    const time = new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    });

                return (
                    <div
                        key={idx}
                        className={`flex flex-col ${
                        isSender ? "items-end" : "items-start"
                        }`}
                    >
                        <div
                        className={`px-4 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap max-w-[80%] ${
                            isSender
                            ? "bg-green-500 text-white rounded-br-none"
                            : "bg-white text-gray-900 border rounded-bl-none"
                        }`}
                        >
                        <p className="font-semibold text-xs mb-1">
                            {isSender ? "You" : msg.senderName || "Friend"}
                        </p>
                        <p>{msg.content}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{time}</span>
                    </div>
                );
                })}
            <div ref={bottomRef} />
            </div>

            <div className="flex items-center px-4 py-3 border-t bg-white gap-2">
                <div className="flex items-center w-full rounded-full bg-gray-100 px-4 py-2 shadow-inner">
                    <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-500"
                    disabled={!chatId}
                    />
                    <button
                    onClick={handleSend}
                    disabled={!chatId || !message.trim()}
                    className={`ml-2 p-2 rounded-full transition duration-200 ${
                        message.trim()
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M22 2L11 13"
                            />
                            <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M22 2L15 22L11 13L2 9L22 2Z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );

}
