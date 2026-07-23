"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FacilityNotice } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";

export default function NoticesManager({
  facilityId,
  initialNotices,
}: {
  facilityId: string;
  initialNotices: FacilityNotice[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function addNotice(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();

    const { error } = await supabase
      .from("facility_notices")
      .insert({ facility_id: facilityId, title, content });

    setSubmitting(false);
    if (error) {
      setErrorMsg("공지 등록에 실패했어요.");
      return;
    }
    setTitle("");
    setContent("");
    setAdding(false);
    router.refresh();
  }

  async function deleteNotice(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("facility_notices").delete().eq("id", id);
    if (!error) router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted">공지사항</p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className={buttonClass({ variant: "outline", size: "sm", full: false })}
          >
            + 공지 추가
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={addNotice} className={cardClass("mt-2.5 flex flex-col gap-3")}>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
          />
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용"
            rows={3}
            className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
          />
          {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className={buttonClass({ size: "sm", full: false, className: "flex-1" })}
            >
              등록
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className={buttonClass({ variant: "outline", size: "sm", full: false, className: "px-4" })}
            >
              취소
            </button>
          </div>
        </form>
      )}

      <div className="mt-2.5 flex flex-col gap-2.5">
        {initialNotices.map((n) => (
          <div key={n.id} className={cardClass()}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">{n.title}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-muted">{n.content}</p>
                <p className="mt-1.5 text-[11px] text-muted">
                  {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <button
                onClick={() => deleteNotice(n.id)}
                className={buttonClass({ variant: "outline", size: "sm", full: false })}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
        {initialNotices.length === 0 && !adding && (
          <p className="py-4 text-sm text-muted">등록된 공지가 없어요.</p>
        )}
      </div>
    </div>
  );
}
