"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ImageGalleryUploader from "@/components/ImageGalleryUploader";
import { PromoImage } from "@/lib/club-data";

// 클럽 홈 최상단 슬라이드 배너용 사진 — 실제 노출 컴포넌트(PromoCarousel)가
// aspect-video(16:9)라 업로드도 16:9로 리사이즈해야 한다. 예전엔 정방형으로
// 리사이즈해서 저장했다가 16:9 컨테이너에서 다시 잘려 확대되어 보이는 문제가 있었음.
const MAX_IMAGES = 8;
const BANNER_WIDTH = 1280;
const BANNER_HEIGHT = 720;

export default function PromoImagesManager({
  facilityId,
  initialImages,
  categories,
}: {
  facilityId: string;
  initialImages: PromoImage[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [linkedCategories, setLinkedCategories] = useState<Record<string, string>>(
    Object.fromEntries(initialImages.map((img) => [img.url, img.categoryId]))
  );
  const [savingUrl, setSavingUrl] = useState<string | null>(null);

  async function afterUpload(publicUrl: string, sortOrder: number) {
    const supabase = createClient();
    const { error } = await supabase
      .from("facility_promo_images")
      .insert({ facility_id: facilityId, url: publicUrl, sort_order: sortOrder });
    if (error) throw error;
    setLinkedCategories((prev) => ({ ...prev, [publicUrl]: "" }));
    router.refresh();
  }

  async function onDelete(url: string) {
    const supabase = createClient();
    const { error } = await supabase.from("facility_promo_images").delete().eq("url", url);
    if (error) throw error;
    setLinkedCategories((prev) => {
      const next = { ...prev };
      delete next[url];
      return next;
    });
    router.refresh();
  }

  async function onCaptionSave(url: string, caption: { title: string }) {
    const supabase = createClient();
    const { error } = await supabase
      .from("facility_promo_images")
      .update({ title: caption.title || null })
      .eq("url", url);
    if (error) return;
    router.refresh();
  }

  async function onReorder(orderedUrls: string[]) {
    const supabase = createClient();
    await Promise.all(
      orderedUrls.map((url, i) =>
        supabase.from("facility_promo_images").update({ sort_order: i }).eq("url", url)
      )
    );
    router.refresh();
  }

  async function onCategoryChange(url: string, categoryId: string) {
    setLinkedCategories((prev) => ({ ...prev, [url]: categoryId }));
    setSavingUrl(url);
    const supabase = createClient();
    await supabase
      .from("facility_promo_images")
      .update({ category_id: categoryId || null })
      .eq("url", url);
    setSavingUrl(null);
    router.refresh();
  }

  const images = initialImages.map((img) => img.url);

  return (
    <div className="flex flex-col gap-3">
      <ImageGalleryUploader
        bucket="facility-covers"
        pathPrefix={`${facilityId}/promo`}
        initialImages={images}
        initialCaptions={Object.fromEntries(
          initialImages.map((img) => [img.url, { title: img.title }])
        )}
        onCaptionSave={onCaptionSave}
        maxImages={MAX_IMAGES}
        label="홍보/이벤트 사진"
        helperText="클럽 홈 최상단에 슬라이드로 노출돼요 (16:9 가로형 권장). 사진 위에 제목 문구를 얹을 수 있어요."
        afterUpload={afterUpload}
        onDelete={onDelete}
        onReorder={onReorder}
        targetWidth={BANNER_WIDTH}
        targetHeight={BANNER_HEIGHT}
        previewAspectClass="aspect-video"
      />

      {categories.length > 0 && images.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-muted">
            연결할 홈 진열장 (선택, 배너를 누르면 그 카테고리로 이동해요)
          </p>
          {images.map((url) => (
            <div key={url} className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-11 w-11 shrink-0 rounded-sm object-cover" />
              <select
                value={linkedCategories[url] ?? ""}
                onChange={(e) => onCategoryChange(url, e.target.value)}
                disabled={savingUrl === url}
                className="w-full rounded-sm border border-line bg-background px-2.5 py-2 text-xs"
              >
                <option value="">연결 안 함</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
