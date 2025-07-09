import type { Metadata } from "next";
import { Geist, Geist_Mono , IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/components/SocketProvider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ibmPlexSerif = IBM_Plex_Serif({

    variable: "--font-ibm-plex-serif",
    subsets: ["latin"],
    weight: ["400" , "700"]

})

export const metadata: Metadata = {
  title: "YouX Bank",
  description: "YouX Bank is a modern Bank Web Application that can let perform complex operations.description: AI chat with Puter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
              <Script
                src="https://js.puter.com/v2/"
                strategy="afterInteractive"
              />
            </head>
            <body
              className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSerif.variable} antialiased`}
            >
                <SocketProvider>
                    {children}
                </SocketProvider>
            </body>
        </html>
    );
}
