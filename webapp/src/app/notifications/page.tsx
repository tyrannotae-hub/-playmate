import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import NotificationList from "./NotificationList";
import { getCurrentParent, getMyNotifications } from "@/lib/data";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentParent();
  if (!user) redirect("/login?next=/notifications");

  const notifications = await getMyNotifications(user.id);

  return (
    <>
      <TopNav title="알림" back />
      <main className="px-4 pb-10 pt-4">
        <NotificationList initial={notifications} />
      </main>
    </>
  );
}
