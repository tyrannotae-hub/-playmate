"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FacilityInstructor } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";
import InstructorCard from "./InstructorCard";

export default function InstructorsClient({
  facilityId,
  initialInstructors,
}: {
  facilityId: string;
  initialInstructors: FacilityInstructor[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [careerYears, setCareerYears] = useState(0);
  const [certified, setCertified] = useState(false);
  const [certifiedBy, setCertifiedBy] = useState("");
  const [bio, setBio] = useState("");

  async function createInstructor(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();

    const { error } = await supabase.from("instructors").insert({
      facility_id: facilityId,
      name,
      career_years: careerYears,
      certification_verified: certified,
      certified_by: certified ? certifiedBy || null : null,
      bio,
    });

    setSubmitting(false);
    if (error) {
      setErrorMsg("코치 등록에 실패했어요.");
      return;
    }

    setAdding(false);
    setName("");
    setCareerYears(0);
    setCertified(false);
    setCertifiedBy("");
    setBio("");
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted">등록된 코치</p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className={buttonClass({
              variant: "custom",
              size: "sm",
              full: false,
              className: "bg-rink text-white",
            })}
          >
            + 코치 등록
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={createInstructor} className={cardClass("mt-3 flex flex-col gap-3")}>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">이름</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 김코치"
              className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">경력 연수</label>
            <input
              type="number"
              min={0}
              value={careerYears}
              onChange={(e) => setCareerYears(Number(e.target.value))}
              className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={certified}
              onChange={(e) => setCertified(e.target.checked)}
            />
            자격증 인증 완료
          </label>
          {certified && (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-muted">발급처</label>
              <input
                value={certifiedBy}
                onChange={(e) => setCertifiedBy(e.target.value)}
                placeholder="예: 대한빙상경기연맹"
                className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">소개</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="학부모에게 보여줄 코치 소개를 적어주세요"
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
                full: false,
                className: "flex-1 bg-rink text-white",
              })}
            >
              {submitting ? "등록 중..." : "코치 등록"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className={buttonClass({ variant: "outline", full: false, className: "px-5" })}
            >
              취소
            </button>
          </div>
          <p className="text-xs text-muted">
            프로필 사진은 등록 후 코치 카드에서 바로 업로드할 수 있어요.
          </p>
        </form>
      )}

      <div className="mt-4 flex flex-col gap-2.5">
        {initialInstructors.map((i) => (
          <InstructorCard key={i.id} facilityId={facilityId} instructor={i} />
        ))}
        {initialInstructors.length === 0 && !adding && (
          <p className="py-4 text-sm text-muted">등록된 코치가 없어요.</p>
        )}
      </div>
    </>
  );
}
