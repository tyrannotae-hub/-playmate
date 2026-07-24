"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToCover } from "@/lib/image-resize";

// 클럽 홈 홍보 사진/클래스 사진처럼 "정방형 여러 장 업로드 + 그리드 + 개별 삭제"
// 패턴이 반복돼서 만든 공용 컴포넌트. 실제 스토리지 업로드/리사이즈/그리드 UI는
// 여기서 처리하고, DB row insert/delete(어떤 테이블·컬럼인지는 화면마다 달라서)는
// afterUpload/onDelete 콜백으로 호출자에게 위임한다.
const IMAGE_PIXELS = 960;

export default function ImageGalleryUploader({
  bucket,
  pathPrefix,
  initialImages,
  maxImages = 8,
  label = "사진",
  helperText,
  afterUpload,
  onDelete,
}: {
  bucket: string;
  pathPrefix: string;
  initialImages: string[];
  maxImages?: number;
  label?: string;
  helperText?: string;
  afterUpload: (publicUrl: string, sortOrder: number) => Promise<void>;
  onDelete: (url: string) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputId = `image-gallery-input-${pathPrefix.replace(/[^a-zA-Z0-9]/g, "-")}`;

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    const supabase = createClient();

    try {
      const resized = await resizeImageToCover(file, IMAGE_PIXELS, IMAGE_PIXELS);
      const path = `${pathPrefix}/${crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, resized, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);

      await afterUpload(publicUrl, images.length);
      setImages((prev) => [...prev, publicUrl]);
    } catch {
      setErrorMsg("사진 업로드에 실패했어요.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function deleteImage(url: string) {
    await onDelete(url);
    setImages((prev) => prev.filter((u) => u !== url));
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-bold text-muted">
        {label} ({images.length}/{maxImages})
      </p>
      {helperText && <p className="mb-2 text-xs text-muted">{helperText}</p>}
      <div className="flex flex-wrap gap-2">
        {images.map((url) => (
          <div key={url} className="relative h-16 w-16 overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => deleteImage(url)}
              aria-label="사진 삭제"
              className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[10px] text-white"
            >
              ✕
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <>
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
              className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border border-dashed border-line text-xs text-muted"
            >
              {uploading ? "..." : "+ 추가"}
            </label>
          </>
        )}
      </div>
      {errorMsg && <p className="mt-1.5 text-xs text-negative">{errorMsg}</p>}
    </div>
  );
}
