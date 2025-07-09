export function detectChatIntent(message: string): string {
    const msg = message.toLowerCase()

    if (msg.includes("last message")) return "last-message"
    if (msg.includes("who") && msg.includes("message the most")) return "most-messaged"
    if (msg.includes("how many messages")) return "message-count"
    if (msg.includes("summarize")) return "summarize-chat"
    if (msg.includes("talk about")) return "topic-summary"
    if (msg.includes("when did") && msg.includes("send")) return "message-timestamp"
    return "general"
}