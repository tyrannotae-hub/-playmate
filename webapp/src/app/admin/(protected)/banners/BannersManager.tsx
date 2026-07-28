"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToCover } from "@/lib/image-resize";
import { HomeBanner } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";
import { revalidateHomeBanners } from "./actions";

const IMAGE_SIZE = 960; // PromoBanner 슬라이드가 aspect-square라 정방형으로 리사이즈

type Draft = {
  href: string;
  layout: "logo" | "text";
  caption: string;
  title: string;
  subtitle: string;
  backgroundImageUrl: string;
};

function toDraft(b?: HomeBanner): Draft {
  return {
    href: b?.href ?? "",
    layout: b?.layout ?? "text",
    caption: b?.caption ?? "",
    title: b?.title ?? "",
    subtitle: b?.subtitle ?? "",
    backgroundImageUrl: b?.backgroundImageUrl ?? "",
  };
}

function BannerForm({
  draft,
  setDraft,
  onUpload,
  uploading,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-line bg-surface-2">
          {draft.backgroundImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.backgroundImageUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={buttonClass({ variant: "outline", size: "sm", full: false })}
        >
          {uploading ? "업로드 중..." : draft.backgroundImageUrl ? "사진 교체" : "사진 업로드"}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDraft({ ...draft, layout: "logo" })}
          className={buttonClass({
            variant: draft.layout === "logo" ? "tabActive" : "tabInactive",
            size: "sm",
            full: false,
            radius: "round",
            className: "flex-1",
          })}
        >
          로고형 (홈 소개용)
        </button>
        <button
          type="button"
          onClick={() => setDraft({ ...draft, layout: "text" })}
          className={buttonClass({
            variant: draft.layout === "text" ? "tabActive" : "tabInactive",
            size: "sm",
            full: false,
            radius: "round",
            className: "flex-1",
          })}
        >
          텍스트형 (클럽/이벤트 홍보용)
        </button>
      </div>

      <input
        value={draft.href}
        onChange={(e) => setDraft({ ...draft, href: e.target.value })}
        placeholder="누르면 이동할 링크 (예: /facilities/xxxx 또는 /recommend)"
        className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm"
      />

      {draft.layout === "logo" ? (
        <input
          value={draft.caption}
          onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
          placeholder="로고 아래 문구"
          className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm"
        />
      ) : (
        <>
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="제목"
            className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm"
          />
          <input
            value={draft.subtitle}
            onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
            placeholder="부제 (선택)"
            className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm"
          />
        </>
      )}
    </div>
  );
}

