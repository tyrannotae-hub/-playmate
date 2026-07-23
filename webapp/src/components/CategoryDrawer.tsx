"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sport } from "@/lib/types";
import SportIcon from "@/components/icons/SportIcon";

// 종목별 상세페이지(/sports/[sportId])는 아직 아이스하키만 시범 적용
const SPORT_PAGE_PILOT = new Set(["ice-hockey"]);

export default function CategoryDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [sports, setSports] = useState<Sport[] | null>(null);

  useEffect(() => {
    if (!open || sports) return;
    const supabase = createClient();
    supabase
      .from("sports")
      .select("id, name, emoji, category, traits")
      .then(({ data }) => setSports((data ?? []) as Sport[]));
  }, [open, sports]);

  const grouped: Record<string, Sport[]> = {};
  (sports ?? []).forEach((s) => {
    (grouped[s.category] ??= []).push(s);
  });

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col bg-surface shadow-elevated transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <p className="text-base font-bold">종목별 카테고리</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-line/50"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <Link
            href="/search"
            onClick={onClose}
            className="btn-label block rounded-md px-3 py-2.5 text-sm font-bold text-rink-deep transition hover:bg-rink-soft"
          >
            전체 종목 보기
          </Link>

          {sports === null && (
            <p className="px-3 py-4 text-sm text-muted">불러오는 중...</p>
          )}

          {Object.entries(grouped).map(([category, list]) => (
            <div key={category} className="mt-4">
              <p className="px-3 text-xs font-bold text-muted">{category}</p>
              <div className="mt-1 flex flex-col">
                {list.map((s) => (
                  <Link
                    key={s.id}
                    href={SPORT_PAGE_PILOT.has(s.id) ? `/sports/${s.id}` : `/search?sport=${s.id}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-semibold transition hover:bg-rink-soft"
                  >
                    <SportIcon sportId={s.id} size={19} />
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
