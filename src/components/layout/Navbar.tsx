"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import logo1 from "@/assets/svg/logo.svg";
import api from "@/lib/api/axios";

type NavUser = {
  name: string;
  username: string;
  avatarUrl: string | null;
};

type SearchUser = NavUser & { id: number };

function UserAvatar({
  user,
  size,
}: {
  user: NavUser | null | SearchUser;
  size: number;
}) {
  if (user?.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt={user.name || "avatar"}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-neutral-700 font-bold text-white"
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
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);
  const [showNavbar, setShowNavbar] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastScrollYRef = useRef(0);

  const currentUsername = user?.username ?? null;
  const trimmedQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoggedIn(false);
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get("/me");
        const raw = res.data?.data;
        const p = raw?.profile ?? raw;

        setIsLoggedIn(true);
        setUser({
          name: p?.name ?? "",
          username: p?.username ?? "",
          avatarUrl: p?.avatarUrl ?? null,
        });
      } catch {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    fetchUser();
  }, [pathname]);

  useEffect(() => {
    const controller = new AbortController();

    async function runSearch() {
      const q = trimmedQuery;

      if (!searchOpen) return;

      if (q.length < 2) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      try {
        setSearchLoading(true);

        const res = await api.get("/users/search", {
          params: { q, limit: 10 },
          signal: controller.signal,
        });

        const data =
          res.data?.data?.items ??
          res.data?.data?.users ??
          res.data?.data ??
          res.data?.users ??
          [];

        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.log(
            "SEARCH ERROR:",
            err.response?.status,
            err.response?.data,
          );
          if (err.code !== "ERR_CANCELED") {
            setSearchResults([]);
          }
        }
      } finally {
        setSearchLoading(false);
      }
    }

    const timer = setTimeout(runSearch, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery, searchOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }

      if (searchPanelRef.current && !searchPanelRef.current.contains(target)) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setShowNavbar(true);
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      if (searchOpen || dropdownOpen || menuOpen) {
        setShowNavbar(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY <= 10) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY) {
        setShowNavbar(false);
      } else if (currentScrollY < lastScrollY) {
        setShowNavbar(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [searchOpen, dropdownOpen, menuOpen]);

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
    setSearchResults([]);
    setSearchLoading(false);
    setShowNavbar(true);
  }

  function handleOpenSearch() {
    setSearchOpen(true);
    setDropdownOpen(false);
    setMenuOpen(false);
    setShowNavbar(true);
  }

  function handleSelectUser(username: string) {
    router.push(`/users/${username}`);
    handleCloseSearch();
  }

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full border-b border-neutral-800 bg-black/95 px-4 py-4 backdrop-blur transition-transform duration-300 sm:px-6 md:px-16 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link href="/feed" className="flex shrink-0 items-center gap-2">
            <Image src={logo1} alt="Sociality" width={32} height={32} />
            <span className="text-base font-bold text-white md:text-lg">
              Sociality
            </span>
          </Link>

          {/* Desktop search */}
          <div className="hidden flex-1 justify-center md:flex">
            <button
              onClick={handleOpenSearch}
              className="flex w-full max-w-md items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-4 py-2 text-left transition-colors hover:border-neutral-700 hover:bg-neutral-900"
              aria-label="Open search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0 text-neutral-500"
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

              <span className="truncate text-sm text-neutral-500">
                Search users
              </span>
            </button>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            {/* Mobile search button */}
            <button
              onClick={handleOpenSearch}
              className="text-neutral-400 transition-colors hover:text-white md:hidden"
              aria-label="Open search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
                <button
                  onClick={() => {
                    setDropdownOpen((prev) => !prev);
                    setMenuOpen(false);
                    setShowNavbar(true);
                  }}
                  aria-label="Open profile menu"
                  className="flex items-center gap-2 rounded-full md:pr-1"
                >
                  <UserAvatar user={user} size={32} />
                  <span className="hidden text-sm font-medium text-white md:block">
                    {user?.name ?? "User"}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 z-50 mt-3 w-52 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xl">
                    <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3">
                      <UserAvatar user={user} size={36} />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {user?.name ?? "User"}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          @{user?.username ?? ""}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3 text-neutral-300 transition-colors hover:bg-neutral-800"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-500 transition-colors hover:bg-neutral-800"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                onClick={() => {
                  setMenuOpen((prev) => !prev);
                  setDropdownOpen(false);
                  setShowNavbar(true);
                }}
                className="text-neutral-400 transition-colors hover:text-white"
                aria-label="Open menu"
              >
                {menuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                    className="h-5 w-5"
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

        {!isLoggedIn && !searchOpen && menuOpen && (
          <div className="mx-auto mt-4 flex max-w-5xl flex-col gap-2 pb-2">
            <div className="flex gap-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-xl border border-neutral-700 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-xl bg-violet-600 py-2 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </nav>

      {searchOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]" />

          <div className="fixed inset-x-0 top-18 z-50 px-4 sm:px-6">
            <div
              ref={searchPanelRef}
              className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl"
            >
              <div className="border-b border-neutral-800 p-4">
                <div className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 shrink-0 text-neutral-500"
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
                    placeholder="Search users"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                  />

                  {trimmedQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                        searchInputRef.current?.focus();
                      }}
                      className="text-neutral-500 transition-colors hover:text-white"
                      aria-label="Clear search"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                  )}

                  <button
                    onClick={handleCloseSearch}
                    className="ml-1 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                {searchLoading ? (
                  <div className="px-4 py-6 text-sm text-neutral-500">
                    Searching...
                  </div>
                ) : trimmedQuery.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-neutral-600">
                    Search by name or username.
                  </div>
                ) : trimmedQuery.length < 2 ? (
                  <div className="px-4 py-6 text-sm text-neutral-600">
                    Type at least 2 characters.
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-neutral-500">
                    No users found.
                  </div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((u) => {
                      const isMe = currentUsername === u.username;

                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSelectUser(u.username)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-900"
                        >
                          <UserAvatar user={u} size={44} />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-white">
                                {u.name}
                              </p>

                              {isMe && (
                                <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300">
                                  You
                                </span>
                              )}
                            </div>

                            <p className="truncate text-xs text-neutral-500">
                              @{u.username}
                            </p>
                          </div>

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-neutral-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
