import { getCurrentClubOwner, getMyFacility, getMyNotices } from "@/lib/club-data";
import CoverImageUpload from "./CoverImageUpload";
import NoticesManager from "./NoticesManager";
import FacilityInfoForm from "../dashboard/FacilityInfoForm";

export default async function ClubHomePage() {
  const owner = await getCurrentClubOwner();
  if (!owner) return null;

  const [facility, notices] = await Promise.all([
    getMyFacility(owner.facilityId),
    getMyNotices(owner.facilityId),
  ]);
  if (!facility) return null;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="mb-2.5 text-sm font-bold text-muted">커버 이미지</p>
        <CoverImageUpload facilityId={facility.id} coverImageUrl={facility.coverImageUrl} />
      </div>

      <div>
        <p className="mb-2.5 text-sm font-bold text-muted">소개</p>
        <FacilityInfoForm facility={facility} />
      </div>

      <NoticesManager facilityId={facility.id} initialNotices={notices} />
    </div>
  );
}
