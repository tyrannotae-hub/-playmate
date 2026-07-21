import RecommendClient from "./RecommendClient";
import { getAllClasses, getSports } from "@/lib/data";

export default async function RecommendPage() {
  const [sports, classes] = await Promise.all([getSports(), getAllClasses()]);
  const classCounts: Record<string, number> = {};
  classes.forEach((c) => {
    classCounts[c.sportId] = (classCounts[c.sportId] ?? 0) + 1;
  });

  return <RecommendClient sports={sports} classCounts={classCounts} />;
}
