import type { Metadata } from "next";
import "./globals.css";
import Notify from "@/components/Notify";

export const metadata: Metadata = {
  title: "Orçamentos",
  description: "Sistema de orçamentos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Notify />
        {children}
      </body>
    </html>
  );
}
