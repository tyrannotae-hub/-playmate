import Link from "next/link";
import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import StatusBadge from "@/components/StatusBadge";
import LogoutButton from "./LogoutButton";
import ChildrenSection from "./ChildrenSection";
import { getCurrentParent, getMyBookings, getMyChildren, getMyProfile } from "@/lib/data";
import { buttonClass, cardClass } from "@/lib/ui";

export const runtime = "edge";

export default async function MyPage() {
  const user = await getCurrentParent();
  if (!user) redirect("/login?next=/mypage");

  const [profile, children, bookings] = await Promise.all([
    getMyProfile(user.id),
    getMyChildren(),
    getMyBookings(),
  ]);

  return (
    <>
      <TopNav title="마이페이지" />
      <main className="px-4 pb-10 pt-4">
        <div className="flex items-center gap-3">
          {profile.avatarUrl && (
            <div
              className="h-11 w-11 shrink-0 rounded-full border border-line bg-surface-2 bg-cover bg-center"
              style={{ backgroundImage: `url(${profile.avatarUrl})` }}
            />
          )}
          <h2 className="text-lg font-extrabold">{profile.name}</h2>
        </div>

        <p className="mb-2.5 mt-6 text-sm font-bold text-muted">내 자녀</p>
        <ChildrenSection parentId={user.id} initialChildren={children} />

        <p className="mb-2.5 mt-7 text-sm font-bold text-muted">예약 내역</p>
        <div className="flex flex-col gap-2.5">
          {bookings.map((b) => (
            <div key={b.id} className={cardClass()}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{b.className}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {b.facilityName} · {b.childName}
                  </p>
                  <p className="mt-1 text-xs text-muted">{b.scheduleLabel}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              {b.status === "completed" && (
                <Link
                  href={`/review/${b.id}`}
                  className="btn-label mt-3 inline-block rounded-md bg-rink-soft px-3 py-1.5 text-xs font-bold text-rink-deep"
                >
                  리뷰 쓰기
                </Link>
              )}
            </div>
          ))}
          {bookings.length === 0 && (
            <p className="py-4 text-sm text-muted">아직 예약 내역이 없어요.</p>
          )}
        </div>

        <div className="mt-8 flex gap-2">
          <Link
            href="/mypage/settings"
            className={buttonClass({ variant: "outline", full: false, className: "flex-1 text-center" })}
          >
            계정 설정
          </Link>
          <LogoutButton />
        </div>
      </main>
    </>
  );
}
