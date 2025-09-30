import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import type { ReactNode } from "react";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { AutumnClientProvider } from "./AutmnClientProvider";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Shopping Assistant",
  description: "Shopping Assistant",
  manifest: "/favicons/site.webmanifest",
  appleWebApp: {
    title: "Shopping Assistant",
  },
  icons: {
    icon: [
      { url: "/favicons/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicons/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicons/favicon.ico"],
    apple: [{ url: "/favicons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
        <head></head>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <AutumnClientProvider>
                <SidebarProvider>
                  <AppSidebar />

                  <SidebarInset className="relative">
                    <div className="bg-card absolute top-0 left-0 z-10 rounded-t-none rounded-l-none">
                      <SidebarTrigger className="rounded-t-none rounded-l-none p-6" />
                    </div>
                    {children}
                  </SidebarInset>
                </SidebarProvider>
              </AutumnClientProvider>
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
