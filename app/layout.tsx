import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientRoot from "../components/ClientRoot";
import { UserProvider } from "../components/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/icon.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <UserProvider>
          <ClientRoot>{children}</ClientRoot>
        </UserProvider>
      </body>
      
    </html>
  );
}
