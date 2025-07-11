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

        const {  

            APPWRITE_DATABASE_ID : DATABASE_ID,
            APPWRITE_USER_COLLECTION_ID : USER_COLLECTION_ID,
            APPWRITE_MESSAGE_COLLECTION_ID : MESSAGE_COLLECTION_ID,
            APPWRITE_CHAT_COLLECTION_ID : CHAT_COLLECTION_ID,

        } = process.env ;

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
                console.log("Hello World !");

                const res = await database.listDocuments(
                    DATABASE_ID!,
                    MESSAGE_COLLECTION_ID!,
                    [Query.equal("senderId", userId), Query.limit(100)]
                );

                const freqMap: Record<string, number> = {};

                for (const msg of res.documents) {
                    const chat = msg.chatId;

                    if (chat && chat.firstUser && chat.secondUser) {
                        const receiverId = chat.firstUser === userId ? chat.secondUser : chat.firstUser;

                        if (receiverId) {
                            freqMap[receiverId] = (freqMap[receiverId] || 0) + 1;
                        }
                    }
                }

                const top = Object.entries(freqMap).sort((a, b) => b[1] - a[1])[0];

                if (!top) {
                    return NextResponse.json({ result: "No contacts found." });
                }

                const receiverId = top[0];
                const count = top[1];

                let receiverName = "Unknown user";
                try {
                    console.log("Fetching user:", receiverId);

                    const userDoc = await database.getDocument(
                        DATABASE_ID!,
                        USER_COLLECTION_ID!,
                        receiverId
                    );
                    receiverName = `${userDoc?.firstName} ${userDoc?.lastName}` || receiverName;
                } catch (err) {
                    console.warn("❌ Failed to get user doc:", err);
                }

                return NextResponse.json({
                    result: `${receiverName} (${count} messages)`
                });
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

                if (!friendId) return NextResponse.json({ result: "Friend ID is required" });

                const res = await database.listDocuments(DATABASE_ID!, MESSAGE_COLLECTION_ID!, [
                    Query.equal("senderId", friendId),
                    Query.limit(100),
                    Query.orderDesc("timestamp"),
                ]);

                const filtered = res.documents.find(doc => {
                    const chat = doc.chatId;
                    return chat && (
                        (chat.firstUser === friendId && chat.secondUser === userId) ||
                        (chat.firstUser === userId && chat.secondUser === friendId)
                    );
                });

                return NextResponse.json({
                    result: filtered?.content || "No message found from friend."
                });
            }

            case "summarize-chat": {
                const res = await database.listDocuments(DB_ID, COL_ID, [
                    Query.equal("senderId", userId),
                    Query.limit(20),
                    Query.orderDesc("timestamp")
                ])
                const conversation = res.documents.map(doc => doc.content).reverse().join("\n")
                return NextResponse.json({ result: `Summary: ${conversation}` }) // You can improve this later with AI
            }

            case "search-message": {
                const res = await database.listDocuments(DB_ID, COL_ID, [
                    Query.equal("senderId", userId),
                    Query.limit(100)
                ])
                const found = res.documents.find(doc => doc.content.toLowerCase().includes(friendId?.toLowerCase() || ""))
                return NextResponse.json({ result: found?.content || "No message matched your search." })
            }

            case "message-timestamp": {
                const res = await database.listDocuments(DB_ID, COL_ID, [
                    Query.equal("senderId", userId),
                    Query.orderDesc("timestamp"),
                    Query.limit(1)
                ])
                const time = res.documents[0]?.timestamp
                return NextResponse.json({ result: time ? `You last messaged at ${new Date(time).toLocaleString()}` : "No message found." })
            }

            default:
                return NextResponse.json({ error: "Unknown tool" }, { status: 400 })
        }
    } catch (err) {
        console.error("❌ Tool API Error:", err)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
