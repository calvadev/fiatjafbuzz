import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FiatjafBuzz",
  description: "Post a GM for fiatjaf",
  openGraph: {
    title: "FiatjafBuzz",
    description: "Post a GM for fiatjaf",
    type: "website",
    url: "https://fiatjafbuzz.com",
    images: "/favicon.jpg",
  },
  twitter: {
    card: "summary",
    title: "FiatjafBuzz",
    description: "Post a GM for fiatjaf",
    images: "/favicon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
