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
import { useAppDispatch } from "@/lib/store/hooks";
import { setCredentials } from "@/lib/store/authSlice";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { loginApi } from "@/lib/api/auth";
import Logo from "@/assets/svg/logo.svg";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
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
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success("Login successfull!");
      router.push("/");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Login failed");
      } else {
        toast.error("Login failed");
      }
    },
  });

  const onSubmit = (data: LoginInput) => mutate(data);

  return (
    <div className="backdrop-blur-md border border-neutral-800 rounded-3xl p-8 flex flex-col gap-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <Image src={Logo} alt="Sociality" width={28} height={28} />
          <span className="text-base-white font-semibold text-xl">
            Sociality
          </span>
        </div>
        <h1 className="text-base-white font-bold text-2xl">Welcome Back!</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base-white text-sm font-medium">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-base-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-primary-300 transition-colors"
          />
          {errors.email && (
            <p className="text-accent-red text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base-white text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 pr-11 text-base-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-primary-300 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-accent-red text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary-300 hover:bg-primary-200 disabled:opacity-60 text-base-white font-semibold py-3 rounded-full transition-colors mt-2"
        >
          {isPending ? "Loading..." : "Login"}
        </button>
      </form>

      {/* Register link */}
      <p className="text-center text-neutral-400 text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary-200 font-semibold hover:text-primary-300 transition-colors"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
