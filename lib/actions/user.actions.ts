"use server"

import { AppwriteException, ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId , extractCustomerIdFromUrl , parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient } from "@/lib/plaid"
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {  

    APPWRITE_DATABASE_ID : DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID : USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID : BANK_COLLECTION_ID,
    APPWRITE_CHAT_COLLECTION_ID : CHAT_COLLECTION_ID,

} = process.env ;

export async function isChatExist(req: Request) {
    try {
        const { userA, userB } = await req.json();

        const { database } = await createAdminClient();

        console.log("✅ Received userA:", userA);
        console.log("✅ Received userB:", userB);

        // Check if chat already exists between userA and userB
        const existing = await database.listDocuments(
            DATABASE_ID!,
            CHAT_COLLECTION_ID!,
            [
                Query.or([
                    Query.and([Query.equal("firstUser", userA), Query.equal("secondUser", userB)]),
                    Query.and([Query.equal("firstUser", userB), Query.equal("secondUser", userA)]),
                ])
            ]
        );

        if (existing.total > 0) {
            return parseStringify({ chatId: existing.documents[0].$id });
        }

        // Create new chat if not found
        const newChat = await database.createDocument(
            DATABASE_ID!,
            CHAT_COLLECTION_ID!,
            ID.unique(),
            {
                firstUser: userA,
                secondUser: userB,
                lastMessage: ""
            }
        );

        return parseStringify({ chatId: newChat.$id });
    } catch (error) {

        console.error("❌ Error in /api/chat/start:", error);
        return { error: "Failed to create or fetch chat." , status: 500 };

    }
}


// This function is Done !
export const getUserInfo = async ({ userId }: getUserInfoProps) => {
    try {
        const { database } = await createAdminClient();

        const user = await database.listDocuments(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            [Query.equal('userId', [userId])]
        )

        return parseStringify(user.documents[0]);
    } catch (error) {
        console.log(error);
    }
}

// This function is Done !
export const signIn = async ({ email , password }: signInProps) => {

    try {

        const { account } = await createAdminClient();

        const session = await account.createEmailPasswordSession(email, password);

        (await cookies()).set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        
        const user = await getUserInfo({ userId: session.userId });
        return parseStringify(user);
    
    } catch (error) {

        const err = error as AppwriteException;

        if (err.code === 401) {

            if (err.message.includes("Invalid credentials")) {
                return { error: "Incorrect email or password." };
            }
        }

        if (err.code === 404) {
            return { error: "User not found." };
        }

        console.error("SignIn Error:", err);
        return { error: "Something went wrong. Please try again." };

    }

}

// This function is Done !
export const signUp = async ({ password, ...userData }: SignUpParams) => {

    const { email , firstName , lastName } = userData;

    let newUserAccount;

    try {

        const { account , database } = await createAdminClient();

        newUserAccount = await account.create(
            ID.unique(),
            email,
            password,
            `${firstName} ${lastName}`
        );

        if (!newUserAccount) throw new Error("Error creating user");

        const dwollaCustomerUrl = await createDwollaCustomer({

            ...userData,
            type: "personal"

        });

        if (!dwollaCustomerUrl) throw new Error("Error creating Dwolla customer !");

        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

        console.log(`database id : ${DATABASE_ID}`)

        const newUser = await database.createDocument(

            DATABASE_ID!,
            USER_COLLECTION_ID!,
            ID.unique(),
            {

                ...userData,
                userId: newUserAccount.$id,
                dwollaCustomerId,
                dwollaCustomerUrl

            }

        );

        const session = await account.createEmailPasswordSession(email, password);

        (await cookies()).set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return parseStringify(newUser)
            
    } catch (error) {

        const err = error as AppwriteException;

        if (err.code === 409 && err.message.includes("already exists")) {
            return { error: "This email is not valid. Please use a different one." };
        }

        console.error("SignUp Error:", err);
        return { error: "Something went wrong during sign-up. Please try again." };

    }

}

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        const result = await account.get();
        const user = await getUserInfo({ userId: result.$id })
        return parseStringify(user);
    } catch (error) {
        return null;
    }
}

export const logoutAccount = async () => {

    try {

        const { account } = await createSessionClient();

        (await cookies()).delete("appwrite-session");

        await account.deleteSession("current");

    } catch(err) {

        return null;

    }
 
}

//                                                   /
// This function is made to create the Plaid token \/
export const createLinkToken = async (user: User) => {
    try {
        const tokenParams = {
            user: {
                client_user_id: user?.$id
            },
            client_name: `${user?.firstName} ${user?.lastName}`,
            products: ['auth' , 'transactions'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[],
        }

        const response = await plaidClient.linkTokenCreate(tokenParams);

        return parseStringify({ linkToken: response.data.link_token })
    } catch (error) {
        console.log(error);
    }
}

// This functions is Done !
export const createBankAccount = async ({
    userId,
    bankId,
    accountId,
    accessToken,
    fundingSourceUrl,
    shareableId,
    balance,
}: createBankAccountProps) => {
    try {
        const { database } = await createAdminClient();

        const bankAccount = await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                shareableId,
                balance
            }
        );

        return parseStringify(bankAccount);

    } catch (error) {
        console.log(error);
    }
}

export const getBalance = async ({ userId }: { userId: string }) => {

    const { database } = await createAdminClient();

    const res = await database.listDocuments(
        DATABASE_ID!,
        BANK_COLLECTION_ID!,
        [Query.equal('userId', [userId])]
    );

    const total = res.documents.reduce((sum, bank) => {
        const bal = bank.balance ?? 0;
        return sum + bal;
    }, 0);

    return total.toFixed(2);
};

// This function is done !
export const exchangePublicToken = async ({
    publicToken,
    user,
}: exchangePublicTokenProps) => {
    try {
        // Exchange public token for access token and item ID
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;
        
        // Get account information from Plaid using the access token
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const accountData = accountsResponse.data.accounts[0];

        // Create a processor token for Dwolla using the access token and account ID
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        };

        console.log("processorTokenCreate request:", request);

        const processorTokenResponse = await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;

        // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name,
        });
        
        // If the funding source URL is not created, throw an error
        if (!fundingSourceUrl) throw Error;

        const balance = accountData.balances.available || accountData.balances.current || 0;

        // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and shareableId ID
        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            shareableId: encryptId(accountData.account_id),
            balance,
        });

        // Revalidate the path to reflect the changes
        revalidatePath("/");

        // Return a success message
        return parseStringify({
            publicTokenExchange: "complete",
        });
    } catch (error: any) {
        console.error("Plaid error response:", error.response?.data || error);
        console.error("An error occurred while exchanging token.");
    }
}

export const getBanks = async ({ userId }: getBanksProps) => {
    try {
        const { database } = await createAdminClient();

        if (!userId) {

            return [];

        }

        const banks = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('userId', [userId])]
        )

        return parseStringify(banks.documents);
    } catch (error) {

        console.log(error)

    }
}

export const getBank = async ({ documentId }: getBankProps) => {
    try {
        const { database } = await createAdminClient();

        if (!documentId) {

            return [];

        }

        const bank = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('$id', [documentId])]
        )

        return parseStringify(bank.documents[0]);
    } catch (error) {
        console.log(error);
    }
}

export const getBankByAccountId = async ({ accountId }: getBankByAccountIdProps) => {
    try {
        const { database } = await createAdminClient();

        if (!accountId) {

            return [];

        }

        const bank = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('accountId', [accountId])]
        )

        if (bank.total !== 1) {

            return null;

        }

        return parseStringify(bank.documents[0]);
    } catch (error) {
        console.log(error);
    }
}