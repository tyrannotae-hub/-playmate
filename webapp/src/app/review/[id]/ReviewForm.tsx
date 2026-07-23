"use client";

import { useRef, useState } from "react";
import TopNav from "@/components/TopNav";
import { createClient } from "@/lib/supabase/client";
import { Booking } from "@/lib/types";
import { buttonClass } from "@/lib/ui";
import { resizeImageToCover } from "@/lib/image-resize";

const MAX_PHOTOS = 5;
const PHOTO_PIXELS = 800;

type PendingPhoto = { file: File; previewUrl: string };

export default function ReviewForm({ booking }: { booking: Booking }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onPhotosSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (files.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length;
    const picked = files.slice(0, remaining).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...picked]);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function submit() {
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    let photoUrls: string[] = [];
    try {
      photoUrls = await Promise.all(
        photos.map(async (photo, i) => {
          const resized = await resizeImageToCover(photo.file, PHOTO_PIXELS, PHOTO_PIXELS);
          const path = `${user.id}/${booking.id}-${i}.jpg`;

          const { error: uploadError } = await supabase.storage
            .from("review-photos")
            .upload(path, resized, { upsert: true, contentType: "image/jpeg" });
          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("review-photos").getPublicUrl(path);
          return `${publicUrl}?t=${Date.now()}`;
        })
      );
    } catch {
      setSubmitting(false);
      setErrorMsg("사진 업로드에 실패했어요. 다시 시도해주세요.");
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      booking_id: booking.id,
      parent_id: user.id,
      target_type: "team_class",
      target_id: booking.classId,
      rating,
      content,
      photo_urls: photoUrls,
      author_label: nickname.trim() || "학부모",
    });

    setSubmitting(false);
    if (error) {
      setErrorMsg("후기 등록에 실패했어요. 이미 작성했는지 확인해주세요.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <>
        <TopNav title="리뷰 작성" back />
        <main className="flex flex-col items-center px-6 pb-10 pt-20 text-center">
          <div className="text-4xl">🙌</div>
          <h2 className="mt-4 text-lg font-bold">후기가 등록됐어요</h2>
          <p className="mt-2 text-sm text-muted">
            소중한 후기 감사합니다, 다른 학부모에게 큰 도움이 돼요.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav title="리뷰 작성" back />
      <main className="px-4 pb-10 pt-4">
        <p className="text-sm font-bold text-muted">
          {booking.className} · {booking.facilityName}
        </p>

        <div className="mt-5 flex gap-1 text-3xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              aria-label={`별점 ${n}점`}
              className={n <= rating ? "text-energy" : "text-line"}
            >
              ★
            </button>
          ))}
        </div>

        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임 (예: 민준맘, 비워두면 '학부모'로 표시)"
          className="mt-4 w-full rounded-md border border-line bg-surface p-3.5 text-sm"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="후기를 남겨주세요..."
          className="mt-3 w-full rounded-md border border-line bg-surface p-3.5 text-sm"
          rows={5}
        />

        <p className="mt-3 text-xs text-muted">
          아이 얼굴 노출에 주의해주세요 (모자이크 권장)
        </p>

        <div className="mt-5">
          <p className="text-sm font-bold">사진 첨부 (선택)</p>
          <p className="mt-1 text-xs text-muted">
            최대 {MAX_PHOTOS}장까지 올릴 수 있어요. 아이 얼굴이 나온 사진은 모자이크 후 올려주세요.
          </p>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {photos.map((photo, i) => (
              <div key={photo.previewUrl} className="relative aspect-square">
                <div
                  className="h-full w-full rounded-md border border-line bg-surface-2 bg-cover bg-center"
                  style={{ backgroundImage: `url(${photo.previewUrl})` }}
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label="사진 삭제"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background"
                >
                  ×
                </button>
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <label
                htmlFor="review-photo-input"
                className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-line text-xs text-muted"
              >
                <span className="text-lg leading-none">+</span>
                사진 추가
              </label>
            )}
          </div>

          <input
            ref={fileInputRef}
            id="review-photo-input"
            type="file"
            accept="image/*"
            multiple
            onChange={onPhotosSelected}
            className="hidden"
          />
        </div>

        {errorMsg && <p className="mt-2 text-sm text-negative">{errorMsg}</p>}

        <button
          onClick={submit}
          disabled={content.trim().length === 0 || submitting}
          className={buttonClass({ className: "mt-6" })}
        >
          {submitting ? "등록 중..." : "등록하기"}
        </button>
      </main>
    </>
  );
}
