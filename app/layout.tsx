import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fitness Platform",
  description: "Manage gyms and users",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Fitness Platform</h1>
            <div className="space-x-4">
              <a href="/" className="hover:underline">Home</a>
              <a href="/users" className="hover:underline">Users</a>
              <a href="/gyms" className="hover:underline">Gyms</a>
              <a href="/memberships" className="hover:underline">Memberships</a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
