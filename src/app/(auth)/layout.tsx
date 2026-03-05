import Image from "next/image";
import Element1 from "@/assets/svg/element1.svg";
import Element2 from "@/assets/svg/element2.svg";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-base-black overflow-hidden flex items-center justify-center">
      {/* Background gradient elements */}
      <Image
        src={Element1}
        alt=""
        width={600}
        height={600}
        className="absolute -bottom-20 left-0 pointer-events-none select-none"
        priority
      />
      <Image
        src={Element2}
        alt=""
        width={400}
        height={400}
        className="absolute -bottom-10 right-0 pointer-events-none select-none"
        priority
      />
      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">{children}</div>
    </div>
  );
}
