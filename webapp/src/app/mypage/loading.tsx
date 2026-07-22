import TopNav from "@/components/TopNav";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <TopNav title="마이페이지" />
      <main className="px-4 pb-10 pt-4">
        <Skeleton className="h-5 w-24" />

        <Skeleton className="mb-2.5 mt-6 h-4 w-16" />
        <div className="flex gap-2">
          <Skeleton className="h-16 w-20 flex-shrink-0 rounded-2xl" />
          <Skeleton className="h-16 w-20 flex-shrink-0 rounded-2xl" />
        </div>

        <Skeleton className="mb-2.5 mt-7 h-4 w-20" />
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </main>
    </>
  );
}
