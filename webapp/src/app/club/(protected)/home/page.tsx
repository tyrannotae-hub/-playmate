import {
  getCurrentClubOwner,
  getMyClasses,
  getMyFacility,
  getMyHomeCategories,
  getMyNotices,
  getMyPromoImages,
} from "@/lib/club-data";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import PromoImagesManager from "./PromoImagesManager";
import HomeCategoriesManager from "./HomeCategoriesManager";
import NoticesManager from "./NoticesManager";
import FacilityInfoForm from "../dashboard/FacilityInfoForm";

export default async function ClubHomePage() {
  const owner = await getCurrentClubOwner();
  if (!owner) return null;

  const [facility, notices, promoImages, homeCategories, myClasses] = await Promise.all([
    getMyFacility(owner.facilityId),
    getMyNotices(owner.facilityId),
    getMyPromoImages(owner.facilityId),
    getMyHomeCategories(owner.facilityId),
    getMyClasses(owner.facilityId),
  ]);
  if (!facility) return null;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="mb-2.5 text-sm font-bold text-muted">프로필 사진</p>
        <ProfilePhotoUpload facilityId={facility.id} profileImageUrl={facility.profileImageUrl} />
      </div>

      <div>
        <PromoImagesManager facilityId={facility.id} initialImages={promoImages} />
      </div>

      <HomeCategoriesManager
        facilityId={facility.id}
        initialCategories={homeCategories}
        myClasses={myClasses.map((c) => ({ id: c.id, name: c.name }))}
      />

      <div>
        <p className="mb-2.5 text-sm font-bold text-muted">소개</p>
        <FacilityInfoForm facility={facility} />
      </div>

      <NoticesManager facilityId={facility.id} initialNotices={notices} />
    </div>
  );
}
