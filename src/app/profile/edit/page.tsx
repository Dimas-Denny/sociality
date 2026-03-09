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
      className="rounded-full bg-neutral-700 flex items-center justify-center text-white font-bold"
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="text-neutral-500 text-sm">Loading...</span>
      </div>
    );
  }

  const displayAvatar = avatarPreview ?? profile.avatarUrl;

  return (
    <div className="min-h-screen bg-black pb-16">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
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
          <span className="font-semibold text-base">Edit Profile</span>
        </button>
        <Avatar url={displayAvatar} name={profile.name} size={36} />
      </div>

      <div className="px-4 flex flex-col gap-6">
        {/* Avatar + Change Photo */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <Avatar url={displayAvatar} name={profile.name} size={88} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="border border-neutral-700 text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-neutral-800 transition-colors"
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

        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white text-sm font-medium">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white text-sm font-medium">Username</label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) =>
                setProfile({ ...profile, username: e.target.value })
              }
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white text-sm font-medium">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white text-sm font-medium">
              Number Phone
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white text-sm font-medium">Bio</label>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Write something about yourself..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-neutral-600 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold py-3.5 rounded-full transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
