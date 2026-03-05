import Image from "next/image";
import Link from "next/link";
import logo1 from "@/assets/png/logo1.png";
import element1 from "@/assets/svg/element1.svg";
import element2 from "@/assets/svg/element2.svg";

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <Image
          src={element1}
          alt=""
          className="absolute bottom-0 left-0 opacity-60"
        />
        <Image
          src={element2}
          alt=""
          className="absolute bottom-0 right-0 opacity-60"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src={logo1}
            alt="Sociality"
            width={200}
            height={200}
            className="object-contain"
          />
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-base-white font-bold text-3xl">Sociality</h1>
            <p className="text-neutral-400 text-sm text-center">
              Share your moments, connect with the world.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/login"
            className="w-full text-center bg-primary-300 hover:bg-primary-200 text-base-white font-semibold py-3 rounded-full transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="w-full text-center border border-neutral-700 text-base-white font-semibold py-3 rounded-full hover:bg-neutral-800 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
