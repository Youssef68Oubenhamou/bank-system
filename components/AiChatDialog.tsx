"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle , DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BotIcon } from "lucide-react"

export default function AiChatDialog() {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([])

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input }
        setMessages((prev) => [...prev, userMessage])
        setInput("")

        try {
            const res = await fetch("/api/ai-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            })

            const data = await res.json()
            setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
        } catch (error) {
            console.error("AI error:", error)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg bg-green-600 hover:bg-green-700 text-white">
                <BotIcon className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-md">
                <DialogTitle></DialogTitle>
                <div className="h-[400px] overflow-y-auto p-2 space-y-2">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`text-sm p-2 rounded ${msg.role === "user" ? "bg-green-100 text-right ml-auto w-fit" : "bg-gray-200 text-left mr-auto w-fit"}`}>
                    {msg.content}
                    </div>
                ))}
                </div>
                <div className="flex gap-2 mt-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask something..."
                    className="flex-1 rounded border px-3 py-2 text-sm outline-none"
                />
                <Button onClick={handleSend} disabled={!input.trim()}>Send</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
