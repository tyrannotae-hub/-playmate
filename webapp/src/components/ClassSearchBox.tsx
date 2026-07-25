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
          fill="currentColor"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        >
          <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.47 6.47 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="클래스, 팀, 코치 이름으로 검색"
          className="w-full rounded-lg border border-line bg-surface py-3 pl-10 pr-3.5 text-sm"
        />
      </div>
    </form>
  );
}
