import Image from "next/image";
import element1 from "@/assets/svg/element1.svg";
import element2 from "@/assets/svg/element2.svg";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-base-black overflow-hidden flex items-center justify-center">
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
      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">{children}</div>
    </div>
  );
}
