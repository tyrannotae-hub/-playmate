"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClubFacility } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";

export default function FacilityInfoForm({ facility }: { facility: ClubFacility }) {
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(facility.address);
  const [phone, setPhone] = useState(facility.phone);
  const [description, setDescription] = useState(facility.description);
  const [instagramUrl, setInstagramUrl] = useState(facility.instagramUrl);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();

    const { error } = await supabase
      .from("facilities")
      .update({ address, phone, description, instagram_url: instagramUrl || null })
      .eq("id", facility.id);

    setSubmitting(false);
    if (error) {
      setErrorMsg("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!editing) {
    return (
      <div className={cardClass()}>
        <p className="font-bold">{facility.name}</p>
        <p className="mt-1 text-sm text-muted">{address || "주소 미입력"}</p>
        <p className="mt-1 text-sm text-muted">{phone || "연락처 미입력"}</p>
        {description && <p className="mt-2 text-sm">{description}</p>}
        <p className="mt-1 text-sm text-muted">
          {instagramUrl || "인스타그램 링크 미입력"}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className={buttonClass({ variant: "outline", size: "sm", full: false })}
          >
            정보 수정
          </button>
          {saved && <span className="text-xs font-bold text-good">저장됐어요</span>}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={save} className={cardClass("flex flex-col gap-3")}>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted">주소</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-xl border border-line bg-background px-3.5 py-3 text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted">연락처</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-line bg-background px-3.5 py-3 text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted">소개</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-line bg-background px-3.5 py-3 text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted">인스타그램 링크</label>
        <input
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://www.instagram.com/우리클럽"
          className="w-full rounded-xl border border-line bg-background px-3.5 py-3 text-sm"
        />
      </div>
      {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className={buttonClass({
            variant: "custom",
            size: "sm",
            full: false,
            className: "flex-1 bg-rink text-white",
          })}
        >
          저장
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className={buttonClass({ variant: "outline", size: "sm", full: false, className: "px-4" })}
        >
          취소
        </button>
      </div>
    </form>
  );
}
