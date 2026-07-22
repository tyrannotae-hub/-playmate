import TopNav from "@/components/TopNav";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <TopNav title="검색" back />
      <main className="pb-10 pt-3">
        <div className="mb-3 flex gap-2 px-4">
          <Skeleton className="h-9 w-20 flex-shrink-0 rounded-full" />
          <Skeleton className="h-9 w-20 flex-shrink-0 rounded-full" />
          <Skeleton className="h-9 w-20 flex-shrink-0 rounded-full" />
        </div>
        <div className="mb-4 flex gap-2 px-4">
          <Skeleton className="h-9 flex-1 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        <div className="flex flex-col gap-3 px-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </main>
    </>
  );
}
