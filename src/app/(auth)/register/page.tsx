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
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { registerApi } from "@/lib/api/auth";
import Logo from "@/assets/svg/logo.svg";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      const token = data?.data?.token ?? data?.token;
      const user = data?.data?.user ?? data?.user;

      if (!token || !user) {
        toast.error("Invalid registration response.");
        return;
      }

      dispatch(setCredentials({ user, token }));
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Registration successful!");
      router.push("/feed?tab=explore");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Registration failed!");
        return;
      }

      toast.error("Registration failed!");
    },
  });

  const onSubmit = (data: RegisterInput) => mutate(data);

  return (
    <div className="backdrop-blur-md border border-neutral-800 rounded-3xl p-8 flex flex-col gap-6 my-10">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <Image src={Logo} alt="Sociality" width={28} height={28} />
          <span className="text-base-white font-semibold text-2xl">
            Sociality
          </span>
        </div>
        <h1 className="text-base-white font-bold text-2xl mt-2">Register</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-base-white text-sm font-medium">Name</label>
          <input
            {...register("name")}
            type="text"
            placeholder="Enter your name"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-base-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-primary-300 transition-colors"
          />
          {errors.name && (
            <p className="text-accent-red text-xs">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-base-white text-sm font-medium">
            Username
          </label>
          <input
            {...register("username")}
            type="text"
            placeholder="Enter your username"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-base-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-primary-300 transition-colors"
          />
          {errors.username && (
            <p className="text-accent-red text-xs">{errors.username.message}</p>
          )}
        </div>

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

        <div className="flex flex-col gap-1.5">
          <label className="text-base-white text-sm font-medium">
            Phone Number
          </label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="Enter your phone number"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-base-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-primary-300 transition-colors"
          />
          {errors.phone && (
            <p className="text-accent-red text-xs">{errors.phone.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-base-white text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 pr-11 text-base-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-primary-300 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-accent-red text-xs">{errors.password.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-base-white text-sm font-medium">
            Confirm Password
          </label>
          <div className="relative">
            <input
              {...register("password_confirmation")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 pr-11 text-base-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-primary-300 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              aria-pressed={showConfirmPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="text-accent-red text-xs">
              {errors.password_confirmation.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary-300 hover:bg-primary-200 disabled:opacity-60 text-base-white font-semibold py-3 rounded-full transition-colors mt-2"
        >
          {isPending ? "Loading..." : "Submit"}
        </button>
      </form>

      <p className="text-center text-neutral-25 text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary-200 font-semibold hover:text-primary-300 transition-colors"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
