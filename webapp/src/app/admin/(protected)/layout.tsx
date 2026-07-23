import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-data";

// 학부모/클럽 세션과 완전히 독립된 관리자 인증. cookies()를 쓰는 getCurrentAdmin()을
// 다른 fetch보다 먼저 단독으로 await하고, 혹시 모를 캐시 버그를 막기 위해
// force-dynamic도 함께 명시한다 (오늘 있었던 Promise.all dynamic 인식 실패 버그 재발 방지).
export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <>
      <header className="shadow-card sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3.5">
          <div>
            <p className="btn-label text-xs font-bold text-muted">관리자</p>
            <p className="text-base font-extrabold">{admin.name}</p>
          </div>
        </div>
      </header>
      <main className="px-4 pb-10 pt-5">{children}</main>
    </>
  );
}
