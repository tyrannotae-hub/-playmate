import { Suspense } from "react";
import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import { getCurrentParent } from "@/lib/data";
import NicknameForm from "./NicknameForm";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function NicknameOnboardingPage() {
  const user = await getCurrentParent();
  if (!user) redirect("/login");

  return (
    <>
      <TopNav />
      <main className="flex flex-col items-center px-6 pb-10 pt-16 text-center">
        <div className="text-2xl font-extrabold tracking-tight">
          PlayMate<span className="text-energy">.</span>
        </div>
        <h1 className="mt-4 text-lg font-bold">닉네임을 설정해주세요</h1>
        <p className="mt-2 text-sm text-muted">
          다른 학부모들에게 보여질 이름이에요
        </p>
        <Suspense fallback={null}>
          <NicknameForm userId={user.id} />
        </Suspense>
      </main>
    </>
  );
}
