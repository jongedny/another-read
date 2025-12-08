import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Sidebar } from "./_components/sidebar";

export const metadata: Metadata = {
  title: "Another Read",
  description: "A modern event and book management application",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="bg-gray-950">
        <TRPCReactProvider>
          <Sidebar />
          <div className="ml-64">
            {children}
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
