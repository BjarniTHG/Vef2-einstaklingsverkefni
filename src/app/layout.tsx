import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "Bjarni",
  description: "nextjs er frekar töff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
        <Header/>
        <main className="flex-grow">{children}</main>
        <Footer/>
        </AuthProvider>
      </body>
    </html>
  );
}
