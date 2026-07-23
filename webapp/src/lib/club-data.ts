import { createClient } from "@/lib/supabase/server";
import { yearsSince } from "@/lib/data";
import {
  ClubBooking,
  ClubClass,
  ClubFacility,
  ClubOwner,
  FacilityInstructor,
  FacilityNotice,
} from "@/lib/types";

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
    .select(
      "id, name, address, phone, description, cover_image_url, instagram_url, owner_type"
    )
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
    instagramUrl: data.instagram_url ?? "",
    ownerType: (data.owner_type as "club" | "solo_coach") ?? "club",
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

export async function getMyInstructors(facilityId: string): Promise<FacilityInstructor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("instructors")
    .select("id, name, career_years, certification_verified, certified_by, bio, profile_image_url")
    .eq("facility_id", facilityId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((i) => ({
    id: i.id,
    name: i.name,
    careerYears: i.career_years ?? 0,
    certified: i.certification_verified ?? false,
    certifiedBy: i.certified_by ?? undefined,
    bio: i.bio ?? "",
    profileImageUrl: i.profile_image_url ?? "",
    // 클럽 대시보드(본인 지도자 관리 화면)에서는 찜 개수를 노출하지 않아 0으로 둔다.
    wishCount: 0,
  }));
}

export async function getMyClasses(facilityId: string): Promise<ClubClass[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("teams_classes")
    .select(
      "id, name, sport_id, age_min, age_max, class_type, price, price_unit, description, collect_height, collect_shoe_size, collect_residence, class_instructors(instructor:instructors(id,name)), class_schedules(*), class_images(url, sort_order)"
    )
    .eq("facility_id", facilityId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const instructors = (
      row.class_instructors as unknown as { instructor: { id: string; name: string } | null }[]
    )
      .map((ci) => ci.instructor)
      .filter((i): i is { id: string; name: string } => !!i);
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
    const images = (row.class_images as unknown as { url: string; sort_order: number }[])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.url);

    return {
      id: row.id,
      name: row.name,
      sportId: row.sport_id,
      instructors,
      ageMin: row.age_min,
      ageMax: row.age_max,
      classType: row.class_type,
      price: row.price,
      priceUnit: row.price_unit,
      schedules,
      description: row.description ?? "",
      images,
      collectHeight: row.collect_height ?? false,
      collectShoeSize: row.collect_shoe_size ?? false,
      collectResidence: row.collect_residence ?? false,
    };
  });
}

export async function getMyClubBookings(facilityId: string): Promise<ClubBooking[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(
      "id, status, requested_at, contact_phone, gender, height_cm, shoe_size_mm, residence, booking_type, trial_date, child:children(name, birth_date), team_class:teams_classes!inner(name, facility_id), class_schedule:class_schedules(day_label, time_label)"
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
      contactPhone: b.contact_phone ?? undefined,
      gender: (b.gender as "male" | "female" | null) ?? undefined,
      heightCm: b.height_cm ?? undefined,
      shoeSizeMm: b.shoe_size_mm ?? undefined,
      residence: b.residence ?? undefined,
      bookingType: (b.booking_type as "trial" | "enrollment" | null) ?? "enrollment",
      trialDate: b.trial_date ?? undefined,
    };
  });
}
