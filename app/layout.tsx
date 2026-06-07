import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ToastListener } from "@/components/shared/ToastListener";
import "./globals.css";

export const metadata: Metadata = {
  title: "HL Internal Finance",
  description: "Aplikasi internal manajemen pelanggan, produk, transaksi, dan laporan bisnis HL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" richColors closeButton />
        <ToastListener />
      </body>
    </html>
  );
}
