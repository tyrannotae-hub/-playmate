"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Child } from "@/lib/types";
import { buttonClass } from "@/lib/ui";
import AvatarUpload from "@/components/AvatarUpload";

function yearsSince(birthDate: string): number {
  return new Date().getFullYear() - new Date(birthDate).getFullYear();
}

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

    setChildren((prev) => [
      ...prev,
      { id: data.id, name: data.name, age: yearsSince(data.birth_date), birthDate: data.birth_date, photoUrl: "" },
    ]);
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

  function updateChildInState(updated: Child) {
    setChildren((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function removeChildFromState(childId: string) {
    setChildren((prev) => prev.filter((c) => c.id !== childId));
  }

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        {children.map((c) => (
          <ChildRow
            key={c.id}
            parentId={parentId}
            child={c}
            onPhotoUploaded={(url) => saveChildPhoto(c.id, url)}
            onUpdated={updateChildInState}
            onDeleted={() => removeChildFromState(c.id)}
          />
        ))}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-sm border border-dashed border-line px-4 py-3 text-left text-sm font-bold text-muted"
          >
            + 자녀 추가
          </button>
        )}
      </div>

      {adding && (
        <form
          onSubmit={addChild}
          className="mt-3 flex flex-col gap-3 rounded-sm border border-line bg-surface p-4"
        >
          <div>
            <label className="mb-1.5 block text-sm font-bold">자녀 이름</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 서준"
              className="w-full rounded-sm border border-line bg-background px-3.5 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold">생년월일</label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-sm border border-line bg-background px-3.5 py-3 text-sm"
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

function ChildRow({
  parentId,
  child,
  onPhotoUploaded,
  onUpdated,
  onDeleted,
}: {
  parentId: string;
  child: Child;
  onPhotoUploaded: (url: string) => void | Promise<void>;
  onUpdated: (child: Child) => void;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(child.name);
  const [birthDate, setBirthDate] = useState(child.birthDate);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase
      .from("children")
      .update({ name, birth_date: birthDate })
      .eq("id", child.id);

    setSaving(false);
    if (error) {
      setErrorMsg("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }
    onUpdated({ ...child, name, birthDate, age: yearsSince(birthDate) });
    setEditing(false);
  }

  async function deleteChild() {
    if (!confirm(`"${child.name}" 정보를 삭제할까요?`)) return;
    setDeleting(true);
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.from("children").delete().eq("id", child.id);

    setDeleting(false);
    if (error) {
      setErrorMsg(
        error.code === "23503"
          ? "이 자녀로 예약한 내역이 있어 삭제할 수 없어요."
          : "삭제에 실패했어요. 다시 시도해주세요."
      );
      return;
    }
    onDeleted();
  }

  if (editing) {
    return (
      <form
        onSubmit={saveEdit}
        className="flex flex-col gap-2.5 rounded-sm border border-line bg-surface p-3"
      >
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="자녀 이름"
          className="w-full rounded-sm border border-line bg-background px-3.5 py-2.5 text-sm"
        />
        <input
          type="date"
          required
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full rounded-sm border border-line bg-background px-3.5 py-2.5 text-sm"
        />
        {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className={buttonClass({ size: "sm", full: false, className: "flex-1" })}
          >
            {saving ? "저장 중..." : "저장"}
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

  return (
    <div className="flex flex-col gap-1.5 rounded-sm border border-line bg-surface p-3">
      <div className="flex items-center gap-3">
        <AvatarUpload
          path={`${parentId}/child-${child.id}.jpg`}
          currentUrl={child.photoUrl}
          initials={child.name.slice(0, 1)}
          size={48}
          onUploaded={onPhotoUploaded}
        />
        <p className="flex-1 text-sm font-bold">
          {child.name} <span className="font-normal text-muted">{child.age}세</span>
        </p>
        <div className="flex shrink-0 gap-1.5">
          <button
            onClick={() => setEditing(true)}
            className={buttonClass({ variant: "outline", size: "sm", full: false })}
          >
            수정
          </button>
          <button
            onClick={deleteChild}
            disabled={deleting}
            className={buttonClass({ variant: "outline", size: "sm", full: false })}
          >
            삭제
          </button>
        </div>
      </div>
      {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}
    </div>
  );
}
