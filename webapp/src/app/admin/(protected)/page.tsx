import { getClubSignupRequests } from "@/lib/admin-data";
import SignupRequestCard from "./SignupRequestCard";

export default async function AdminPage() {
  const requests = await getClubSignupRequests();

  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");

  return (
    <>
      <p className="text-sm font-bold text-muted">승인 대기 중인 가입 신청</p>
      <div className="mt-2.5 flex flex-col gap-2.5">
        {pending.map((r) => (
          <SignupRequestCard key={r.id} request={r} />
        ))}
        {pending.length === 0 && (
          <p className="py-4 text-sm text-muted">대기 중인 신청이 없어요.</p>
        )}
      </div>

      {reviewed.length > 0 && (
        <>
          <p className="mt-7 text-sm font-bold text-muted">처리 이력</p>
          <div className="mt-2.5 flex flex-col gap-2.5">
            {reviewed.map((r) => (
              <SignupRequestCard key={r.id} request={r} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
