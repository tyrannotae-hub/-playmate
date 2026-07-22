"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FacilityInstructor } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";
import InstructorAvatarUpload from "./InstructorAvatarUpload";

export default function InstructorCard({
  facilityId,
  instructor,
}: {
  facilityId: string;
  instructor: FacilityInstructor;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(instructor.profileImageUrl);
  const [name, setName] = useState(instructor.name);
  const [careerYears, setCareerYears] = useState(instructor.careerYears);
  const [certified, setCertified] = useState(instructor.certified);
  const [certifiedBy, setCertifiedBy] = useState(instructor.certifiedBy ?? "");
  const [bio, setBio] = useState(instructor.bio);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();

    const { error } = await supabase
      .from("instructors")
      .update({
        name,
        career_years: careerYears,
        certification_verified: certified,
        certified_by: certified ? certifiedBy || null : null,
        bio,
      })
      .eq("id", instructor.id);

    setSubmitting(false);
    if (error) {
      setErrorMsg("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function deleteInstructor() {
    if (!confirm(`"${instructor.name}" 코치를 삭제할까요? 배정된 클래스에서도 함께 해제돼요.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("instructors").delete().eq("id", instructor.id);
    if (error) {
      alert("코치 삭제에 실패했어요.");
      return;
    }
    router.refresh();
  }

  if (!editing) {
    return (
      <div className={cardClass()}>
        <div className="flex items-start justify-between gap-2">
          <InstructorAvatarUpload
            facilityId={facilityId}
            instructorId={instructor.id}
            profileImageUrl={profileImageUrl}
            onUploaded={setProfileImageUrl}
          />
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={() => setEditing(true)}
              className={buttonClass({ variant: "outline", size: "sm", full: false })}
            >
              정보 수정
            </button>
            <button
              onClick={deleteInstructor}
              className={buttonClass({ variant: "outline", size: "sm", full: false })}
            >
              삭제
            </button>
          </div>
        </div>
        <p className="mt-3 font-bold">{name}</p>
        <p className="mt-1 text-sm text-muted">경력 {careerYears}년</p>
        {certified && (
          <p className="btn-label mt-2 inline-flex items-center gap-1.5 rounded bg-rink-soft px-2.5 py-1 text-xs font-bold text-rink-deep">
            🏅 {certifiedBy || "자격 인증"} 인증완료
          </p>
        )}
        {bio && <p className="mt-2 text-sm leading-relaxed text-muted">{bio}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={save} className={cardClass("flex flex-col gap-3")}>
      <InstructorAvatarUpload
        facilityId={facilityId}
        instructorId={instructor.id}
        profileImageUrl={profileImageUrl}
        onUploaded={setProfileImageUrl}
      />
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted">이름</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-line bg-background px-3.5 py-3 text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted">경력 연수</label>
        <input
          type="number"
          min={0}
          value={careerYears}
          onChange={(e) => setCareerYears(Number(e.target.value))}
          className="w-full rounded-xl border border-line bg-background px-3.5 py-3 text-sm"
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
            className="w-full rounded-xl border border-line bg-background px-3.5 py-3 text-sm"
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
