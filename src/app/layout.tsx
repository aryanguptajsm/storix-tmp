import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Storix — AI-Powered Affiliate Store Builder",
  description:
    "Build your own affiliate storefront in minutes. Paste links, generate AI-powered titles, and start earning from clicks.",
  keywords: ["affiliate", "store builder", "AI", "passive income", "storix"],
};

import { MeshBackground } from "@/components/ui/MeshBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('storix-app-mode');
                  var mode = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
                  document.documentElement.setAttribute('data-app-theme', mode);
                } catch (e) {
                  document.documentElement.setAttribute('data-app-theme', 'dark');
                }
              })();
            `,
          }}
        />
        <MeshBackground />
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0A0A0A",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                color: "#F1F1F6",
                borderRadius: "4px",
              },
            }}
          />

        </ThemeProvider>
      </body>
    </html>
  );
}
