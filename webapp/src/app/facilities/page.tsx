import { Suspense } from "react";
import FacilitiesClient from "./FacilitiesClient";
import { getAllFacilities, getCurrentParent, getMyProfile, getSports } from "@/lib/data";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function FacilitiesPage() {
  const [facilities, sports, user] = await Promise.all([
    getAllFacilities(),
    getSports(),
    getCurrentParent(),
  ]);
  const profile = user ? await getMyProfile(user.id) : null;

  return (
    <Suspense fallback={null}>
      <FacilitiesClient
        facilities={facilities}
        sports={sports}
        initialRegion={profile?.regionCode ?? ""}
      />
    </Suspense>
  );
}
