"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WishlistButton({
  classId,
  initialWished,
  size = "md",
}: {
  classId: string;
  initialWished: boolean;
  size?: "md" | "sm";
}) {
  const [wished, setWished] = useState(initialWished);
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
        .from("wishlists")
        .delete()
        .eq("parent_id", user.id)
        .eq("team_class_id", classId);
      setWished(false);
    } else {
      await supabase.from("wishlists").insert({ parent_id: user.id, team_class_id: classId });
      setWished(true);
    }
    setPending(false);
  }

  const dim = size === "sm" ? "h-7 w-7 text-sm" : "h-9 w-9 text-lg";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={wished ? "찜 해제" : "찜하기"}
      aria-pressed={wished}
      className={`flex ${dim} flex-shrink-0 items-center justify-center rounded-full bg-surface/90 shadow-card transition disabled:opacity-60`}
    >
      <span className={wished ? "text-negative" : "text-muted"}>{wished ? "♥" : "♡"}</span>
    </button>
  );
}
