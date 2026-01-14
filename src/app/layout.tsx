import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CSIR-SERC Recruitment Portal - Join Our Team",
  description: "Official CSIR-SERC Recruitment Portal - Apply for exciting opportunities in structural engineering research",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
