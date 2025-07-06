import { createAdminClient } from '@/lib/appwrite';
import { Query } from 'node-appwrite';
import dotenv from "dotenv";

dotenv.config();

const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID
} = process.env;

export const getTopRecipient = async ({ userId }: { userId: string }) => {

    const { database } = await createAdminClient();

    const res = await database.listDocuments(
        DATABASE_ID!,
        TRANSACTION_COLLECTION_ID!,
        [
            Query.equal('senderId', [userId]),
        ]
    );

    const txs = res.documents;

    const frequencyMap = new Map();

    txs.forEach(tx => {
        const name = tx.name ?? tx.receiverId;
        frequencyMap.set(name, (frequencyMap.get(name) || 0) + 1);
    });

    const sorted = [...frequencyMap.entries()].sort((a, b) => b[1] - a[1]);

    if (!sorted.length) return null;

    return {
        name: sorted[0][0],
        count: sorted[0][1],
    };
};
