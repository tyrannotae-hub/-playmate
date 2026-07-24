"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AvatarUpload from "@/components/AvatarUpload";

// 앱 전체 사진 규격 통일 방침에 따라 프로필 사진도 정방형으로 고정
const PROFILE_SIZE = 800;

export default function ProfilePhotoUpload({
  facilityId,
  profileImageUrl,
}: {
  facilityId: string;
  profileImageUrl: string;
}) {
  const router = useRouter();

  async function onUploaded(url: string) {
    const supabase = createClient();
    const { error } = await supabase.from("facilities").update({ profile_image_url: url }).eq("id", facilityId);
    if (error) throw error;
    router.refresh();
  }

  return (
    <div>
      <AvatarUpload
        bucket="facility-covers"
        path={`${facilityId}/profile.jpg`}
        currentUrl={profileImageUrl}
        placeholder={<span className="text-center text-[10px] text-muted">프로필 사진 없음</span>}
        size={96}
        pixels={PROFILE_SIZE}
        shape="square"
        label="프로필 사진 업로드"
        onUploaded={onUploaded}
      />
      <p className="mt-1.5 text-xs text-muted">
        어떤 사진을 올려도 {PROFILE_SIZE}×{PROFILE_SIZE}(정방형) 크기로 자동 맞춰져요
      </p>
    </div>
  );
}
