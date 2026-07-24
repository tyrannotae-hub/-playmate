"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AvatarUpload from "@/components/AvatarUpload";

// 코치 프로필 사진: 클럽 커버/클래스 사진과 마찬가지로 클라이언트에서 정사각형으로 고정 리사이즈
const AVATAR_SIZE = 320;

export default function InstructorAvatarUpload({
  facilityId,
  instructorId,
  profileImageUrl,
  onUploaded,
}: {
  facilityId: string;
  instructorId: string;
  profileImageUrl: string;
  onUploaded: (url: string) => void;
}) {
  const router = useRouter();

  async function handleUploaded(url: string) {
    const supabase = createClient();
    const { error } = await supabase.from("instructors").update({ profile_image_url: url }).eq("id", instructorId);
    if (error) throw error;
    onUploaded(url);
    router.refresh();
  }

  return (
    <AvatarUpload
      bucket="instructor-profiles"
      path={`${facilityId}/${instructorId}.jpg`}
      currentUrl={profileImageUrl}
      placeholder="🧑"
      size={56}
      pixels={AVATAR_SIZE}
      label="프로필 사진 변경"
      onUploaded={handleUploaded}
    />
  );
}
