import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Perspectives — See Every Side",
  description: "An unbiased platform to explore political issues from every angle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
