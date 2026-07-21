"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonClass } from "@/lib/ui";

// 모든 클럽이 같은 비율/크기로 통일되도록 업로드 전 클라이언트에서 고정 크기로 리사이즈
const COVER_WIDTH = 1200;
const COVER_HEIGHT = 675; // 16:9

export default function CoverImageUpload({
  facilityId,
  coverImageUrl,
}: {
  facilityId: string;
  coverImageUrl: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(coverImageUrl);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function resizeToCover(file: File): Promise<Blob> {
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = objectUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = COVER_WIDTH;
      canvas.height = COVER_HEIGHT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("CANVAS_UNSUPPORTED");

      const scale = Math.max(COVER_WIDTH / img.width, COVER_HEIGHT / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (COVER_WIDTH - w) / 2, (COVER_HEIGHT - h) / 2, w, h);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.85)
      );
      if (!blob) throw new Error("EXPORT_FAILED");
      return blob;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    const supabase = createClient();

    try {
      const resized = await resizeToCover(file);
      const path = `${facilityId}/cover.jpg`;

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
        .update({ cover_image_url: bustedUrl })
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
        className="flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface-2 bg-cover bg-center"
        style={preview ? { backgroundImage: `url(${preview})` } : undefined}
      >
        {!preview && <span className="text-sm text-muted">등록된 커버 이미지가 없어요</span>}
      </div>

      {errorMsg && <p className="mt-2 text-xs text-negative">{errorMsg}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
        id="cover-image-input"
      />
      <label
        htmlFor="cover-image-input"
        className={buttonClass({ variant: "outline", size: "sm", className: "mt-3 cursor-pointer" })}
      >
        {uploading ? "업로드 중..." : "커버 이미지 업로드"}
      </label>
      <p className="mt-1.5 text-xs text-muted">
        어떤 사진을 올려도 {COVER_WIDTH}×{COVER_HEIGHT}(16:9) 크기로 자동 맞춰져요
      </p>
    </div>
  );
}
