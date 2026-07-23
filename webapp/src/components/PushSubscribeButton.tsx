"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type Status = "checking" | "unsupported" | "off" | "on" | "denied";

export default function PushSubscribeButton() {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      const sub = await reg?.pushManager.getSubscription();
      setStatus(sub ? "on" : "off");
    });
  }, []);

  async function enable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return;

    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      setStatus("on");
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking" || status === "unsupported" || status === "on") return null;

  return (
    <button
      onClick={enable}
      disabled={busy || status === "denied"}
      className="flex w-full items-center justify-between rounded-md border border-line bg-surface px-3.5 py-3 text-left text-sm disabled:opacity-50"
    >
      <span>
        <span className="block font-bold">
          {status === "denied" ? "알림이 차단돼 있어요" : "예약 알림 받기"}
        </span>
        <span className="mt-0.5 block text-xs text-muted">
          {status === "denied"
            ? "브라우저 설정에서 이 사이트의 알림 권한을 허용해주세요"
            : "예약 확정/취소를 실시간으로 알려드려요"}
        </span>
      </span>
      {status !== "denied" && <span className="btn-label text-xs font-bold text-rink-deep">켜기</span>}
    </button>
  );
}
