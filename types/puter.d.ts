export {}

declare global {
    interface Window {
        puter: {
            ai: {
                chat: (
                    messages: { role: "user" | "assistant" | "system"; content: string }[],
                    options?: { stream?: boolean }
                ) => Promise<
                  | string
                  | {
                      message?: { role: string; content: string }
                      content?: string
                      [key: string]: any
                    }
                >
            }
        }
    }
}