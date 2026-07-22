import TopNav from "@/components/TopNav";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <TopNav />
      <main className="pb-10 pt-2">
        <div className="px-4">
          <Skeleton className="h-4 w-56" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>
        </div>

        <div className="mt-8 px-4">
          <Skeleton className="h-4 w-32" />
          <div className="mt-3 flex gap-3">
            <Skeleton className="h-16 w-16 flex-shrink-0 rounded-full" />
            <Skeleton className="h-16 w-16 flex-shrink-0 rounded-full" />
          </div>
        </div>

        <div className="mt-8 px-4">
          <Skeleton className="h-4 w-24" />
          <div className="mt-3 flex gap-1.5">
            <Skeleton className="h-52 w-14 flex-shrink-0 rounded-2xl" />
            <Skeleton className="h-52 w-14 flex-shrink-0 rounded-2xl" />
            <Skeleton className="h-52 w-14 flex-shrink-0 rounded-2xl" />
            <Skeleton className="h-52 w-14 flex-shrink-0 rounded-2xl" />
          </div>
        </div>
      </main>
    </>
  );
}
