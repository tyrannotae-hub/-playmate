import { createClient } from "@/lib/supabase/server";
import { Admin, ClubSignupRequest } from "@/lib/types";

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

export async function getClubSignupRequests(): Promise<ClubSignupRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("club_signup_requests")
    .select("id, username, name, owner_type, status, created_at, reviewed_at")
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id,
    username: r.username,
    name: r.name,
    ownerType: r.owner_type as "club" | "solo_coach",
    status: r.status as "pending" | "approved" | "rejected",
    createdAt: r.created_at,
    reviewedAt: r.reviewed_at ?? undefined,
  }));
}
