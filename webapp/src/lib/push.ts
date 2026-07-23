import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT;

if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export async function sendPushToParent(
  parentId: string,
  payload: { title: string; body: string; url?: string }
) {
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) return;

  const supabase = await createClient();
  // 호출자(클럽 운영자 세션)는 학부모의 push_subscriptions를 직접 조회할 RLS 권한이
  // 없으므로, cancel_booking()과 동일한 패턴으로 security definer RPC를 통해 읽음.
  const { data: subs } = (await supabase.rpc("get_parent_push_subscriptions", {
    p_parent_id: parentId,
  })) as { data: { id: string; endpoint: string; p256dh: string; auth_key: string }[] | null };

  if (!subs || subs.length === 0) return;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        // 구독이 만료/취소된 경우(410 Gone, 404) 더 이상 유효하지 않으므로 정리
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.rpc("delete_push_subscription", { p_id: sub.id });
        }
      }
    })
  );
}
