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
};

export default function PuterChatDialog({ currentUserId }: Props) {
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
            let context = "";

            if (intent === "last-message") {
                const last = await callChatTool("last-message", currentUserId);
                context = `The user's last message was: "${last}".`;
            } else if (intent === "most-messaged") {
                const most = await callChatTool("most-messaged", currentUserId);
                context = `The user chats most frequently with: ${most}.`;
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
                <Button className="fixed bottom-6 right-6 rounded-full p-3 bg-green-600 text-white shadow-lg">
                <BotIcon className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] sm:max-w-md">
                <DialogTitle>Y e x y</DialogTitle>
                <div className="h-[400px] overflow-y-auto p-2 space-y-2 bg-gray-100">
                {msgs.map((m,i) => (
                    <div key={i}
                    className={`max-w-[80%] p-2 rounded text-sm ${
                        m.role === "user" ? "bg-green-200 ml-auto text-right" : "bg-white text-left"
                    }`}
                    >
                    {m.content}
                    </div>
                ))}
                <div ref={scrollRef} />
                </div>
                <div className="flex gap-2 mt-2">
                <input
                    value={inp}
                    onChange={(e) => setInp(e.target.value)}
                    onKeyDown={e=>e.key==="Enter" && send()}
                    className="flex-1 rounded border px-3 py-2"
                    placeholder="Ask AI…"
                />
                <Button onClick={send} disabled={!inp.trim()}>Send</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
