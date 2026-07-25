import Link from "next/link";
import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import ActiveClassCard from "@/components/ActiveClassCard";
import LogoutButton from "./LogoutButton";
import ChildrenSection from "./ChildrenSection";
import PushSubscribeButton from "@/components/PushSubscribeButton";
import { getCurrentParent, getMyActiveClasses, getMyChildren, getMyProfile } from "@/lib/data";
import { buttonClass } from "@/lib/ui";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function MyPage() {
  const user = await getCurrentParent();
  if (!user) redirect("/login?next=/mypage");

  const [profile, children, activeClasses] = await Promise.all([
    getMyProfile(user.id),
    getMyChildren(),
    getMyActiveClasses(user.id),
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

        <div className="mt-4">
          <PushSubscribeButton />
        </div>

        {activeClasses.length > 0 && (
          <>
            <p className="mb-2.5 mt-7 text-sm font-bold text-muted">수강중인 클래스</p>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {activeClasses.map((c) => (
                <ActiveClassCard key={c.bookingId} item={c} />
              ))}
            </div>
          </>
        )}

        <p className="mb-2.5 mt-7 text-sm font-bold text-muted">내 자녀</p>
        <ChildrenSection parentId={user.id} initialChildren={children} />

        <div className="mt-7 flex flex-col divide-y divide-line border-y border-line">
          <Link
            href="/mypage/bookings"
            className="flex items-center gap-3 py-3.5 transition hover:bg-surface-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted">
              <CalendarIcon />
            </span>
            <span className="flex-1 text-sm font-bold">내 클래스 전체보기</span>
            <ChevronIcon />
          </Link>
          <Link
            href="/mypage/reviews"
            className="flex items-center gap-3 py-3.5 transition hover:bg-surface-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted">
              <StarIcon />
            </span>
            <span className="flex-1 text-sm font-bold">내가 쓴 리뷰 전체보기</span>
            <ChevronIcon />
          </Link>
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

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 12h-5v5h5v-5ZM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1zm3 18H5V8h14Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3.5 14.8 9.2 21 10.1 16.5 14.5 17.6 20.7 12 17.7 6.4 20.7 7.5 14.5 3 10.1 9.2 9.2Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-line">
      <path d="M8.5 5 7.1 6.4l5.6 5.6-5.6 5.6L8.5 19l7-7Z" />
    </svg>
  );
}
