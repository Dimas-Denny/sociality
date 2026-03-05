"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import avatar from "@/assets/svg/avatar.svg";
import logo from "@/assets/svg/logo.svg";

function useIsLoggedIn() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return isLoggedIn;
}

function useUser() {
  const [user, setUser] = useState<{
    name: string;
    username: string;
    avatarUrl?: string;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return user;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isLoggedIn = useIsLoggedIn();
  const user = useUser();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setDropdownOpen(false);
    router.push("/login");
  }

  return (
    <nav className="w-full bg-neutral-950 border-b border-neutral-800 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2">
          <Image src={logo} alt="Sociality" width={30} height={30} />
          <span className="text-base-white font-bold text-lg">Sociality</span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Search Icon */}
          <button className="text-neutral-400 hover:text-base-white transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </button>

          {isLoggedIn ? (
            /* Avatar + Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                <Image
                  src={user?.avatarUrl ?? avatar}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="rounded-full object-cover cursor-pointer"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-neutral-800">
                    <p className="text-base-white text-sm font-semibold">
                      {user?.name ?? "User"}
                    </p>
                    <p className="text-neutral-500 text-xs mt-0.5">
                      @{user?.username ?? ""}
                    </p>
                  </div>

                  {/* Profile */}
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:bg-neutral-800 transition-colors border-b border-neutral-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-sm">Profile</span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-neutral-800 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Hamburger jika belum login */
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-neutral-400 hover:text-base-white transition-colors"
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Menu (belum login) */}
      {!isLoggedIn && menuOpen && (
        <div className="max-w-5xl mx-auto mt-4 flex flex-col gap-2 pb-2">
          <div className="flex gap-3">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center border border-neutral-700 text-base-white rounded-xl py-2 text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center bg-primary-300 text-white rounded-xl py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
