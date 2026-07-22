"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ParentProfile } from "@/lib/types";
import { REGION_OPTIONS } from "@/lib/region-meta";
import { buttonClass } from "@/lib/ui";

export default function SettingsForm({ profile }: { profile: ParentProfile }) {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [address, setAddress] = useState(profile.address);
  const [regionCode, setRegionCode] = useState(profile.regionCode);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSaved(false);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("parents")
      .update({ name, address, region_code: regionCode || null })
      .eq("id", user.id);

    setSubmitting(false);
    if (error) {
      setErrorMsg("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-bold">닉네임</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 민준맘"
          className="w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-bold">지역</label>
        <select
          value={regionCode}
          onChange={(e) => setRegionCode(e.target.value)}
          className="w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-sm"
        >
          <option value="">선택 안 함</option>
          {REGION_OPTIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-muted">검색할 때 기본 지역 필터로 쓰여요</p>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-bold">
          주소 <span className="font-normal text-muted">(선택)</span>
        </label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="예: 서울 강남구 역삼동"
          className="w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-sm"
        />
      </div>

      {errorMsg && <p className="text-sm text-negative">{errorMsg}</p>}
      {saved && <p className="text-sm font-bold text-good">저장됐어요</p>}

      <button type="submit" disabled={submitting} className={buttonClass({ className: "mt-2" })}>
        {submitting ? "저장 중..." : "저장하기"}
      </button>
    </form>
  );
}
