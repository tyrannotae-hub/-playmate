import Link from "next/link";
import TopNav from "@/components/TopNav";
import ClassCard from "@/components/ClassCard";
import { classes, children } from "@/lib/mock-data";

export default function HomePage() {
  const child = children[0];

  return (
    <>
      <TopNav />
      <main className="px-4 pb-10 pt-2">
        <p className="mb-5 text-[15px] text-muted">
          안녕하세요 👋 {child.name}({child.age}세)의 운동을 찾아볼까요?
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/recommend"
            className="rounded-2xl border border-line bg-surface p-4 transition hover:border-rink"
          >
            <div className="text-xs font-bold text-muted">종목을 모르겠어요</div>
            <div className="mt-1 text-sm font-extrabold text-rink-deep">
              추천받기 →
            </div>
          </Link>
          <Link
            href="/search"
            className="rounded-2xl border border-line bg-surface p-4 transition hover:border-rink"
          >
            <div className="text-xs font-bold text-muted">종목을 이미 알아요</div>
            <div className="mt-1 text-sm font-extrabold text-rink-deep">
              바로 검색 →
            </div>
          </Link>
        </div>

        <h2 className="mb-3 mt-8 text-base font-bold">🔥 우리 동네 인기 클래스</h2>
        <div className="flex flex-col gap-3">
          {classes.slice(0, 3).map((c) => (
            <ClassCard key={c.id} item={c} />
          ))}
        </div>
      </main>
    </>
  );
}
