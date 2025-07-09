import { Query } from 'node-appwrite';
import { createAdminClient } from '../appwrite';
import dotenv from "dotenv";
import { getBalance } from './user.actions';
import { getAccounts } from './bank.actions';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const TRANSACTION_COLLECTION_ID = process.env.APPWRITE_TRANSACTION_COLLECTION_ID!;
const BANK_COLLECTION_ID = process.env.APPWRITE_BANK_COLLECTION_ID!;

export const getUserReport = async ({ userId }: { userId: string }) => {
    const { database } = await createAdminClient();

    const txRes = await database.listDocuments(
        DATABASE_ID!,
        TRANSACTION_COLLECTION_ID!,
        [
            Query.or([
                Query.equal("senderId", userId),
                Query.equal("receiverId", userId),
            ]),
            Query.limit(100),
            Query.orderDesc("$createdAt"),
        ]
    );

    const transactions = txRes.documents;

    const totalSent = transactions
        .filter((tx) => tx.senderId === userId)
        .reduce((sum, tx) => sum + parseFloat(tx.amount?.toString().trim() || "0"), 0);

    const totalReceived = transactions
        .filter((tx) => tx.receiverId === userId)
        .reduce((sum, tx) => sum + parseFloat(tx.amount?.toString().trim() || "0"), 0);

    const accounts = await getAccounts({ userId });

    console.log(accounts?.data);

    let fType;
    let fValue
    let sType;
    let sValue;

    if (accounts?.data.length > 1) {

        if (accounts?.data[0].name == "Plaid Checking") {
    
            fType = accounts?.data[0].name;
            fValue = accounts?.data[0].currentBalance;
            sType = accounts?.data[1].name;
            sValue = accounts?.data[1].currentBalance;
    
        } else {
    
            fType = accounts?.data[1].name;
            fValue = accounts?.data[1].currentBalance;
            sType = accounts?.data[0].name;
            sValue = accounts?.data[0].currentBalance;
    
        }
        
        return {
            totalSent: totalSent.toFixed(2),
            totalReceived: totalReceived.toFixed(2),
            fType: fValue,
            sType: sValue,
            balance: accounts?.totalCurrentBalance
        };

    } else {

        if (accounts?.data[0]) {
    
            fType = accounts?.data[0].name;
            fValue = accounts?.data[0].currentBalance;
            
        }
        
        return {
            totalSent: totalSent.toFixed(2),
            totalReceived: totalReceived.toFixed(2),
            fType: fValue,
            balance: accounts?.totalCurrentBalance
        };

    }


};
