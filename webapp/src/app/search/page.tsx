import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { getAllClasses, getCurrentParent, getMyProfile, getSports } from "@/lib/data";

export default async function SearchPage() {
  const [classes, sports, user] = await Promise.all([
    getAllClasses(),
    getSports(),
    getCurrentParent(),
  ]);
  const profile = user ? await getMyProfile() : null;

  return (
    <Suspense fallback={null}>
      <SearchClient classes={classes} sports={sports} initialRegion={profile?.regionCode ?? ""} />
    </Suspense>
  );
}
