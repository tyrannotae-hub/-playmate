"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToCover } from "@/lib/image-resize";

// 코치 프로필 사진: 클럽 커버/클래스 사진과 마찬가지로 클라이언트에서 정사각형으로 고정 리사이즈
const AVATAR_SIZE = 320;

export default function InstructorAvatarUpload({
  facilityId,
  instructorId,
  profileImageUrl,
  onUploaded,
}: {
  facilityId: string;
  instructorId: string;
  profileImageUrl: string;
  onUploaded: (url: string) => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(profileImageUrl);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    const supabase = createClient();

    try {
      const resized = await resizeImageToCover(file, AVATAR_SIZE, AVATAR_SIZE);
      const path = `${facilityId}/${instructorId}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("instructor-profiles")
        .upload(path, resized, { upsert: true, contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("instructor-profiles").getPublicUrl(path);
      const bustedUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("instructors")
        .update({ profile_image_url: bustedUrl })
        .eq("id", instructorId);
      if (updateError) throw updateError;

      setPreview(bustedUrl);
      onUploaded(bustedUrl);
      router.refresh();
    } catch {
      setErrorMsg("사진 업로드에 실패했어요.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rink-soft text-xl">
          🧑
        </div>
      )}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
          id={`instructor-avatar-input-${instructorId}`}
        />
        <label
          htmlFor={`instructor-avatar-input-${instructorId}`}
          className="btn-label cursor-pointer text-xs font-bold text-rink-deep"
        >
          {uploading ? "업로드 중..." : "프로필 사진 변경"}
        </label>
        {errorMsg && <p className="mt-1 text-xs text-negative">{errorMsg}</p>}
      </div>
    </div>
  );
}
