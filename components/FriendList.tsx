"use client";

import { useRouter } from "next/navigation";

type Props = {
    currentUserId: { $id: string };
    users: { $id: string; name: string }[];
};

export default function FriendsList({ currentUserId, users }: Props) {
    const router = useRouter();

    const startChat = async (friendId: string) => {
        const res = await fetch("/api/chat/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userA: currentUserId.$id , userB: friendId }),
        });

        const data = await res.json();
        router.push(`/chat-room/${data.chatId}`);
    };

    return (
        <div className="w-64 border-r bg-white h-full p-4 overflow-y-auto">
            <h2 className="font-bold mb-4">Friends</h2>
            {users
                .filter((u) => u.$id !== currentUserId.$id)
                .map((user) => (
                <button
                    key={user.$id}
                    onClick={() => startChat(user.$id)}
                    className="block w-full text-left py-2 px-3 rounded hover:bg-gray-100"
                >
                    {user.name}
                </button>
                ))}
        </div>
    );
}


