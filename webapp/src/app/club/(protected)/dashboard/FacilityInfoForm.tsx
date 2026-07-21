"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClubFacility } from "@/lib/types";

export default function FacilityInfoForm({ facility }: { facility: ClubFacility }) {
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(facility.address);
  const [phone, setPhone] = useState(facility.phone);
  const [description, setDescription] = useState(facility.description);
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
      .update({ address, phone, description })
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
      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="font-bold">{facility.name}</p>
        <p className="mt-1 text-sm text-muted">{address || "주소 미입력"}</p>
        <p className="mt-1 text-sm text-muted">{phone || "연락처 미입력"}</p>
        {description && <p className="mt-2 text-sm">{description}</p>}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded-full border border-line px-3.5 py-2 text-xs font-bold text-muted"
          >
            정보 수정
          </button>
          {saved && <span className="text-xs font-bold text-good">저장됐어요</span>}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={save}
      className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4"
    >
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
      {errorMsg && <p className="text-xs text-energy">{errorMsg}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-full bg-rink py-2.5 text-xs font-bold text-white disabled:opacity-40"
        >
          저장
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-full border border-line px-4 py-2.5 text-xs font-bold text-muted"
        >
          취소
        </button>
      </div>
    </form>
  );
}
