export function detectChatIntent(message: string): string {
    const msg = message.toLowerCase()

    // LAST MESSAGE
    if (
        msg.includes("last message") ||
        msg.includes("what did i send last") ||
        msg.includes("last thing i said") ||
        msg.includes("show me my last message")
    ) {
        return "last-message"
    }

    // MOST MESSAGED
    if (
        msg.includes("who do i message the most") ||
        msg.includes("top contact") ||
        msg.includes("talk to the most") ||
        msg.includes("chatted with the most")
    ) {
        return "most-messaged"
    }

    // MESSAGE COUNT
    if (
        msg.includes("how many messages") ||
        msg.includes("message count") ||
        msg.includes("how active") ||
        msg.includes("total messages")
    ) {
        return "message-count"
    }

    if (
        msg.includes("what was the last message i received") ||
        msg.includes("who last messaged me") ||
        msg.includes("my friend say last") ||
        msg.includes("recent message i got")
    ) {
        return "last-message-from-friend"
    }

    if (msg.includes("summarize") || msg.includes("what was my chat with")) {
        return "summarize-chat"
    }

    if (
        msg.includes("mention") ||
        msg.includes("show me the message") ||
        msg.includes("what did i say about")
    ) {
        return "search-message"
    }

    // TIME-BASED
    if (
        msg.includes("when did") ||
        msg.includes("what time did i send") ||
        msg.includes("on friday")
    ) {
        return "message-timestamp"
    }

    return "general"
}