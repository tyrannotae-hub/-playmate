import { createClient } from "@/lib/supabase/server";
import {
  Booking,
  Child,
  FacilityHome,
  FacilityInstructor,
  ParentProfile,
  Review,
  Sport,
  TeamClass,
} from "@/lib/types";

export async function getSports(): Promise<Sport[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("sports").select("id, name, emoji, category, traits");
  return (data ?? []) as Sport[];
}

const DISTANCE_KM: Record<string, number> = {
  "아이스웍스 역삼점": 0.8,
  "제니스 스포츠클럽 아이스링크": 3.2,
};

type RawSchedule = {
  id: string;
  day_label: string;
  time_label: string;
  slot_capacity: number;
  slot_booked_count: number;
};

type RawClass = {
  id: string;
  name: string;
  sport_id: string;
  age_min: number;
  age_max: number;
  class_type: "individual" | "group" | "team";
  price: number;
  price_unit: string;
  description: string | null;
  created_at: string;
  facility: { id: string; name: string; address: string; region_code: string | null } | null;
  class_instructors: {
    instructor: {
      id: string;
      name: string;
      career_years: number | null;
      certification_verified: boolean;
      certified_by: string | null;
    } | null;
  }[];
  class_schedules: RawSchedule[];
  class_images: { url: string; sort_order: number }[];
};

async function ratingMap() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("target_id, rating")
    .eq("target_type", "team_class");

  const map = new Map<string, { sum: number; count: number }>();
  (data ?? []).forEach((r) => {
    const cur = map.get(r.target_id) ?? { sum: 0, count: 0 };
    cur.sum += r.rating;
    cur.count += 1;
    map.set(r.target_id, cur);
  });
  return map;
}

function toTeamClass(
  row: RawClass,
  ratings: Map<string, { sum: number; count: number }>
): TeamClass {
  const agg = ratings.get(row.id);
  const rating = agg ? Math.round((agg.sum / agg.count) * 10) / 10 : 0;

  return {
    id: row.id,
    name: row.name,
    sportId: row.sport_id,
    facility: {
      id: row.facility?.id ?? "",
      name: row.facility?.name ?? "",
      region: row.facility?.region_code ?? "",
      address: row.facility?.address ?? "",
    },
    instructors: row.class_instructors
      .map((ci) => ci.instructor)
      .filter((i): i is NonNullable<typeof i> => !!i)
      .map((i) => ({
        id: i.id,
        name: i.name,
        careerYears: i.career_years ?? 0,
        certified: i.certification_verified ?? false,
        certifiedBy: i.certified_by ?? undefined,
      })),
    ageMin: row.age_min,
    ageMax: row.age_max,
    classType: row.class_type,
    price: row.price,
    priceUnit: row.price_unit,
    distanceKm: DISTANCE_KM[row.facility?.name ?? ""] ?? 1.5,
    rating,
    reviewCount: agg?.count ?? 0,
    schedules: row.class_schedules.map((s) => ({
      id: s.id,
      dayLabel: s.day_label,
      timeLabel: s.time_label,
      capacity: s.slot_capacity,
      booked: s.slot_booked_count,
    })),
    description: row.description ?? "",
    images: [...row.class_images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.url),
    createdAt: row.created_at,
  };
}

export async function getAllClasses(): Promise<TeamClass[]> {
  const supabase = await createClient();
  const [{ data, error }, ratings] = await Promise.all([
    supabase
      .from("teams_classes")
      .select(
        "*, facility:facilities(id,name,address,region_code), class_instructors(instructor:instructors(id,name,career_years,certification_verified,certified_by)), class_schedules(*), class_images(url, sort_order)"
      ),
    ratingMap(),
  ]);

  if (error || !data) return [];
  return (data as unknown as RawClass[]).map((r) => toTeamClass(r, ratings));
}

export async function getClassById(id: string): Promise<TeamClass | null> {
  const all = await getAllClasses();
  return all.find((c) => c.id === id) ?? null;
}

