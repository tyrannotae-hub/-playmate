import { createClient } from "@/lib/supabase/server";
import { yearsSince } from "@/lib/data";
import {
  BookingStatus,
  ClubBooking,
  ClubClass,
  ClubFacility,
  ClubOwner,
  FacilityHomeCategory,
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
      "id, name, address, phone, description, cover_image_url, profile_image_url, instagram_url, owner_type"
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
    profileImageUrl: data.profile_image_url ?? "",
    instagramUrl: data.instagram_url ?? "",
    ownerType: (data.owner_type as "club" | "solo_coach") ?? "club",
  };
}

export async function getMyPromoImages(facilityId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("facility_promo_images")
    .select("url")
    .eq("facility_id", facilityId)
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => row.url);
}

export async function getMyHomeCategories(facilityId: string): Promise<FacilityHomeCategory[]> {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("facility_home_categories")
    .select("id, name")
    .eq("facility_id", facilityId)
    .order("sort_order", { ascending: true });

  if (!categories || categories.length === 0) return [];

  const { data: links } = await supabase
    .from("facility_home_category_classes")
    .select("category_id, team_class_id")
    .in(
      "category_id",
      categories.map((c) => c.id)
    )
    .order("sort_order", { ascending: true });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    classIds: (links ?? []).filter((l) => l.category_id === c.id).map((l) => l.team_class_id),
  }));
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
      "id, name, sport_id, age_min, age_max, class_type, price, price_unit, description, collect_height, collect_shoe_size, collect_residence, allow_trial, trial_price, show_price, show_trial_price, trial_day_label, discount_price, discount_start_date, discount_end_date, trial_discount_price, trial_discount_start_date, trial_discount_end_date, class_instructors(instructor:instructors(id,name)), class_schedules(*), class_images(url, sort_order), class_trial_dates(trial_date), class_holidays(holiday_date)"
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
      allowTrial: row.allow_trial ?? false,
      trialPrice: row.trial_price ?? undefined,
      showPrice: row.show_price ?? true,
      showTrialPrice: row.show_trial_price ?? true,
      trialDates: (row.class_trial_dates as unknown as { trial_date: string }[]).map(
        (d) => d.trial_date
      ),
      trialDayLabel: row.trial_day_label ?? undefined,
      holidays: (row.class_holidays as unknown as { holiday_date: string }[]).map(
        (h) => h.holiday_date
      ),
      discountPrice: row.discount_price ?? undefined,
      discountStartDate: row.discount_start_date ?? undefined,
      discountEndDate: row.discount_end_date ?? undefined,
      trialDiscountPrice: row.trial_discount_price ?? undefined,
      trialDiscountStartDate: row.trial_discount_start_date ?? undefined,
      trialDiscountEndDate: row.trial_discount_end_date ?? undefined,
    };
  });
}

const CLUB_BOOKING_SELECT =
  "id, status, requested_at, contact_phone, gender, height_cm, shoe_size_mm, residence, booking_type, trial_date, change_requested_at, requested_trial_date, change_note, child:children(name, birth_date), team_class:teams_classes!inner(id, name, facility_id), class_schedule:class_schedules!bookings_class_schedule_id_fkey(day_label, time_label), requested_schedule:class_schedules!bookings_requested_schedule_id_fkey(day_label, time_label)";

type RawClubBooking = {
  id: string;
  status: BookingStatus;
  requested_at: string;
  contact_phone: string | null;
  gender: string | null;
  height_cm: number | null;
  shoe_size_mm: number | null;
  residence: string | null;
  booking_type: string | null;
  trial_date: string | null;
  change_requested_at: string | null;
  requested_trial_date: string | null;
  change_note: string | null;
  child: { name: string; birth_date: string } | null;
  team_class: { id: string; name: string } | null;
  class_schedule: { day_label: string; time_label: string } | null;
  requested_schedule: { day_label: string; time_label: string } | null;
};

function toClubBooking(b: RawClubBooking): ClubBooking {
  return {
    id: b.id,
    classId: b.team_class?.id ?? "",
    className: b.team_class?.name ?? "",
    scheduleLabel: b.class_schedule
      ? `${b.class_schedule.day_label} ${b.class_schedule.time_label}`
      : "",
    childName: b.child?.name ?? "",
    childAge: b.child ? yearsSince(b.child.birth_date) : 0,
    status: b.status,
    requestedAt: b.requested_at,
    contactPhone: b.contact_phone ?? undefined,
    gender: (b.gender as "male" | "female" | null) ?? undefined,
    heightCm: b.height_cm ?? undefined,
    shoeSizeMm: b.shoe_size_mm ?? undefined,
    residence: b.residence ?? undefined,
    bookingType: (b.booking_type as "trial" | "enrollment" | null) ?? "enrollment",
    trialDate: b.trial_date ?? undefined,
    changeRequestedAt: b.change_requested_at ?? undefined,
    requestedScheduleLabel: b.requested_schedule
      ? `${b.requested_schedule.day_label} ${b.requested_schedule.time_label}`
      : undefined,
    requestedTrialDate: b.requested_trial_date ?? undefined,
    changeNote: b.change_note ?? undefined,
  };
}

export async function getMyClubBookings(facilityId: string): Promise<ClubBooking[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(CLUB_BOOKING_SELECT)
    .eq("team_class.facility_id", facilityId)
    .order("requested_at", { ascending: false });

  return ((data ?? []) as unknown as RawClubBooking[]).map(toClubBooking);
}

export async function getClubBookingById(
  facilityId: string,
  bookingId: string
): Promise<ClubBooking | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(CLUB_BOOKING_SELECT)
    .eq("team_class.facility_id", facilityId)
    .eq("id", bookingId)
    .maybeSingle();

  if (!data) return null;
  return toClubBooking(data as unknown as RawClubBooking);
}
