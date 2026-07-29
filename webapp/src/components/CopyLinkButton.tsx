"use client";

import { useState } from "react";

export default function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // 클립보드 API를 못 쓰는 환경(구형 브라우저 등) 대비 폴백
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="이 페이지 링크 복사"
      className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2"
    >
      <span className="text-xs font-bold">{copied ? "복사됨 ✓" : "🔗 링크 복사"}</span>
    </button>
  );
}
