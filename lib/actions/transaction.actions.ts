"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";
import { getBank } from "./user.actions";

const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID
} = process.env;

export const getLatestTransaction = async ({ userId }: { userId: string }) => {

    const { database } = await createAdminClient();

    const res = await database.listDocuments(
        DATABASE_ID!,
        TRANSACTION_COLLECTION_ID!,
        [
            Query.or([
                Query.equal('senderId', [userId]),
                Query.equal('receiverId', [userId])
            ]),
            Query.orderDesc('$createdAt'),
            Query.limit(1),
        ]
    );

    const tx = res.documents[0];
    if (!tx) return null;

    const isSender = tx.senderId === userId;

    return {
        name: tx.name ?? (isSender ? tx.receiverId : tx.senderId),
        date: tx.$createdAt,
        type: isSender ? 'sent' : 'received',
        amount: tx.amount,
        currency: tx.currency || 'USD',
    };
};

export const createTransaction = async (transaction: CreateTransactionProps) => {
    try {
        const { database } = await createAdminClient();

        const { isTest , ...transactionData } = transaction;

        console.log("📦 DATABASE_ID:", DATABASE_ID);
        console.log("🧾 TRANSACTION_COLLECTION_ID:", TRANSACTION_COLLECTION_ID);

        const newTransaction = await database.createDocument(
            DATABASE_ID!,
            TRANSACTION_COLLECTION_ID!,
            ID.unique(),
            {
                channel: 'online',
                category: 'Transfer',
                ...transactionData
            }
        )

        if (transaction.isTest) {
            // Update sender balance
            if (transaction.senderBankId) {
                const sender = await getBank({ documentId: transaction.senderBankId });
                await database.updateDocument(DATABASE_ID!, BANK_COLLECTION_ID!, sender.$id, {
                    balance: parseFloat((sender.balance - parseFloat(transaction.amount)).toFixed(2)),
                });
            }

            // Update receiver balance
            if (transaction.receiverBankId) {
                const receiver = await getBank({ documentId: transaction.receiverBankId });
                await database.updateDocument(DATABASE_ID!, BANK_COLLECTION_ID!, receiver.$id, {
                    balance: parseFloat((receiver.balance + parseFloat(transaction.amount)).toFixed(2)),
                });
            }
        }

        return parseStringify(newTransaction);
    } catch (error) {
        console.log(error);
    }
}

export const getTransactionsByBankId = async ({bankId}: getTransactionsByBankIdProps) => {
    try {
        const { database } = await createAdminClient();

        const senderTransactions = await database.listDocuments(
        DATABASE_ID!,
        TRANSACTION_COLLECTION_ID!,
        [Query.equal('senderBankId', bankId)],
        )

        const receiverTransactions = await database.listDocuments(
        DATABASE_ID!,
        TRANSACTION_COLLECTION_ID!,
        [Query.equal('receiverBankId', bankId)],
        );

        const transactions = {
        total: senderTransactions.total + receiverTransactions.total,
        documents: [
            ...senderTransactions.documents, 
            ...receiverTransactions.documents,
        ]
        }

        return parseStringify(transactions);
    } catch (error) {
        console.log(error);
    }
}