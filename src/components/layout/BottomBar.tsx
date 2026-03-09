"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import homeIcon from "@/assets/svg/home.svg";
import profileIcon from "@/assets/svg/frame.svg";

export default function BottomBar({ onHome }: { onHome?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setVisible(false); // scroll down → hide
      } else {
        setVisible(true); // scroll up → show
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`fixed bottom-6 left-0 right-0 z-50 px-6 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-32"
      }`}
    >
      <div className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-full px-8 py-1 shadow-2xl">
        {/* Home */}
        <button onClick={onHome} className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 flex items-center justify-center">
            <Image src={homeIcon} alt="Home" width={20} height={20} />
          </div>
          <span className="text-xs text-primary-200 font-medium">Home</span>
        </button>

        {/* Add Post */}
        <Link href="/add-post">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-violet-600 hover:bg-violet-500 transition-colors shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-white"
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
          </div>
        </Link>

        {/* Profile */}
        <Link href="/profile" className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
            <Image src={profileIcon} alt="Profile" width={20} height={20} />
          </div>
          <span className="text-xs text-neutral-400">Profile</span>
        </Link>
      </div>
    </div>
  );
}
