"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToCover } from "@/lib/image-resize";

// 클럽 홈 홍보 사진/클래스 사진처럼 "정방형 여러 장 업로드 + 그리드 + 개별 삭제"
// 패턴이 반복돼서 만든 공용 컴포넌트. 실제 스토리지 업로드/리사이즈/그리드 UI는
// 여기서 처리하고, DB row insert/delete(어떤 테이블·컬럼인지는 화면마다 달라서)는
// afterUpload/onDelete 콜백으로 호출자에게 위임한다.
const IMAGE_PIXELS = 960;

type Caption = { title: string };

// 배너 폭(85%, text-base 굵게)에서 한 줄이 넘치지 않는 선의 글자수. 줄바꿈은
// 최대 2줄까지만 허용하고, 그 이후 입력은 그냥 잘라낸다.
const LINE_MAX = 16;
const MAX_LINES = 2;

function clampLines(value: string): string {
  return value
    .split("\n")
    .slice(0, MAX_LINES)
    .map((line) => line.slice(0, LINE_MAX))
    .join("\n");
}

export default function ImageGalleryUploader({
  bucket,
  pathPrefix,
  initialImages,
  maxImages = 8,
  label = "사진",
  helperText,
  afterUpload,
  onDelete,
  initialCaptions,
  onCaptionSave,
  targetWidth = IMAGE_PIXELS,
  targetHeight = IMAGE_PIXELS,
  previewAspectClass = "aspect-square",
  onReorder,
}: {
  bucket: string;
  pathPrefix: string;
  initialImages: string[];
  maxImages?: number;
  label?: string;
  helperText?: string;
  afterUpload: (publicUrl: string, sortOrder: number) => Promise<void>;
  onDelete: (url: string) => Promise<void>;
  /** 넣으면 사진마다 배너 제목/소제목을 입력할 수 있는 편집 영역이 함께 나온다. */
  initialCaptions?: Record<string, Caption>;
  onCaptionSave?: (url: string, caption: Caption) => Promise<void>;
  /** 업로드 전 리사이즈할 목표 크기. 기본은 정방형(960x960) */
  targetWidth?: number;
  targetHeight?: number;
  /** 썸네일 미리보기 비율 클래스 — 실제 노출 형태와 다르게 보이지 않도록 targetWidth/Height와 맞춰줄 것 */
  previewAspectClass?: string;
  /** 넣으면 사진마다 순서 이동(◀/▶) 버튼이 함께 나온다. 새 순서의 url 배열 전체를 넘겨준다. */
  onReorder?: (orderedUrls: string[]) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [captions, setCaptions] = useState<Record<string, Caption>>(initialCaptions ?? {});
  const [savingCaption, setSavingCaption] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputId = `image-gallery-input-${pathPrefix.replace(/[^a-zA-Z0-9]/g, "-")}`;

  function captionOf(url: string): Caption {
    return captions[url] ?? { title: "" };
  }

  function setCaptionField(url: string, field: keyof Caption, value: string) {
    setCaptions((prev) => ({ ...prev, [url]: { ...captionOf(url), [field]: value } }));
  }

  async function saveCaption(url: string) {
    if (!onCaptionSave) return;
    setSavingCaption(url);
    await onCaptionSave(url, captionOf(url));
    setSavingCaption(null);
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    const supabase = createClient();

    try {
      const resized = await resizeImageToCover(file, targetWidth, targetHeight);
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
    setCaptions((prev) => {
      const next = { ...prev };
      delete next[url];
      return next;
    });
  }

  async function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (!onReorder || target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    await onReorder(next);
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-bold text-muted">
        {label} ({images.length}/{maxImages})
      </p>
      {helperText && <p className="mb-2 text-xs text-muted">{helperText}</p>}
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div
            key={url}
            className={`relative w-24 shrink-0 overflow-hidden rounded-xs ${previewAspectClass}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => deleteImage(url)}
              aria-label="사진 삭제"
              className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[10px] text-white"
            >
              ✕
            </button>
            {onReorder && images.length > 1 && (
              <div className="absolute inset-x-0 bottom-0.5 flex justify-center gap-1">
                <button
                  onClick={() => moveImage(i, -1)}
                  disabled={i === 0}
                  aria-label="앞으로 이동"
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[10px] text-white disabled:opacity-30"
                >
                  ◀
                </button>
                <button
                  onClick={() => moveImage(i, 1)}
                  disabled={i === images.length - 1}
                  aria-label="뒤로 이동"
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[10px] text-white disabled:opacity-30"
                >
                  ▶
                </button>
              </div>
            )}
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
              className={`flex w-24 shrink-0 cursor-pointer items-center justify-center rounded-xs border border-dashed border-line text-xs text-muted ${previewAspectClass}`}
            >
              {uploading ? "..." : "+ 추가"}
            </label>
          </>
        )}
      </div>
      {errorMsg && <p className="mt-1.5 text-xs text-negative">{errorMsg}</p>}

      {onCaptionSave && images.length > 0 && (
        <div className="mt-3 flex flex-col gap-2.5">
          <p className="text-xs font-bold text-muted">
            사진 위에 표시할 문구 (선택, 한 줄 {LINE_MAX}자까지, Enter로 줄바꿈해서 2줄로
            만들 수 있어요)
          </p>
          {images.map((url) => {
            const caption = captionOf(url);
            return (
              <div key={url} className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-11 w-11 shrink-0 rounded-xs object-cover" />
                <div className="min-w-0 flex-1">
                  <textarea
                    value={caption.title}
                    onChange={(e) => setCaptionField(url, "title", clampLines(e.target.value))}
                    onBlur={() => saveCaption(url)}
                    rows={2}
                    placeholder="제목"
                    className="w-full resize-none rounded-xs border border-line bg-background px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
                {savingCaption === url && <span className="shrink-0 text-[10px] text-muted">저장중</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
