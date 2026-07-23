"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClassSearchBox({
  initialQuery = "",
  sportId,
}: {
  initialQuery?: string;
  sportId?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (sportId) params.set("sport", sportId);
    if (query.trim()) params.set("q", query.trim());
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form onSubmit={submit} className="px-4">
      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="클래스, 팀, 코치 이름으로 검색"
          className="w-full rounded-md border border-line bg-surface py-3 pl-10 pr-3.5 text-sm"
        />
      </div>
    </form>
  );
}
