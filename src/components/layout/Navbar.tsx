"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import logo1 from "@/assets/png/logo1.png";
import api from "@/lib/api/axios";

type NavUser = {
  name: string;
  username: string;
  avatarUrl: string | null;
};

// ← Dipindah keluar dari komponen
function UserAvatar({ user, size }: { user: NavUser | null; size: number }) {
  if (user?.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt="avatar"
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-neutral-700 flex items-center justify-center text-white font-bold"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {user?.name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // ← tidak setState sync, biarkan default false/null

    // setState hanya di dalam async callback
    const fetchUser = async () => {
      try {
        const res = await api.get("/me");
        const raw = res.data?.data;
        const p = raw?.profile ?? raw;
        setIsLoggedIn(true);
        setUser({
          name: p.name ?? "",
          username: p.username ?? "",
          avatarUrl: p.avatarUrl ?? null,
        });
      } catch {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    fetchUser();
  }, [pathname]);

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

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setDropdownOpen(false);
    router.push("/login");
  }

  function handleCloseSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <nav className="w-full bg-black border-b border-neutral-800 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {searchOpen ? (
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center gap-2 flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-neutral-500 shrink-0"
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
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent text-white placeholder:text-neutral-500 text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={handleCloseSearch}
              className="text-neutral-400 hover:text-white transition-colors shrink-0"
            >
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
            </button>
          </div>
        ) : (
          <>
            <Link href="/feed" className="flex items-center gap-2">
              <Image src={logo1} alt="Sociality" width={40} height={40} />
              <span className="text-white font-bold text-lg">Sociality</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
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
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <UserAvatar user={user} size={32} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-52 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl z-50">
                      <div className="px-4 py-3 border-b border-neutral-800 flex items-center gap-3">
                        <UserAvatar user={user} size={36} />
                        <div>
                          <p className="text-white text-sm font-semibold">
                            {user?.name ?? "User"}
                          </p>
                          <p className="text-neutral-500 text-xs mt-0.5">
                            @{user?.username ?? ""}
                          </p>
                        </div>
                      </div>
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
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-neutral-400 hover:text-white transition-colors"
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
          </>
        )}
      </div>

      {!searchOpen && !isLoggedIn && menuOpen && (
        <div className="max-w-5xl mx-auto mt-4 flex flex-col gap-2 pb-2">
          <div className="flex gap-3">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center border border-neutral-700 text-white rounded-xl py-2 text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center bg-violet-600 text-white rounded-xl py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
