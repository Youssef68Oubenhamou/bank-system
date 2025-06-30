import { createAdminClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
        return new Response(JSON.stringify({ error: "Chat ID is required" }), {
            status: 400,
        });
    }

    const { database } = await createAdminClient();

    const messages = await database.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_MESSAGE_COLLECTION_ID!,
        [Query.equal("chatId", chatId), Query.orderAsc("timestamp")]
    );

    return Response.json({ messages: messages.documents });
}
