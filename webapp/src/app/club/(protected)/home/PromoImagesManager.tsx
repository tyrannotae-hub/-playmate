"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ImageGalleryUploader from "@/components/ImageGalleryUploader";

// 클럽 홈 최상단 슬라이드 배너용 사진, 규격은 정방형 고정
const MAX_IMAGES = 8;

export default function PromoImagesManager({
  facilityId,
  initialImages,
}: {
  facilityId: string;
  initialImages: string[];
}) {
  const router = useRouter();

  async function afterUpload(publicUrl: string, sortOrder: number) {
    const supabase = createClient();
    const { error } = await supabase
      .from("facility_promo_images")
      .insert({ facility_id: facilityId, url: publicUrl, sort_order: sortOrder });
    if (error) throw error;
    router.refresh();
  }

  async function onDelete(url: string) {
    const supabase = createClient();
    const { error } = await supabase.from("facility_promo_images").delete().eq("url", url);
    if (error) throw error;
    router.refresh();
  }

  return (
    <ImageGalleryUploader
      bucket="facility-covers"
      pathPrefix={`${facilityId}/promo`}
      initialImages={initialImages}
      maxImages={MAX_IMAGES}
      label="홍보/이벤트 사진"
      helperText="클럽 홈 최상단에 슬라이드로 노출돼요"
      afterUpload={afterUpload}
      onDelete={onDelete}
    />
  );
}
