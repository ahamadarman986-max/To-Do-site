import type { Metadata } from "next";
// Use standard system fonts or CSS imported fonts to avoid offline build issues
import "./globals.css";

import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "TaskFlow Pro - Productivity SaaS",
  description: "Professional full-stack to-do application for modern task management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans">
        <Providers>
          <Toaster position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
