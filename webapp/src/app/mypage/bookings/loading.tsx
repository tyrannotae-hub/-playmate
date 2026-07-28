import TopNav from "@/components/TopNav";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <TopNav title="내 클래스" />
      <main className="px-4 pb-10 pt-4">
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-24 rounded-sm" />
          <Skeleton className="h-24 rounded-sm" />
          <Skeleton className="h-24 rounded-sm" />
        </div>
      </main>
    </>
  );
}
