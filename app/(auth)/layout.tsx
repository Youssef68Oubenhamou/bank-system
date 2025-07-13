import { Toaster } from "react-hot-toast";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main>

            <Toaster position="top-center" reverseOrder={false} />
            {children}

        </main>
    );
}