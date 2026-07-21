import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import ClassCard from "@/components/ClassCard";
import { getFacilityHome } from "@/lib/data";
import { cardClass } from "@/lib/ui";

export default async function FacilityHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const facility = await getFacilityHome(id);
  if (!facility) notFound();

  return (
    <>
      <TopNav back />
      <main className="pb-10">
        <div
          className="flex aspect-[16/9] w-full items-center justify-center bg-rink-soft bg-cover bg-center"
          style={facility.coverImageUrl ? { backgroundImage: `url(${facility.coverImageUrl})` } : undefined}
        >
          {!facility.coverImageUrl && <span className="text-4xl">🏟️</span>}
        </div>

        <div className="px-4 pt-4">
          <h1 className="text-xl font-extrabold">{facility.name}</h1>
          <p className="mt-1 text-sm text-muted">{facility.address}</p>
          {facility.phone && <p className="mt-0.5 text-sm text-muted">{facility.phone}</p>}
          {facility.description && (
            <p className="mt-3 text-sm leading-relaxed">{facility.description}</p>
          )}

          {facility.notices.length > 0 && (
            <div className="mt-6">
              <p className="mb-2.5 text-sm font-bold text-muted">공지사항</p>
              <div className="flex flex-col gap-2.5">
                {facility.notices.map((n) => (
                  <div key={n.id} className={cardClass()}>
                    <p className="font-bold">{n.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{n.content}</p>
                    <p className="mt-1.5 text-[11px] text-muted">
                      {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7">
            <p className="mb-2.5 text-sm font-bold text-muted">
              운영 중인 클래스 ({facility.classes.length})
            </p>
            <div className="flex flex-col gap-3">
              {facility.classes.map((c) => (
                <ClassCard key={c.id} item={c} />
              ))}
              {facility.classes.length === 0 && (
                <p className="py-4 text-sm text-muted">등록된 클래스가 없어요.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
