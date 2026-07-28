import { getAllSportsForAdmin } from "@/lib/admin-data";
import SportsManager from "./SportsManager";

export default async function AdminSportsPage() {
  const sports = await getAllSportsForAdmin();

  return <SportsManager initialSports={sports} />;
}
