import { Suspense } from "react";
import SearchClient from "./SearchClient";
import {
  facilitiesFromClasses,
  getAllClasses,
  getCurrentParent,
  getMyFacilityWishlistIds,
  getMyProfile,
  getMyWishlistIds,
  getSports,
} from "@/lib/data";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const [classes, sports, user] = await Promise.all([
    getAllClasses(),
    getSports(),
    getCurrentParent(),
  ]);
  const [profile, wishedIds, wishedFacilityIds] = user
    ? await Promise.all([
        getMyProfile(user.id),
        getMyWishlistIds(user.id),
        getMyFacilityWishlistIds(user.id),
      ])
    : [null, [], []];
  const facilities = await facilitiesFromClasses(classes);

  return (
    <Suspense fallback={null}>
      <SearchClient
        classes={classes}
        facilities={facilities}
        sports={sports}
        initialRegion={profile?.regionCode ?? ""}
        wishedIds={wishedIds}
        wishedFacilityIds={wishedFacilityIds}
      />
    </Suspense>
  );
}
