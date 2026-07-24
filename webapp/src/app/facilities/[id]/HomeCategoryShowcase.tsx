import { TeamClass, FacilityHomeCategory } from "@/lib/types";
import ClassCardCompact from "@/components/ClassCardCompact";

export default function HomeCategoryShowcase({
  categories,
  allClasses,
  wishedIds = [],
}: {
  categories: FacilityHomeCategory[];
  allClasses: TeamClass[];
  wishedIds?: string[];
}) {
  const classById = new Map(allClasses.map((c) => [c.id, c]));
  const wishedSet = new Set(wishedIds);

  return (
    <>
      {categories.map((category) => {
        const classes = category.classIds
          .map((id) => classById.get(id))
          .filter((c): c is TeamClass => !!c);

        if (classes.length === 0) return null;

        return (
          <div key={category.id} className="mt-8">
            <h2 className="mb-3 px-4 text-lg font-bold">{category.name}</h2>
            <div className="flex gap-3 overflow-x-auto px-4 pb-1">
              {classes.map((c) => (
                <ClassCardCompact
                  key={c.id}
                  item={c}
                  variant="scroll"
                  wished={wishedSet.has(c.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
