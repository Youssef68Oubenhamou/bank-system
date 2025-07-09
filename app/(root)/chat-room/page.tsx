import Chat from '@/components/Chat'
import FriendsList from '@/components/FriendList';
import HeaderBox from '@/components/HeaderBox'
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { createAdminClient } from '@/lib/appwrite';
import React from 'react'
import dotenv from "dotenv"

const ChatRoom = async ({ params }: { params: { chatId: string } }) => {

    dotenv.config();

    const { database } = await createAdminClient();

    const users = await database.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USER_COLLECTION_ID!
    );

    const currentUser = await getLoggedInUser();

    console.log(`The users are : ${users.documents[1]}`)

    return (
        <section className="flex flex-row">
            <FriendsList currentUserId={currentUser} users={users.documents.map((doc) => ({
                $id: doc.$id,
                name: `${doc.firstName} ${doc.lastName}`,
            }))} />
            {/* <Chat currentUserId={currentUser.$id} chatId={params.chatId} /> */}
        </section>
    )
}

export default ChatRoom