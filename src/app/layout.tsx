import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ErrorBoundary } from "@/components/error-boundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NullRift UI - AI-Powered Component Designer",
  description: "Turn ideas into interactive UI in seconds. AI-powered component designer with instant code export. Powered by watsonx.ai.",
  keywords: ["AI", "UI", "components", "React", "Next.js", "watsonx.ai", "code generation"],
  authors: [{ name: "NullRift Team" }],
  openGraph: {
    title: "NullRift UI - AI-Powered Component Designer",
    description: "Turn ideas into interactive UI in seconds",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-deep-space antialiased")}>
        <ErrorBoundary>
          {children}
          <ToastProvider />
        </ErrorBoundary>
      </body>
    </html>
  );
}

// Made with Bob
