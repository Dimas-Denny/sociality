"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api/axios";
import axios from "axios";
import changeIcon from "@/assets/svg/change.svg";
import trashIcon from "@/assets/svg/trash.svg";
import uploadIcon from "@/assets/svg/upload.svg";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleImageChange = (file: File) => {
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setImageError("Only PNG or JPG allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Max file size is 5MB");
      return;
    }

    if (preview) {
      <Image
        src={uploadIcon}
        alt="Upload"
        width={32}
        height={32}
        className="opacity-70"
      />;
      URL.revokeObjectURL(preview);
    }

    setImageError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setShowDeleteConfirm(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  };

  const handleDeleteImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview(null);
    setImageError("");
    setShowDeleteConfirm(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    <div className="min-h-screen bg-black px-4 py-4 md:px-6 md:py-6">
      {success && (
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between rounded-2xl bg-green-600 px-4 py-3 text-white shadow-lg md:left-1/2 md:right-auto md:w-full md:max-w-md md:-translate-x-1/2">
          <span className="text-sm font-semibold">Success Post</span>
          <button onClick={() => setSuccess(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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

      <div className="mx-auto w-full max-w-3xl">
        <div className="mx-auto w-full bg-black md:max-w-md">
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-neutral-400 transition-colors hover:text-white"
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
            <h1 className="text-lg font-semibold text-white">Add Post</h1>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-white">
              Photo
            </label>

            <div
              onClick={() => !preview && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`w-full rounded-2xl border-2 border-dashed transition-colors ${
                imageError
                  ? "border-red-500"
                  : "border-neutral-700 hover:border-neutral-500"
              } ${preview ? "overflow-hidden bg-neutral-950 p-4" : "cursor-pointer bg-neutral-950 p-6 md:p-8"}`}
            >
              {preview ? (
                <div className="space-y-4">
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                    <Image
                      src={preview}
                      alt="preview"
                      fill
                      className="object-contain"
                    />
                  </div>

                  {showDeleteConfirm ? (
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                      <p className="text-sm font-medium text-white">
                        Delete this image?
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        This action will remove the selected photo from this
                        post draft.
                      </p>

                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 rounded-2xl border border-neutral-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={handleDeleteImage}
                          className="flex-1 rounded-2xl border border-accent-red bg-neutral-900 px-4 py-3 text-sm font-medium text-accent-red transition-colors hover:bg-neutral-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-neutral-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
                      >
                        <Image
                          src={changeIcon}
                          alt="Change"
                          width={18}
                          height={18}
                        />
                        <span>Change Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-accent-red transition-colors hover:bg-neutral-800"
                      >
                        <Image
                          src={trashIcon}
                          alt="Delete"
                          width={18}
                          height={18}
                        />
                        <span>Delete Image</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <Image
                    src={uploadIcon}
                    alt="Upload"
                    width={32}
                    height={32}
                    className="opacity-70"
                  />

                  <p className="text-sm">
                    <span className="font-medium text-violet-400">
                      Click to upload
                    </span>
                    <span className="text-neutral-400"> or drag and drop</span>
                  </p>

                  <p className="text-xs text-neutral-500">
                    PNG or JPG (max. 5mb)
                  </p>
                </div>
              )}
            </div>

            {imageError && (
              <p className="mt-1 text-xs text-red-500">{imageError}</p>
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

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-white">
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
              className={`w-full resize-none rounded-2xl border bg-neutral-900 px-4 py-3 text-sm text-white placeholder:text-neutral-500 transition-colors focus:outline-none ${
                captionError
                  ? "border-red-500 focus:border-red-500"
                  : "border-neutral-800 focus:border-violet-500"
              }`}
            />

            {captionError && (
              <p className="mt-1 text-xs text-red-500">{captionError}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-full bg-violet-600 py-3 font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