function BannerRow({
  banner,
  onChanged,
  onMove,
  canMoveBack,
  canMoveForward,
}: {
  banner: HomeBanner;
  onChanged: () => void;
  onMove: (direction: -1 | 1) => void;
  canMoveBack: boolean;
  canMoveForward: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(toDraft(banner));
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function uploadImage(file: File) {
    setUploading(true);
    const supabase = createClient();
    try {
      const resized = await resizeImageToCover(file, IMAGE_SIZE, IMAGE_SIZE);
      const path = `banners/admin/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(path, resized, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("site-assets").getPublicUrl(path);
      setDraft((d) => ({ ...d, backgroundImageUrl: publicUrl }));
    } catch {
      setErrorMsg("사진 업로드에 실패했어요.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!draft.href.trim()) {
      setErrorMsg("링크를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase
      .from("home_banners")
      .update({
        href: draft.href.trim(),
        layout: draft.layout,
        background_image_url: draft.backgroundImageUrl || null,
        caption: draft.layout === "logo" ? draft.caption.trim() || null : null,
        title: draft.layout === "text" ? draft.title.trim() || null : null,
        subtitle: draft.layout === "text" ? draft.subtitle.trim() || null : null,
      })
      .eq("id", banner.id);
    setSubmitting(false);
    if (error) {
      setErrorMsg("저장에 실패했어요.");
      return;
    }
    setEditing(false);
    onChanged();
    await revalidateHomeBanners();
    router.refresh();
  }

  async function remove() {
    if (!confirm("이 배너를 삭제할까요?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("home_banners").delete().eq("id", banner.id);
    if (error) {
      alert("삭제에 실패했어요.");
      return;
    }
    onChanged();
    await revalidateHomeBanners();
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-3 rounded-sm border border-line px-3.5 py-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-surface-2">
          {banner.backgroundImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={banner.backgroundImageUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">
            {banner.layout === "logo" ? banner.caption || "(문구 없음)" : banner.title || "(제목 없음)"}
          </p>
          <p className="truncate text-xs text-muted">
            {banner.layout === "logo" ? "로고형" : "텍스트형"} · {banner.href}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <div className="flex gap-1">
            <button
              onClick={() => onMove(-1)}
              disabled={!canMoveBack}
              aria-label="앞으로 이동"
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-muted hover:bg-line/50 disabled:opacity-30"
            >
              ◀
            </button>
            <button
              onClick={() => onMove(1)}
              disabled={!canMoveForward}
              aria-label="뒤로 이동"
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-muted hover:bg-line/50 disabled:opacity-30"
            >
              ▶
            </button>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setEditing(true)}
              className={buttonClass({ variant: "outline", size: "sm", full: false })}
            >
              수정
            </button>
            <button
              onClick={remove}
              className={buttonClass({ variant: "outline", size: "sm", full: false, className: "text-negative" })}
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-line px-3.5 py-3">
      <BannerForm draft={draft} setDraft={setDraft} onUpload={uploadImage} uploading={uploading} />
      {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={submitting || uploading}
          className={buttonClass({ variant: "custom", size: "sm", full: false, className: "flex-1 bg-rink text-white" })}
        >
          {submitting ? "저장 중..." : "저장"}
        </button>
        <button
          onClick={() => {
            setDraft(toDraft(banner));
            setEditing(false);
          }}
          className={buttonClass({ variant: "outline", size: "sm", full: false, className: "flex-1" })}
        >
          취소
        </button>
      </div>
    </div>
  );
}

export default function BannersManager({ initialBanners }: { initialBanners: HomeBanner[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState(initialBanners);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(toDraft());
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function refresh() {
    router.refresh();
  }

  // sort_order를 인접한 배너와 맞바꿔서 순서를 옮긴다 (ImageGalleryUploader의
  // 순서 이동 방식과 동일한 패턴).
  async function moveBanner(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= banners.length) return;
    const supabase = createClient();
    const a = banners[index];
    const b = banners[target];
    await Promise.all([
      supabase.from("home_banners").update({ sort_order: b.sortOrder }).eq("id", a.id),
      supabase.from("home_banners").update({ sort_order: a.sortOrder }).eq("id", b.id),
    ]);

    const next = [...banners];
    [next[index], next[target]] = [
      { ...next[target], sortOrder: a.sortOrder },
      { ...next[index], sortOrder: b.sortOrder },
    ];
    setBanners(next);
    await revalidateHomeBanners();
    router.refresh();
  }

  async function uploadImage(file: File) {
    setUploading(true);
    const supabase = createClient();
    try {
      const resized = await resizeImageToCover(file, IMAGE_SIZE, IMAGE_SIZE);
      const path = `banners/admin/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(path, resized, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("site-assets").getPublicUrl(path);
      setDraft((d) => ({ ...d, backgroundImageUrl: publicUrl }));
    } catch {
      setErrorMsg("사진 업로드에 실패했어요.");
    } finally {
      setUploading(false);
    }
  }

  async function addBanner(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.href.trim()) {
      setErrorMsg("링크를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("home_banners")
      .insert({
        href: draft.href.trim(),
        layout: draft.layout,
        background_image_url: draft.backgroundImageUrl || null,
        caption: draft.layout === "logo" ? draft.caption.trim() || null : null,
        title: draft.layout === "text" ? draft.title.trim() || null : null,
        subtitle: draft.layout === "text" ? draft.subtitle.trim() || null : null,
        sort_order: banners.length,
      })
      .select("id, href, background_image_url, layout, caption, title, subtitle, sort_order")
      .single();
    setSubmitting(false);

    if (error || !data) {
      setErrorMsg("추가에 실패했어요.");
      return;
    }

    setBanners((prev) => [
      ...prev,
      {
        id: data.id,
        href: data.href,
        backgroundImageUrl: data.background_image_url ?? undefined,
        layout: data.layout === "logo" ? "logo" : "text",
        caption: data.caption ?? undefined,
        title: data.title ?? undefined,
        subtitle: data.subtitle ?? undefined,
        sortOrder: data.sort_order,
      },
    ]);
    setDraft(toDraft());
    setAdding(false);
    await revalidateHomeBanners();
    router.refresh();
  }

  return (
    <div className={cardClass("flex flex-col gap-2.5")}>
      <p className="text-sm font-bold text-muted">
        홈 배너 {banners.length}개 — 홈 화면 최상단 슬라이드예요. 순서는 ◀/▶로 바꿀 수 있어요.
      </p>

      <div className="flex flex-col gap-2">
        {banners.map((b, i) => (
          <BannerRow
            key={b.id}
            banner={b}
            onChanged={refresh}
            onMove={(direction) => moveBanner(i, direction)}
            canMoveBack={i > 0}
            canMoveForward={i < banners.length - 1}
          />
        ))}
        {banners.length === 0 && <p className="py-4 text-sm text-muted">등록된 배너가 없어요.</p>}
      </div>

      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className={buttonClass({ variant: "custom", size: "sm", className: "border border-dashed border-line text-muted" })}
        >
          + 배너 추가
        </button>
      ) : (
        <form onSubmit={addBanner} className="flex flex-col gap-2 rounded-sm border border-line px-3.5 py-3">
          <BannerForm draft={draft} setDraft={setDraft} onUpload={uploadImage} uploading={uploading} />
          {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || uploading}
              className={buttonClass({ variant: "custom", size: "sm", full: false, className: "flex-1 bg-rink text-white" })}
            >
              {submitting ? "추가 중..." : "추가"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setDraft(toDraft());
              }}
              className={buttonClass({ variant: "outline", size: "sm", full: false, className: "flex-1" })}
            >
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
