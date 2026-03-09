import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/shared/WalletProvider";
import { WalletNavButton } from "@/components/shared/WalletNavButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GlowCards",
  description: "Minimalist DeFi Gift Cards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-white/20 selection:text-white min-h-screen bg-black`}
      >
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] flex items-center justify-center">
          <div className="absolute w-[800px] h-[800px] bg-white opacity-[0.02] rounded-full blur-[150px]"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500 opacity-[0.05] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500 opacity-[0.03] rounded-full blur-[120px]"></div>
        </div>
        <WalletProvider>
          <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
            <nav className="absolute top-0 w-full p-6 flex justify-end max-w-5xl">
              <WalletNavButton />
            </nav>
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
