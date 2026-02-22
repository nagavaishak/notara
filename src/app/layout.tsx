import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOTARA — Tamper-Proof Construction Verification",
  description:
    "Every construction document. Every approval. Every revision. Independently verifiable. Permanently recorded. Impossible to forge.",
  openGraph: {
    title: "NOTARA — Tamper-Proof Construction Verification",
    description:
      "Immutable verification for construction documents. Built on Solana.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
