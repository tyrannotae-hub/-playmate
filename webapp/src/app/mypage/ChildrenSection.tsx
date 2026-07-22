"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Child } from "@/lib/types";
import { buttonClass } from "@/lib/ui";
import AvatarUpload from "@/components/AvatarUpload";

export default function ChildrenSection({
  parentId,
  initialChildren,
}: {
  parentId: string;
  initialChildren: Child[];
}) {
  const [children, setChildren] = useState(initialChildren);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function addChild(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("children")
      .insert({ parent_id: user.id, name, birth_date: birthDate })
      .select("id, name, birth_date")
      .single();

    setSubmitting(false);
    if (error || !data) {
      setErrorMsg("자녀 등록에 실패했어요. 다시 시도해주세요.");
      return;
    }

    const age = new Date().getFullYear() - new Date(data.birth_date).getFullYear();
    setChildren((prev) => [...prev, { id: data.id, name: data.name, age, photoUrl: "" }]);
    setName("");
    setBirthDate("");
    setAdding(false);
  }

  async function saveChildPhoto(childId: string, url: string) {
    const supabase = createClient();
    const { error } = await supabase.from("children").update({ photo_url: url }).eq("id", childId);
    if (error) throw error;
    setChildren((prev) => prev.map((c) => (c.id === childId ? { ...c, photoUrl: url } : c)));
  }

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        {children.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-md border border-line bg-surface p-3"
          >
            <AvatarUpload
              path={`${parentId}/child-${c.id}.jpg`}
              currentUrl={c.photoUrl}
              initials={c.name.slice(0, 1)}
              size={48}
              onUploaded={(url) => saveChildPhoto(c.id, url)}
            />
            <p className="text-sm font-bold">
              {c.name} <span className="font-normal text-muted">{c.age}세</span>
            </p>
          </div>
        ))}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-md border border-dashed border-line px-4 py-3 text-left text-sm font-bold text-muted"
          >
            + 자녀 추가
          </button>
        )}
      </div>

      {adding && (
        <form
          onSubmit={addChild}
          className="mt-3 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4"
        >
          <div>
            <label className="mb-1.5 block text-sm font-bold">자녀 이름</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 서준"
              className="w-full rounded-xl border border-line bg-background px-3.5 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold">생년월일</label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-xl border border-line bg-background px-3.5 py-3 text-sm"
            />
          </div>
          {errorMsg && <p className="text-sm text-negative">{errorMsg}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className={buttonClass({ full: false, className: "flex-1" })}
            >
              {submitting ? "등록 중..." : "등록하기"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className={buttonClass({ variant: "outline", full: false, className: "px-5" })}
            >
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
