import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvoiceAI — Professional Invoices in Seconds",
  description: "Create beautiful, professional PDF invoices instantly. Free to use. No signup required.",
  keywords: ["invoice generator", "free invoice", "PDF invoice", "freelancer invoice", "contractor invoice"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
