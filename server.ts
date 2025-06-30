import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { Client , Databases , ID , Query } from "node-appwrite";
import dotenv from "dotenv"

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const {

    APPWRITE_DATABASE_ID : DATABASE_ID,
    APPWRITE_MESSAGE_COLLECTION_ID : MESSAGE_COLLECTION_ID,

} = process.env;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const appwriteClient = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_SECRET!);

const databases = new Databases(appwriteClient);

app.prepare().then(() => {
    const httpServer = createServer(handler);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("✅ Socket connected:", socket.id);

        // Listen to message sent from frontend
        socket.on("send-message", async (msg) => {
            try {
                // Save message to Appwrite
                const saved = await databases.createDocument(
                    DATABASE_ID!,           // databaseId
                    MESSAGE_COLLECTION_ID!, // collectionId
                    ID.unique(),
                    msg              // Must include: chatId, senderId, content, timestamp
                );

                // Broadcast to all clients except the sender
                socket.broadcast.emit("receive-message", saved);
            } catch (err) {
                console.error("❌ Error saving message to Appwrite:", err);
            }
        });
    });

    httpServer
        .once("error", (err) => {
            console.error("❌ Server error:", err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`🚀 Server ready at http://${hostname}:${port}`);
        });
});
