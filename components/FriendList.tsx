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
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Friends</h2>

            <div className="space-y-2">
                {users
                .filter((u) => u.$id !== currentUserId.$id)
                .map((user) => (
                    <button
                    key={user.$id}
                    onClick={() => startChat(user.$id)}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg bg-white hover:bg-gray-100 transition duration-150 border border-transparent hover:border-gray-300 shadow-sm hover:shadow-md"
                    >
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold uppercase">
                        {user.name.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-900 truncate">{user.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}


