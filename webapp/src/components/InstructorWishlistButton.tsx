"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InstructorWishlistButton({
  instructorId,
  initialWished,
  initialCount = 0,
  size = "md",
}: {
  instructorId: string;
  initialWished: boolean;
  initialCount?: number;
  size?: "md" | "sm";
}) {
  const [wished, setWished] = useState(initialWished);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setPending(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?next=/");
      return;
    }

    if (wished) {
      await supabase
        .from("instructor_wishlists")
        .delete()
        .eq("parent_id", user.id)
        .eq("instructor_id", instructorId);
      setWished(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await supabase
        .from("instructor_wishlists")
        .insert({ parent_id: user.id, instructor_id: instructorId });
      setWished(true);
      setCount((c) => c + 1);
    }
    setPending(false);
  }

  const dim = size === "sm" ? "h-7 text-sm" : "h-9 text-lg";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={wished ? "좋아요 취소" : "좋아요"}
      aria-pressed={wished}
      className={`flex ${dim} flex-shrink-0 items-center gap-1 rounded-full bg-surface/90 px-2 shadow-card transition disabled:opacity-60`}
    >
      <span className={wished ? "text-negative" : "text-muted"}>{wished ? "♥" : "♡"}</span>
      {count > 0 && (
        <span className="text-[11px] font-bold leading-none text-muted">{count}</span>
      )}
    </button>
  );
}
