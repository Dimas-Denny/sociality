"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api/axios";
import axios from "axios";

type ProfileData = {
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string | null;
};

function Avatar({
  url,
  name,
  size,
}: {
  url: string | null;
  name?: string;
  size: number;
}) {
  if (url) {
    return (
      <Image
        src={url}
        alt="avatar"
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
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {name?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    username: "",
    email: "",
    phone: "",
    bio: "",
    avatarUrl: null,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/me");
      const raw = res.data?.data;
      const p = raw?.profile ?? raw;

      setProfile({
        name: p.name ?? "",
        username: p.username ?? "",
        email: p.email ?? "",
        phone: p.phone ?? "",
        bio: p.bio ?? "",
        avatarUrl: p.avatarUrl ?? null,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("username", profile.username);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);
      formData.append("bio", profile.bio);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await api.patch("/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated!");
      router.push("/profile");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log("save error:", err.response?.status, err.response?.data);
        toast.error(err.response?.data?.message ?? "Failed to save changes");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <span className="text-sm text-neutral-500">Loading...</span>
      </div>
    );
  }

  const displayAvatar = avatarPreview ?? profile.avatarUrl;

  return (
    <div className="min-h-screen bg-black pb-16">
      <div className="mx-auto w-full max-w-5xl px-4 pt-5 md:px-8 md:pt-10">
        <div className="mx-auto w-full md:max-w-3xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-white transition-colors hover:text-neutral-300"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <h1 className="text-xl font-bold text-white md:text-2xl">
              Edit Profile
            </h1>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-8">
            {/* Left */}
            <div className="flex flex-col items-center gap-4 md:w-40 md:items-center">
              <Avatar url={displayAvatar} name={profile.name} size={80} />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-neutral-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                Change Photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Right */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white transition-colors focus:border-neutral-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white">
                  Username
                </label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white transition-colors focus:border-neutral-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white transition-colors focus:border-neutral-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white">
                  Number Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white transition-colors focus:border-neutral-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white">Bio</label>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  placeholder="Write something about yourself..."
                  className="w-full resize-none rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white transition-colors focus:border-neutral-600 focus:outline-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-4 w-full rounded-full bg-violet-600 py-3.5 font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
