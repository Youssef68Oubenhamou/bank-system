// app/api/chat-tools/route.ts
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/appwrite"
import { Query } from "node-appwrite"
import dotenv from "dotenv"

dotenv.config()

export async function POST(req: Request) {
    try {
        const { userId, tool, friendId } = await req.json()

        if (!userId || !tool) {
            return NextResponse.json({ error: "Missing userId or tool" }, { status: 400 })
        }

        const { database } = await createAdminClient()
        const DB_ID = process.env.APPWRITE_DATABASE_ID!
        const COL_ID = process.env.APPWRITE_MESSAGE_COLLECTION_ID!

        switch (tool) {
            case "last-message": {
                const res = await database.listDocuments(DB_ID, COL_ID, [
                Query.equal("senderId", userId),
                Query.orderDesc("timestamp"),
                Query.limit(1)
                ])
                return NextResponse.json({ result: res.documents[0]?.content || "No message found." })
            }

            case "most-messaged": {
                const res = await database.listDocuments(DB_ID, COL_ID, [
                Query.equal("senderId", userId),
                Query.limit(100)
                ])

                const freqMap: Record<string, number> = {}
                for (const msg of res.documents) {
                freqMap[msg.receiverId] = (freqMap[msg.receiverId] || 0) + 1
                }

                const top = Object.entries(freqMap).sort((a, b) => b[1] - a[1])[0]
                return NextResponse.json({
                result: top ? `User ${top[0]} (${top[1]} messages)` : "No contacts found."
                })
            }

            case "message-count": {
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                const res = await database.listDocuments(DB_ID, COL_ID, [
                    Query.equal("senderId", userId),
                    Query.greaterThan("timestamp", today.toISOString())
                ])

                return NextResponse.json({ result: `You've sent ${res.documents.length} messages today.` })

            }

            case "last-message-from-friend": {
                if (!friendId) return NextResponse.json({ result: "Friend ID is required" })

                const res = await database.listDocuments(DB_ID, COL_ID, [
                    Query.equal("senderId", friendId),
                    Query.equal("receiverId", userId),
                    Query.orderDesc("timestamp"),
                    Query.limit(1)
                ])

                return NextResponse.json({ result: res.documents[0]?.content || "No message found from friend." })
            }

            default:
                return NextResponse.json({ error: "Unknown tool" }, { status: 400 })
        }
    } catch (err) {
        console.error("❌ Tool API Error:", err)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
