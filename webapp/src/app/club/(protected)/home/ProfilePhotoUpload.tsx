"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonClass } from "@/lib/ui";
import { resizeImageToCover } from "@/lib/image-resize";

// 앱 전체 사진 규격 통일 방침에 따라 프로필 사진도 정방형으로 고정
const PROFILE_SIZE = 800;

export default function ProfilePhotoUpload({
  facilityId,
  profileImageUrl,
}: {
  facilityId: string;
  profileImageUrl: string;
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
      const resized = await resizeImageToCover(file, PROFILE_SIZE, PROFILE_SIZE);
      const path = `${facilityId}/profile.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("facility-covers")
        .upload(path, resized, { upsert: true, contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("facility-covers").getPublicUrl(path);
      const bustedUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("facilities")
        .update({ profile_image_url: bustedUrl })
        .eq("id", facilityId);
      if (updateError) throw updateError;

      setPreview(bustedUrl);
      router.refresh();
    } catch {
      setErrorMsg("이미지 업로드에 실패했어요. 다시 시도해주세요.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div
        className="flex aspect-square w-24 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface-2 bg-cover bg-center"
        style={preview ? { backgroundImage: `url(${preview})` } : undefined}
      >
        {!preview && <span className="text-center text-[10px] text-muted">프로필 사진 없음</span>}
      </div>

      {errorMsg && <p className="mt-2 text-xs text-negative">{errorMsg}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
        id="profile-image-input"
      />
      <label
        htmlFor="profile-image-input"
        className={buttonClass({ variant: "outline", size: "sm", className: "mt-3 cursor-pointer", full: false })}
      >
        {uploading ? "업로드 중..." : "프로필 사진 업로드"}
      </label>
      <p className="mt-1.5 text-xs text-muted">
        어떤 사진을 올려도 {PROFILE_SIZE}×{PROFILE_SIZE}(정방형) 크기로 자동 맞춰져요
      </p>
    </div>
  );
}
