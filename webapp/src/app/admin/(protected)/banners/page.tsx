import { getAllHomeBannersForAdmin } from "@/lib/admin-data";
import BannersManager from "./BannersManager";

export default async function AdminBannersPage() {
  const banners = await getAllHomeBannersForAdmin();

  return <BannersManager initialBanners={banners} />;
}
