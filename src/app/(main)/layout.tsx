"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isProfilePage =
    pathname === "/profile" || pathname.startsWith("/users/");

  return (
    <div className="min-h-screen bg-black">
      {isProfilePage ? (
        <>
          <div className="hidden md:block">
            <Navbar />
          </div>
          <main>{children}</main>
        </>
      ) : (
        <>
          <Navbar />
          <main>{children}</main>
        </>
      )}
    </div>
  );
}
