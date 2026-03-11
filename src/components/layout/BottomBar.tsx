"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import homeIcon from "@/assets/svg/home.svg";
import frameIcon from "@/assets/svg/frame.svg";

export default function BottomBar({ onHome }: { onHome?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleHome = () => {
    if (onHome) {
      onHome();
    }

    if (pathname === "/feed") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/feed");
    }
  };

  const handleProfile = () => {
    if (pathname === "/profile") {
      router.push("/feed");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    } else {
      router.push("/profile");
    }
  };

  const isProfile = pathname === "/profile";

  return (
    <div
      className={`fixed bottom-6 left-0 right-0 z-50 px-6 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-32"
      }`}
    >
      <div className="mx-auto w-full max-w-[320px] rounded-full border border-neutral-800 bg-neutral-950 px-8 shadow-2xl md:max-w-55 md:px-5">
        <div className="flex items-center justify-between">
          <button
            onClick={handleHome}
            className="flex flex-col items-center gap-1 py-2 md:gap-0.5 md:py-1.5"
          >
            <div className="flex h-10 w-10 items-center justify-center md:h-8 md:w-8">
              <Image
                src={homeIcon}
                alt="Home"
                width={20}
                height={20}
                className="md:h-4 md:w-4"
              />
            </div>
            <span className="text-xs font-medium text-primary-200 md:text-[10px]">
              Home
            </span>
          </button>

          <button
            onClick={() => router.push("/add-post")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 shadow-lg transition-colors hover:bg-violet-500 md:h-8 md:w-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white md:h-4 md:w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          <button
            onClick={handleProfile}
            className="flex flex-col items-center gap-1 py-2 md:gap-0.5 md:py-1.5"
          >
            <div className="flex h-10 w-10 items-center justify-center transition-colors md:h-8 md:w-8">
              <Image
                src={frameIcon}
                alt="Profile"
                width={20}
                height={20}
                className="md:h-4 md:w-4"
              />
            </div>
            <span
              className={`text-xs font-medium md:text-[10px] ${
                isProfile ? "text-primary-200" : "text-neutral-400"
              }`}
            >
              Profile
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
