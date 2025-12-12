"use client";

import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const metadata: Metadata = {
  title: "Fitness Platform",
  description: "Manage gyms and users",
};

function NavBar() {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/signin');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">Fitness Platform</Link>
        <div className="space-x-4">
          {isAuthenticated && (
            <>
              <Link href="/" className={`hover:underline ${pathname === '/' ? 'font-bold' : ''}`}>Home</Link>
              <Link href="/gyms" className={`hover:underline ${pathname === '/gyms' ? 'font-bold' : ''}`}>Gyms</Link>
              <Link href="/memberships" className={`hover:underline ${pathname === '/memberships' ? 'font-bold' : ''}`}>Memberships</Link>
              <button 
                onClick={handleLogout}
                className="hover:underline bg-red-600 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link href="/signin" className={`hover:underline ${pathname === '/signin' ? 'font-bold' : ''}`}>Sign In</Link>
              <Link href="/signup" className={`hover:underline ${pathname === '/signup' ? 'font-bold' : ''}`}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <NavBar />
          <main className="container mx-auto p-4">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
