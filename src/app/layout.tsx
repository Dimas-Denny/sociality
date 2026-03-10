import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers/Providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Sociality",
  description: "A modern social media platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}

          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