export async function getFacilityHome(facilityId: string): Promise<FacilityHome | null> {
  const supabase = await createClient();
  const { data: facility } = await supabase
    .from("facilities")
    .select("id, name, address, phone, description, cover_image_url, instagram_url")
    .eq("id", facilityId)
    .maybeSingle();

  if (!facility) return null;

  const { data: notices } = await supabase
    .from("facility_notices")
    .select("id, title, content, created_at")
    .eq("facility_id", facilityId)
    .order("created_at", { ascending: false });

  const { data: instructorRows } = await supabase
    .from("instructors")
    .select("id, name, career_years, certification_verified, certified_by, bio, profile_image_url")
    .eq("facility_id", facilityId)
    .order("career_years", { ascending: false });

  const instructors: FacilityInstructor[] = (instructorRows ?? []).map((i) => ({
    id: i.id,
    name: i.name,
    careerYears: i.career_years ?? 0,
    certified: i.certification_verified ?? false,
    certifiedBy: i.certified_by ?? undefined,
    bio: i.bio ?? "",
    profileImageUrl: i.profile_image_url ?? "",
  }));

  const allClasses = await getAllClasses();
  const classes = allClasses.filter((c) => c.facility.id === facilityId);

  return {
    id: facility.id,
    name: facility.name,
    address: facility.address,
    phone: facility.phone ?? "",
    description: facility.description ?? "",
    coverImageUrl: facility.cover_image_url ?? "",
    instagramUrl: facility.instagram_url ?? "",
    notices: (notices ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      createdAt: n.created_at,
    })),
    instructors,
    classes,
  };
}

export async function getReviewsForClass(classId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, content, created_at, author_label")
    .eq("target_type", "team_class")
    .eq("target_id", classId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id,
    classId,
    parentName: r.author_label,
    rating: r.rating,
    content: r.content ?? "",
    createdAt: r.created_at,
  }));
}

export async function getCurrentParent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getMyProfile(userId?: string): Promise<ParentProfile> {
  const supabase = await createClient();

  let uid = userId;
  if (!uid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { name: "", address: "", regionCode: "" };
    uid = user.id;
  }

  const { data } = await supabase
    .from("parents")
    .select("name, address, region_code")
    .eq("id", uid)
    .maybeSingle();

  return {
    name: data?.name ?? "학부모",
    address: data?.address ?? "",
    regionCode: data?.region_code ?? "",
  };
}

export async function getMyChildren(): Promise<Child[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("children")
    .select("id, name, birth_date")
    .order("created_at", { ascending: true });

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    age: yearsSince(c.birth_date),
  }));
}

export async function getMyBookings(): Promise<Booking[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(
      "id, status, team_class_id, child:children(name), team_class:teams_classes(name, facility:facilities(name)), class_schedule:class_schedules(day_label, time_label)"
    )
    .order("requested_at", { ascending: false });

  return (data ?? []).map((b) => {
    const teamClass = b.team_class as unknown as {
      name: string;
      facility: { name: string } | null;
    } | null;
    const schedule = b.class_schedule as unknown as {
      day_label: string;
      time_label: string;
    } | null;
    const child = b.child as unknown as { name: string } | null;

    return {
      id: b.id,
      classId: b.team_class_id,
      className: teamClass?.name ?? "",
      facilityName: teamClass?.facility?.name ?? "",
      childName: child?.name ?? "",
      status: b.status,
      scheduleLabel: schedule ? `${schedule.day_label} ${schedule.time_label}` : "",
    };
  });
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const bookings = await getMyBookings();
  return bookings.find((b) => b.id === id) ?? null;
}

export async function getMyWishlistIds(userId?: string): Promise<string[]> {
  const supabase = await createClient();

  let uid = userId;
  if (!uid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    uid = user.id;
  }

  const { data } = await supabase.from("wishlists").select("team_class_id");
  return (data ?? []).map((w) => w.team_class_id);
}

export async function getMyWishlistClasses(userId?: string): Promise<TeamClass[]> {
  const [ids, all] = await Promise.all([getMyWishlistIds(userId), getAllClasses()]);
  if (ids.length === 0) return [];
  const idSet = new Set(ids);
  return all.filter((c) => idSet.has(c.id));
}

export function yearsSince(dateStr: string): number {
  const birth = new Date(dateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
