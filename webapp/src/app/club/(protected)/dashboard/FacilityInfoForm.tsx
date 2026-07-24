"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClubFacility } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";
import { REGION_OPTIONS, regionLabel } from "@/lib/region-meta";

export default function FacilityInfoForm({ facility }: { facility: ClubFacility }) {
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(facility.address);
  const [phone, setPhone] = useState(facility.phone);
  const [description, setDescription] = useState(facility.description);
  const [instagramUrl, setInstagramUrl] = useState(facility.instagramUrl);
  const [regions, setRegions] = useState<string[]>(facility.regions);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saved, setSaved] = useState(false);

  function toggleRegion(code: string) {
    setRegions((prev) => (prev.includes(code) ? prev.filter((r) => r !== code) : [...prev, code]));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (regions.length === 0) {
      setErrorMsg("운영 지역을 최소 1개 이상 선택해주세요.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("facilities")
      .update({
        address,
        phone,
        description,
        instagram_url: instagramUrl || null,
        region_code: regions[0],
      })
      .eq("id", facility.id);

    if (updateError) {
      setSubmitting(false);
      setErrorMsg("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }

    const { error: deleteRegionsError } = await supabase
      .from("facility_regions")
      .delete()
      .eq("facility_id", facility.id);

    if (deleteRegionsError) {
      setSubmitting(false);
      setErrorMsg("지역 저장에 실패했어요. 다시 시도해주세요.");
      return;
    }

    const { error: insertRegionsError } = await supabase
      .from("facility_regions")
      .insert(regions.map((region_code) => ({ facility_id: facility.id, region_code })));

    setSubmitting(false);
    if (insertRegionsError) {
      setErrorMsg("지역 저장에 실패했어요. 다시 시도해주세요.");
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
        <p className="mt-1 text-sm text-muted">
          {regions.length > 0 ? regions.map(regionLabel).join(", ") : "운영 지역 미선택"}
        </p>
        <p className="mt-1 text-sm text-muted">{address || "주소 미입력"}</p>
        <p className="mt-1 text-sm text-muted">{phone || "연락처 미입력"}</p>
        {description && <p className="mt-2 whitespace-pre-line text-sm">{description}</p>}
        <p className="mt-1 break-all text-sm text-muted">
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
        <label className="mb-1.5 block text-xs font-bold text-muted">
          운영 지역 <span className="font-normal">(학부모 검색 필터와 동일한 지역 목록, 최소 1개 필수, 중복 선택 가능)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {REGION_OPTIONS.map((r) => (
            <button
              key={r.code}
              type="button"
              onClick={() => toggleRegion(r.code)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition ${
                regions.includes(r.code) ? "bg-rink text-white" : "bg-rink-soft text-rink-deep"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted">주소</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted">연락처</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted">소개</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted">인스타그램 링크</label>
        <input
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://www.instagram.com/우리클럽"
          className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
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
