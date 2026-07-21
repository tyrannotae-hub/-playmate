"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToCover } from "@/lib/image-resize";
import { buttonClass } from "@/lib/ui";

// 상품 상세처럼 사진 여러 장을 올릴 수 있되, 규격은 모든 클럽이 동일하게 4:3 고정
const IMAGE_WIDTH = 960;
const IMAGE_HEIGHT = 720;
const MAX_IMAGES = 6;

export default function ClassMediaManager({
  facilityId,
  classId,
  initialImages,
  initialDescription,
}: {
  facilityId: string;
  classId: string;
  initialImages: string[];
  initialDescription: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [savingDescription, setSavingDescription] = useState(false);
  const [savedDescription, setSavedDescription] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    const supabase = createClient();

    try {
      const resized = await resizeImageToCover(file, IMAGE_WIDTH, IMAGE_HEIGHT);
      const path = `${facilityId}/${classId}/${crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("class-images")
        .upload(path, resized, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("class-images").getPublicUrl(path);

      const { error: insertError } = await supabase
        .from("class_images")
        .insert({ team_class_id: classId, url: publicUrl, sort_order: images.length });
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
    const { error } = await supabase.from("class_images").delete().eq("url", url);
    if (!error) {
      setImages((prev) => prev.filter((u) => u !== url));
      router.refresh();
    }
  }

  async function saveDescription() {
    setSavingDescription(true);
    setSavedDescription(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("teams_classes")
      .update({ description })
      .eq("id", classId);
    setSavingDescription(false);
    if (!error) {
      setSavedDescription(true);
      router.refresh();
      setTimeout(() => setSavedDescription(false), 2000);
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted">
          사진 ({images.length}/{MAX_IMAGES})
        </p>
        <div className="flex flex-wrap gap-2">
          {images.map((url) => (
            <div key={url} className="relative h-16 w-20 overflow-hidden rounded-lg">
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
                id={`class-image-input-${classId}`}
              />
              <label
                htmlFor={`class-image-input-${classId}`}
                className="flex h-16 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted"
              >
                {uploading ? "..." : "+ 추가"}
              </label>
            </>
          )}
        </div>
        {errorMsg && <p className="mt-1.5 text-xs text-negative">{errorMsg}</p>}
      </div>

      <div>
        <p className="mb-1.5 text-xs font-bold text-muted">상세 소개</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="학부모에게 보여줄 클래스 소개를 적어주세요"
          rows={3}
          className="w-full rounded-xl border border-line bg-background px-3 py-2.5 text-xs"
        />
        <div className="mt-1.5 flex items-center gap-2">
          <button
            onClick={saveDescription}
            disabled={savingDescription}
            className={buttonClass({ size: "sm", full: false })}
          >
            소개 저장
          </button>
          {savedDescription && <span className="text-xs font-bold text-good">저장됐어요</span>}
        </div>
      </div>
    </div>
  );
}
