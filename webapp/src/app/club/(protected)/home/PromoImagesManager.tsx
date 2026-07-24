"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToCover } from "@/lib/image-resize";

// 클럽 홈 최상단 슬라이드 배너용 사진, 규격은 정방형 고정
const IMAGE_WIDTH = 960;
const IMAGE_HEIGHT = 960;
const MAX_IMAGES = 8;

export default function PromoImagesManager({
  facilityId,
  initialImages,
}: {
  facilityId: string;
  initialImages: string[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    const supabase = createClient();

    try {
      const resized = await resizeImageToCover(file, IMAGE_WIDTH, IMAGE_HEIGHT);
      const path = `${facilityId}/promo/${crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("facility-covers")
        .upload(path, resized, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("facility-covers").getPublicUrl(path);

      const { error: insertError } = await supabase
        .from("facility_promo_images")
        .insert({ facility_id: facilityId, url: publicUrl, sort_order: images.length });
      if (insertError) throw insertError;

      setImages((prev) => [...prev, publicUrl]);
      router.refresh();
    } catch {
      setErrorMsg("사진 업로드에 실패했어요.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function deleteImage(url: string) {
    const supabase = createClient();
    const { error } = await supabase.from("facility_promo_images").delete().eq("url", url);
    if (!error) {
      setImages((prev) => prev.filter((u) => u !== url));
      router.refresh();
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-bold text-muted">
        홍보/이벤트 사진 ({images.length}/{MAX_IMAGES})
      </p>
      <p className="mb-2 text-xs text-muted">클럽 홈 최상단에 슬라이드로 노출돼요</p>
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
        {images.length < MAX_IMAGES && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
              id="promo-image-input"
            />
            <label
              htmlFor="promo-image-input"
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
