import Image from "next/image";
import Link from "next/link";
import logo2 from "@/assets/png/logo2.png";
import element1 from "@/assets/svg/element1.svg";
import element2 from "@/assets/svg/element2.svg";

export default function WelcomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6">
      {/* Background Elements */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-[60vh] w-full">
        <Image
          src={element1}
          alt=""
          fill
          priority
          className="select-none object-cover opacity-70 blur-[2px] "
        />

        <Image
          src={element2}
          alt=""
          fill
          priority
          className="select-none object-cover opacity-60 blur-[2px] "
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <Image
            src={logo2}
            alt="Sociality"
            width={200}
            height={200}
            className="object-contain"
          />
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-bold text-base-white">Sociality</h1>
            <p className="text-center text-sm text-neutral-400">
              Share your moments, connect with the world.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link
            href="/login"
            className="w-full rounded-full bg-primary-300 py-3 text-center font-semibold text-base-white transition-colors hover:bg-primary-200"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="w-full rounded-full border border-neutral-700 py-3 text-center font-semibold text-base-white transition-colors hover:bg-neutral-800"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
