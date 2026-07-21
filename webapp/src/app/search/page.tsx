import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { getAllClasses, getSports } from "@/lib/data";

export default async function SearchPage() {
  const [classes, sports] = await Promise.all([getAllClasses(), getSports()]);

  return (
    <Suspense fallback={null}>
      <SearchClient classes={classes} sports={sports} />
    </Suspense>
  );
}
