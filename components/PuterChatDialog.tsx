"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BotIcon } from "lucide-react"
import { DialogTitle } from "@radix-ui/react-dialog"
import { detectChatIntent } from "@/lib/intent/detectChatIntent"

type ChatMessage = {
    role: "user" | "assistant" | "system";
    content: string;
}

type Props = {
    currentUserId: string;
    friendId?: string;
};

export default function PuterChatDialog({ currentUserId, friendId }: Props) {
    const [open, setOpen] = useState(false)
    const [inp, setInp] = useState("")
    const [msgs, setMsgs] = useState<ChatMessage[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [msgs])

    async function callChatTool(tool: string, userId: string, friendId?: string): Promise<string> {
        const res = await fetch("/api/chat-tools", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tool, userId, friendId }),
        })

        const data = await res.json()
        return data.result
    }

    const send = async () => {
        if (!inp.trim()) return;

        const userMsg: ChatMessage = { role: "user", content: inp };
        const updated: ChatMessage[] = [...msgs, userMsg];
        setMsgs(updated);
        setInp("");

        try {
            const intent = detectChatIntent(inp);
            let context = ""

            if (intent === "last-message") {
                const lastMessage = await callChatTool("last-message", currentUserId)
                context = `The user's last message was: "${lastMessage}".`
            } else if (intent === "most-messaged") {
                const mostMessaged = await callChatTool("most-messaged", currentUserId)
                context = `The user most frequently chats with: ${mostMessaged}.`
            } else if (intent === "message-count") {
                const count = await callChatTool("message-count", currentUserId)
                context = `The user has sent the following number of messages: ${count}.`
            } else if (intent === "last-message-from-friend") {
                const lastFromFriend = await callChatTool("last-message-from-friend", currentUserId , friendId)
                context = `The last message received from a friend was: "${lastFromFriend}".`
            } else if (intent === "summarize-chat") {
                const summary = await callChatTool("summarize-chat", currentUserId)
                context = `Chat summary: ${summary}`
            } else if (intent === "search-message") {
                const keyword = inp.split(" ").find(w => !["did", "i", "say", "mention"].includes(w.toLowerCase()))
                const foundMsg = await callChatTool("search-message", currentUserId, keyword)
                context = `Message containing "${keyword}": ${foundMsg}`
            } else if (intent === "message-timestamp") {
                const time = await callChatTool("message-timestamp", currentUserId)
                context = time
            }

            const response = await window.puter.ai.chat(
                [
                    ...(context ? [{ role: "system", content: context }] : []),
                    ...updated.map((m) => ({ role: m.role, content: m.content }))
                ] as { role: "user" | "assistant" | "system"; content: string }[]
            );

            const assistantReply =
            typeof response === "string"
                ? response
                : response?.message?.content ||
                response?.content ||
                JSON.stringify(response);

            setMsgs((prev) => [...prev, { role: "assistant", content: assistantReply }]);
        } catch (error) {
            console.error("❌ AI chat error:", error);
            setMsgs((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, something went wrong while responding.",
                },
            ]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="fixed bottom-6 right-6 rounded-full p-3 bg-green-600 hover:bg-green-700 text-white shadow-lg transition duration-200">
                <BotIcon className="w-5 h-5" />
                </Button>
            </DialogTrigger>

            <DialogContent className="w-full max-w-md rounded-2xl p-0 overflow-hidden border border-gray-200 shadow-xl">
                <div className="bg-green-600 text-white px-4 py-3 font-semibold text-lg">
                    <DialogTitle>My Name is YexeY</DialogTitle>
                </div>

                <div className="h-[400px] overflow-y-auto p-4 bg-gray-50 space-y-3">
                {msgs.map((m, i) => (
                    <div
                    key={i}
                    className={`max-w-[80%] px-4 py-2 text-sm rounded-2xl whitespace-pre-wrap break-words shadow-sm ${
                        m.role === "user"
                        ? "ml-auto bg-green-100 text-right"
                        : m.role === "assistant"
                        ? "bg-white text-left"
                        : "bg-gray-200 text-left"
                    }`}
                    >
                    {m.content}
                    </div>
                ))}
                <div ref={scrollRef} />
                </div>

                <div className="flex items-center gap-2 border-t bg-white px-4 py-3">
                <input
                    value={inp}
                    onChange={(e) => setInp(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ask me anything..."
                />
                <Button
                    onClick={send}
                    disabled={!inp.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:bg-gray-300"
                >
                    Send
                </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
