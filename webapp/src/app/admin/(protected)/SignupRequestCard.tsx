"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClubSignupRequest } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";

const STATUS_LABEL: Record<ClubSignupRequest["status"], string> = {
  pending: "대기중",
  approved: "승인됨",
  rejected: "거절됨",
};

const STATUS_CLASS: Record<ClubSignupRequest["status"], string> = {
  pending: "text-warn",
  approved: "text-good",
  rejected: "text-muted",
};

export default function SignupRequestCard({ request }: { request: ClubSignupRequest }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function respond(action: "approve" | "reject") {
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();

    const { error } = await supabase.rpc(
      action === "approve" ? "approve_club_signup" : "reject_club_signup",
      { p_request_id: request.id }
    );

    setSubmitting(false);
    if (error) {
      setErrorMsg("처리에 실패했어요. 다시 시도해주세요.");
      return;
    }
    router.refresh();
  }

  return (
    <div className={cardClass()}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold">{request.name}</p>
          <p className="mt-0.5 text-xs text-muted">
            아이디 {request.username} · {request.ownerType === "club" ? "클럽/팀" : "개인 코치"}
            {request.sportName && ` · ${request.sportName}`}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            신청일 {new Date(request.createdAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
        <span className={`shrink-0 text-xs font-bold ${STATUS_CLASS[request.status]}`}>
          {STATUS_LABEL[request.status]}
        </span>
      </div>

      {errorMsg && <p className="mt-2 text-xs text-negative">{errorMsg}</p>}

      {request.status === "pending" && (
        <div className="mt-3 flex gap-2">
          <button
            disabled={submitting}
            onClick={() => respond("approve")}
            className={buttonClass({
              variant: "custom",
              size: "sm",
              full: false,
              className: "flex-1 bg-rink text-white",
            })}
          >
            승인
          </button>
          <button
            disabled={submitting}
            onClick={() => respond("reject")}
            className={buttonClass({
              variant: "outline",
              size: "sm",
              full: false,
              className: "flex-1",
            })}
          >
            거절
          </button>
        </div>
      )}
    </div>
  );
}
