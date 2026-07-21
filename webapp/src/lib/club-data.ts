import { createClient } from "@/lib/supabase/server";
import { yearsSince } from "@/lib/data";
import { ClubBooking, ClubClass, ClubFacility, ClubOwner, FacilityNotice } from "@/lib/types";

export async function getCurrentClubOwner(): Promise<ClubOwner | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("club_owners")
    .select("id, name, facility_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;
  return { id: data.id, name: data.name, facilityId: data.facility_id };
}

export async function getMyFacility(facilityId: string): Promise<ClubFacility | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("facilities")
    .select("id, name, address, phone, description, cover_image_url")
    .eq("id", facilityId)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    phone: data.phone ?? "",
    description: data.description ?? "",
    coverImageUrl: data.cover_image_url ?? "",
  };
}

export async function getMyNotices(facilityId: string): Promise<FacilityNotice[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("facility_notices")
    .select("id, title, content, created_at")
    .eq("facility_id", facilityId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    createdAt: n.created_at,
  }));
}

export async function getMyClasses(facilityId: string): Promise<ClubClass[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("teams_classes")
    .select(
      "id, name, sport_id, age_min, age_max, class_type, price, price_unit, instructor:instructors(name), class_schedules(*)"
    )
    .eq("facility_id", facilityId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const instructor = row.instructor as unknown as { name: string } | null;
    const schedules = (
      row.class_schedules as unknown as {
        id: string;
        day_label: string;
        time_label: string;
        slot_capacity: number;
        slot_booked_count: number;
      }[]
    ).map((s) => ({
      id: s.id,
      dayLabel: s.day_label,
      timeLabel: s.time_label,
      capacity: s.slot_capacity,
      booked: s.slot_booked_count,
    }));

    return {
      id: row.id,
      name: row.name,
      sportId: row.sport_id,
      instructorName: instructor?.name ?? "미정",
      ageMin: row.age_min,
      ageMax: row.age_max,
      classType: row.class_type,
      price: row.price,
      priceUnit: row.price_unit,
      schedules,
    };
  });
}

export async function getMyClubBookings(facilityId: string): Promise<ClubBooking[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(
      "id, status, requested_at, child:children(name, birth_date), team_class:teams_classes!inner(name, facility_id), class_schedule:class_schedules(day_label, time_label)"
    )
    .eq("team_class.facility_id", facilityId)
    .order("requested_at", { ascending: false });

  return (data ?? []).map((b) => {
    const teamClass = b.team_class as unknown as { name: string } | null;
    const schedule = b.class_schedule as unknown as {
      day_label: string;
      time_label: string;
    } | null;
    const child = b.child as unknown as { name: string; birth_date: string } | null;

    return {
      id: b.id,
      className: teamClass?.name ?? "",
      scheduleLabel: schedule ? `${schedule.day_label} ${schedule.time_label}` : "",
      childName: child?.name ?? "",
      childAge: child ? yearsSince(child.birth_date) : 0,
      status: b.status,
      requestedAt: b.requested_at,
    };
  });
}
