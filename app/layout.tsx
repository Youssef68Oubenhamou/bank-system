import type { Metadata } from "next";
import { Geist, Geist_Mono , IBM_Plex_Serif } from "next/font/google";
import "./globals.css";

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
  description: "YouX Bank is a modern Bank Web Application that can let perform complex operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
