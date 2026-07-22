"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToCover } from "@/lib/image-resize";
import { buttonClass } from "@/lib/ui";

// 학부모 본인/자녀 프로필 사진 공용 업로더. 어떤 사진을 올려도 정사각형으로
// 고정해 원형으로 보여준다. 저장 버킷/경로만 props로 받고, 실제 DB 컬럼 업데이트는
// onUploaded 콜백으로 호출자에게 위임한다(어떤 테이블·컬럼에 저장할지는 화면마다 달라서).
const AVATAR_PIXELS = 400;

export default function AvatarUpload({
  path,
  currentUrl,
  initials,
  size = 72,
  onUploaded,
}: {
  path: string;
  currentUrl: string;
  initials?: string;
  size?: number;
  onUploaded: (url: string) => void | Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputId = `avatar-input-${path.replace(/[^a-zA-Z0-9]/g, "-")}`;

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    const supabase = createClient();

    try {
      const resized = await resizeImageToCover(file, AVATAR_PIXELS, AVATAR_PIXELS);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, resized, { upsert: true, contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      const bustedUrl = `${publicUrl}?t=${Date.now()}`;

      await onUploaded(bustedUrl);
      setPreview(bustedUrl);
    } catch {
      setErrorMsg("사진 업로드에 실패했어요. 다시 시도해주세요.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2 bg-cover bg-center text-sm font-bold text-muted"
        style={{
          width: size,
          height: size,
          ...(preview ? { backgroundImage: `url(${preview})` } : {}),
        }}
      >
        {!preview && (initials || "?")}
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
          id={inputId}
        />
        <label
          htmlFor={inputId}
          className={buttonClass({ variant: "outline", size: "sm", full: false, className: "cursor-pointer" })}
        >
          {uploading ? "업로드 중..." : "사진 변경"}
        </label>
        {errorMsg && <p className="mt-1 text-xs text-negative">{errorMsg}</p>}
      </div>
    </div>
  );
}
