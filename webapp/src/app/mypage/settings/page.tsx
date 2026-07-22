import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import { getCurrentParent, getMyProfile } from "@/lib/data";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const user = await getCurrentParent();
  if (!user) redirect("/login?next=/mypage/settings");

  const profile = await getMyProfile(user.id);

  return (
    <>
      <TopNav title="계정 설정" back />
      <main className="px-4 pb-10 pt-4">
        <SettingsForm profile={profile} />
      </main>
    </>
  );
}
