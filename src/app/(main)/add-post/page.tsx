"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api/axios";
import axios from "axios";

export default function AddPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [imageError, setImageError] = useState("");
  const [captionError, setCaptionError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (file: File) => {
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setImageError("Only PNG or JPG allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Max file size is 5MB");
      return;
    }
    setImageError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  };

  const validate = () => {
    let valid = true;
    if (!image) {
      setImageError("Photo is required");
      valid = false;
    }
    if (!caption.trim()) {
      setCaptionError("Caption is required");
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", image!);
      formData.append("caption", caption);

      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => router.push("/feed"), 1500);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Post error:", error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-950 min-h-screen px-6 py-4">
      {/* Success Toast */}
      {success && (
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between bg-green-600 text-white px-4 py-3 rounded-2xl shadow-lg">
          <span className="font-semibold text-sm">Success Post</span>
          <button onClick={() => setSuccess(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-neutral-400 hover:text-white transition-colors"
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
        </button>
        <h1 className="text-white font-semibold text-lg">Add Post</h1>
      </div>

      {/* Photo Upload */}
      <div className="mb-4">
        <label className="text-white text-sm font-medium mb-2 block">
          Photo
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`w-full rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
            imageError
              ? "border-red-500"
              : "border-neutral-700 hover:border-neutral-500"
          } ${preview ? "p-0 overflow-hidden" : "p-8"}`}
        >
          {preview ? (
            <div className="relative w-full aspect-square">
              <Image
                src={preview}
                alt="preview"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <p className="text-sm text-center">
                <span className="text-violet-400 font-medium">
                  Click to upload
                </span>
                <span className="text-neutral-400"> or drag and drop</span>
              </p>
              <p className="text-neutral-500 text-xs">PNG or JPG (max. 5mb)</p>
            </div>
          )}
        </div>
        {imageError && (
          <p className="text-red-500 text-xs mt-1">{imageError}</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && handleImageChange(e.target.files[0])
          }
        />
      </div>

      {/* Caption */}
      <div className="mb-6">
        <label className="text-white text-sm font-medium mb-2 block">
          Caption
        </label>
        <textarea
          value={caption}
          onChange={(e) => {
            setCaption(e.target.value);
            setCaptionError("");
          }}
          placeholder="Create your caption"
          rows={4}
          className={`w-full bg-neutral-900 border rounded-2xl px-4 py-3 text-white placeholder:text-neutral-500 text-sm focus:outline-none transition-colors resize-none ${
            captionError
              ? "border-red-500 focus:border-red-500"
              : "border-neutral-800 focus:border-violet-500"
          }`}
        />
        {captionError && (
          <p className="text-red-500 text-xs mt-1">{captionError}</p>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold py-3 rounded-full transition-colors"
      >
        {loading ? "Sharing..." : "Share"}
      </button>
    </div>
  );
}
