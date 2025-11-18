import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RUTICK - Riara University Event Management",
  description: "Complete event management and ticketing platform for Riara University",
  keywords: ["events", "tickets", "riara university", "event management"],
  authors: [{ name: "RUTICK Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              },
              success: {
                iconTheme: {
                  primary: '#059669',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid #10b981',
                },
              },
              error: {
                iconTheme: {
                  primary: '#dc2626',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid #ef4444',
                },
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}