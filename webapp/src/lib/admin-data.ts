import { createClient } from "@/lib/supabase/server";
import { Admin, ClubSignupRequest, Sport } from "@/lib/types";

export async function getCurrentAdmin(): Promise<Admin | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("admins")
    .select("id, name, username")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;
  return { id: data.id, name: data.name, username: data.username };
}

export async function getAllSportsForAdmin(): Promise<Sport[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sports")
    .select("id, name, emoji, category, traits")
    .order("category")
    .order("name");
  return (data ?? []) as Sport[];
}

export async function getClubSignupRequests(): Promise<ClubSignupRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("club_signup_requests")
    .select(
      "id, username, name, owner_type, status, created_at, reviewed_at, wants_academy, wants_lesson, business_reg_number, sport:sports(name)"
    )
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => {
    const sport = r.sport as unknown as { name: string } | null;
    return {
      id: r.id,
      username: r.username,
      name: r.name,
      ownerType: r.owner_type as "club" | "solo_coach",
      status: r.status as "pending" | "approved" | "rejected",
      createdAt: r.created_at,
      reviewedAt: r.reviewed_at ?? undefined,
      sportName: sport?.name,
      wantsAcademy: r.wants_academy,
      wantsLesson: r.wants_lesson,
      businessRegNumber: r.business_reg_number ?? undefined,
    };
  });
}
