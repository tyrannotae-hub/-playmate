"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonClass } from "@/lib/ui";
import ImageGalleryUploader from "@/components/ImageGalleryUploader";

// 상품 상세처럼 사진 여러 장을 올릴 수 있되, 규격은 모든 클럽이 동일하게 정방형 고정
const MAX_IMAGES = 8;

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
  const [description, setDescription] = useState(initialDescription);
  const [savingDescription, setSavingDescription] = useState(false);
  const [savedDescription, setSavedDescription] = useState(false);

  async function afterUpload(publicUrl: string, sortOrder: number) {
    const supabase = createClient();
    const { error } = await supabase
      .from("class_images")
      .insert({ team_class_id: classId, url: publicUrl, sort_order: sortOrder });
    if (error) throw error;
    router.refresh();
  }

  async function onDelete(url: string) {
    const supabase = createClient();
    const { error } = await supabase.from("class_images").delete().eq("url", url);
    if (error) throw error;
    router.refresh();
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
      <ImageGalleryUploader
        bucket="class-images"
        pathPrefix={`${facilityId}/${classId}`}
        initialImages={initialImages}
        maxImages={MAX_IMAGES}
        label="사진"
        afterUpload={afterUpload}
        onDelete={onDelete}
      />

      <div>
        <p className="mb-1.5 text-xs font-bold text-muted">상세 소개</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="학부모에게 보여줄 클래스 소개를 적어주세요"
          rows={3}
          className="w-full rounded-md border border-line bg-background px-3 py-2.5 text-xs"
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
