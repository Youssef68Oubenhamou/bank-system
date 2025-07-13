import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import Image from "next/image";
import { redirect } from "next/navigation"
import { Toaster } from "react-hot-toast";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {


    const loggedIn = await getLoggedInUser();

    if (!loggedIn) {

        redirect("/login");

    }

    return (
        <main className="flex h-screen w-full font-inter">

            <Sidebar user={loggedIn} />
            <div className="flex size-full flex-col">
                <div className="root-layout">
                    <Image src="/icons/mastercard.svg"
                        width={30}
                        height={30}
                        alt="logo icon"
                    />
                    <div>
                        <MobileNav user={loggedIn} />
                    </div>
                </div>
                <Toaster position="top-center" reverseOrder={false} />
                {children}
            </div>

        </main>
    );
}