import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Storix — AI-Powered Affiliate Store Builder",
  description:
    "Build your own affiliate storefront in minutes. Paste links, generate AI-powered titles, and start earning from clicks.",
  keywords: ["affiliate", "store builder", "AI", "passive income", "storix"],
};

import { CursorFollower } from "@/components/ui/CursorFollower";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col noise-overlay">
        <CursorFollower />
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0A0A0A",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                color: "#F1F1F6",
              },
            }}
          />
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
