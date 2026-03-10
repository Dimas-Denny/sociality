"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { loginApi } from "@/lib/api/auth";
import Logo from "@/assets/svg/logo.svg";

type ApiErrorResponse = {
  success: boolean;
  message: string;
  data: unknown;
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      toast.success("Login successful!");
      router.push("/feed?tab=explore");
    },
    onError: (error) => {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const message =
          error.response?.data?.message ?? "Email atau password salah";

        toast.error(message);
        return;
      }

      toast.error("Login failed");
    },
  });

  const onSubmit = (data: LoginInput) => mutate(data);

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-neutral-800 p-8 backdrop-blur-md">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <Image src={Logo} alt="Sociality" width={28} height={28} />
          <span className="text-2xl font-semibold text-base-white">
            Sociality
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-base-white">
          Welcome Back!
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-base-white">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-base-white placeholder:text-neutral-500 transition-colors focus:border-primary-300 focus:outline-none"
          />
          {errors.email && (
            <p className="text-xs text-accent-red">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-base-white">
            Password
          </label>

          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 pr-11 text-sm text-base-white placeholder:text-neutral-500 transition-colors focus:border-primary-300 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 transition-colors hover:text-neutral-300"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          {errors.password && (
            <p className="text-xs text-accent-red">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-full rounded-full bg-primary-300 py-3 font-semibold text-base-white transition-colors hover:bg-primary-200 disabled:opacity-60"
        >
          {isPending ? "Loading..." : "Login"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-25">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary-200 transition-colors hover:text-primary-300"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
