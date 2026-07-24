import { createClient } from "@/lib/supabase/server";
import {
  ActiveClass,
  AppNotification,
  Booking,
  Child,
  FacilityHome,
  FacilityInstructor,
  FacilitySummary,
  FeaturedInstructor,
  MyReview,
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
  allow_trial: boolean | null;
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
  collect_height: boolean | null;
  collect_shoe_size: boolean | null;
  collect_residence: boolean | null;
  trial_price: number | null;
  show_price: boolean | null;
  show_trial_price: boolean | null;
  discount_price: number | null;
  discount_start_date: string | null;
  discount_end_date: string | null;
  trial_discount_price: number | null;
  trial_discount_start_date: string | null;
  trial_discount_end_date: string | null;
  class_holidays: { holiday_date: string; class_schedule_id: string | null }[];
  facility: {
    id: string;
    name: string;
    address: string;
    region_code: string | null;
    phone: string | null;
    instagram_url: string | null;
    facility_regions: { region_code: string }[];
  } | null;
  class_instructors: {
    instructor: {
      id: string;
      name: string;
      career_years: number | null;
      certification_verified: boolean;
      certified_by: string | null;
      profile_image_url: string | null;
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

async function wishCountMap() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_wishlist_counts");

  const map = new Map<string, number>();
  ((data ?? []) as { team_class_id: string; count: number }[]).forEach((row) => {
    map.set(row.team_class_id, row.count);
  });
  return map;
}

async function instructorWishCountMap() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_instructor_wishlist_counts");

  const map = new Map<string, number>();
  ((data ?? []) as { instructor_id: string; count: number }[]).forEach((row) => {
    map.set(row.instructor_id, row.count);
  });
  return map;
}

async function facilityWishCountMap() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_facility_wishlist_counts");

  const map = new Map<string, number>();
  ((data ?? []) as { facility_id: string; count: number }[]).forEach((row) => {
    map.set(row.facility_id, row.count);
  });
  return map;
}

function toTeamClass(
  row: RawClass,
  ratings: Map<string, { sum: number; count: number }>,
  wishCounts: Map<string, number>,
  instructorWishCounts: Map<string, number>
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
      regions: (row.facility?.facility_regions ?? []).map((r) => r.region_code),
      address: row.facility?.address ?? "",
      phone: row.facility?.phone ?? "",
      instagramUrl: row.facility?.instagram_url ?? "",
    },
    collectHeight: row.collect_height ?? false,
    collectShoeSize: row.collect_shoe_size ?? false,
    collectResidence: row.collect_residence ?? false,
    allowTrial: row.class_schedules.some((s) => s.allow_trial),
    trialPrice: row.trial_price ?? undefined,
    showPrice: row.show_price ?? true,
    showTrialPrice: row.show_trial_price ?? true,
    holidays: row.class_holidays.filter((h) => !h.class_schedule_id).map((h) => h.holiday_date),
    discountPrice: row.discount_price ?? undefined,
    discountStartDate: row.discount_start_date ?? undefined,
    discountEndDate: row.discount_end_date ?? undefined,
    trialDiscountPrice: row.trial_discount_price ?? undefined,
    trialDiscountStartDate: row.trial_discount_start_date ?? undefined,
    trialDiscountEndDate: row.trial_discount_end_date ?? undefined,
    instructors: row.class_instructors
      .map((ci) => ci.instructor)
      .filter((i): i is NonNullable<typeof i> => !!i)
      .map((i) => ({
        id: i.id,
        name: i.name,
        careerYears: i.career_years ?? 0,
        certified: i.certification_verified ?? false,
        certifiedBy: i.certified_by ?? undefined,
        profileImageUrl: i.profile_image_url ?? undefined,
        wishCount: instructorWishCounts.get(i.id) ?? 0,
      })),
    ageMin: row.age_min,
    ageMax: row.age_max,
    classType: row.class_type,
    price: row.price,
    priceUnit: row.price_unit,
    distanceKm: DISTANCE_KM[row.facility?.name ?? ""] ?? 1.5,
    rating,
    reviewCount: agg?.count ?? 0,
    wishCount: wishCounts.get(row.id) ?? 0,
    schedules: row.class_schedules.map((s) => ({
      id: s.id,
      dayLabel: s.day_label,
      timeLabel: s.time_label,
      capacity: s.slot_capacity,
      booked: s.slot_booked_count,
      allowTrial: s.allow_trial ?? false,
      holidays: row.class_holidays
        .filter((h) => h.class_schedule_id === s.id)
        .map((h) => h.holiday_date),
    })),
    description: row.description ?? "",
    images: [...row.class_images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.url),
    createdAt: row.created_at,
  };
}

// teams_classes 조회는 공통 select/조인이 무거워서(강사·스케줄·이미지 전부 join),
// 단일 클래스나 특정 시설만 필요할 때도 전체를 긁어와 필터링하지 않도록
// eq 필터를 옵션으로 받는 공용 헬퍼로 뺌 (getClassById/getFacilityHome에서 재사용).
function classesQuery(supabase: Awaited<ReturnType<typeof createClient>>, filter?: { id?: string; facilityId?: string }) {
  let query = supabase
    .from("teams_classes")
    .select(
      "*, facility:facilities(id,name,address,region_code,phone,instagram_url,facility_regions(region_code)), class_instructors(instructor:instructors(id,name,career_years,certification_verified,certified_by,profile_image_url)), class_schedules(*), class_images(url, sort_order), class_holidays(holiday_date,class_schedule_id)"
    );
  if (filter?.id) query = query.eq("id", filter.id);
  if (filter?.facilityId) query = query.eq("facility_id", filter.facilityId);
  return query;
}

export async function getAllClasses(): Promise<TeamClass[]> {
  const supabase = await createClient();
  const [{ data, error }, ratings, wishCounts, instructorWishCounts] = await Promise.all([
    classesQuery(supabase),
    ratingMap(),
    wishCountMap(),
    instructorWishCountMap(),
  ]);

  if (error || !data) return [];
  return (data as unknown as RawClass[]).map((r) =>
    toTeamClass(r, ratings, wishCounts, instructorWishCounts)
  );
}

type RawFacilityMeta = {
  id: string;
  name: string;
  address: string;
  region_code: string | null;
  cover_image_url: string | null;
  owner_type: string | null;
};

async function facilityMetaMap() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("facilities")
    .select("id, name, address, region_code, cover_image_url, owner_type");

  const map = new Map<string, RawFacilityMeta>();
  ((data ?? []) as RawFacilityMeta[]).forEach((f) => map.set(f.id, f));
  return map;
}

// 클래스 목록(이미 rating/wishCount가 계산돼 있음)을 시설 단위로 묶어 팀・클럽 요약을 만든다.
// 팀 찾기 개선(홈/종목별/검색에 팀·클럽 노출)에 공용으로 쓰인다.
function summarizeFacilities(
  classes: TeamClass[],
  metaMap: Map<string, RawFacilityMeta>,
  facilityWishCounts: Map<string, number>
): FacilitySummary[] {
  const agg = new Map<
    string,
    {
      sportIds: Set<string>;
      classCount: number;
      ratingSum: number;
      reviewCount: number;
      popularity: number;
      regions: string[];
    }
  >();

  for (const c of classes) {
    const fid = c.facility.id;
    if (!fid) continue;
    const cur = agg.get(fid) ?? {
      sportIds: new Set<string>(),
      classCount: 0,
      ratingSum: 0,
      reviewCount: 0,
      popularity: 0,
      regions: c.facility.regions,
    };
    cur.sportIds.add(c.sportId);
    cur.classCount += 1;
    cur.ratingSum += c.rating * c.reviewCount;
    cur.reviewCount += c.reviewCount;
    cur.popularity += c.wishCount;
    agg.set(fid, cur);
  }

  return Array.from(agg.entries()).map(([fid, a]) => {
    const meta = metaMap.get(fid);
    return {
      id: fid,
      name: meta?.name ?? "",
      address: meta?.address ?? "",
      region: meta?.region_code ?? "",
      regions: a.regions,
      coverImageUrl: meta?.cover_image_url ?? "",
      ownerType: (meta?.owner_type as "club" | "solo_coach") ?? "club",
      sportIds: Array.from(a.sportIds),
      classCount: a.classCount,
      rating: a.reviewCount > 0 ? Math.round((a.ratingSum / a.reviewCount) * 10) / 10 : 0,
      reviewCount: a.reviewCount,
      popularity: a.popularity,
      wishCount: facilityWishCounts.get(fid) ?? 0,
    };
  });
}

export async function getAllFacilities(): Promise<FacilitySummary[]> {
  const [classes, metaMap, facilityWishCounts] = await Promise.all([
    getAllClasses(),
    facilityMetaMap(),
    facilityWishCountMap(),
  ]);
  return summarizeFacilities(classes, metaMap, facilityWishCounts);
}

// 홈 화면처럼 이미 getAllClasses()를 호출한 곳에서 같은 클래스 목록을 다시 안 긁어오도록
// 시설 메타만 추가로 조회해 합치는 버전.
export async function facilitiesFromClasses(classes: TeamClass[]): Promise<FacilitySummary[]> {
  const [metaMap, facilityWishCounts] = await Promise.all([
    facilityMetaMap(),
    facilityWishCountMap(),
  ]);
  return summarizeFacilities(classes, metaMap, facilityWishCounts);
}

export async function getClassById(id: string): Promise<TeamClass | null> {
  const supabase = await createClient();
  const [{ data, error }, ratings, wishCounts, instructorWishCounts] = await Promise.all([
    classesQuery(supabase, { id }),
    ratingMap(),
    wishCountMap(),
    instructorWishCountMap(),
  ]);

  if (error || !data || data.length === 0) return null;
  return toTeamClass(data[0] as unknown as RawClass, ratings, wishCounts, instructorWishCounts);
}

export async function getFacilityHome(facilityId: string): Promise<FacilityHome | null> {
  const supabase = await createClient();

  // 시설/공지/강사/클래스는 서로 독립적인 쿼리라 순차 await 대신 한 번에 병렬 처리.
  // 클래스도 getAllClasses() 전체를 긁어와 필터링하던 것을 이 시설분만 조회하도록 변경.
  const [
    { data: facility },
    { data: notices },
    { data: instructorRows },
    instructorWishCounts,
    { data: classRows, error: classError },
    ratings,
    wishCounts,
    { data: promoRows },
    { data: categoryRows },
  ] = await Promise.all([
    supabase
      .from("facilities")
      .select(
        "id, name, address, phone, description, cover_image_url, profile_image_url, instagram_url, owner_type"
      )
      .eq("id", facilityId)
      .maybeSingle(),
    supabase
      .from("facility_notices")
      .select("id, title, content, created_at")
      .eq("facility_id", facilityId)
      .order("created_at", { ascending: false }),
    supabase
      .from("instructors")
      .select("id, name, career_years, certification_verified, certified_by, bio, profile_image_url")
      .eq("facility_id", facilityId)
      .order("career_years", { ascending: false }),
    instructorWishCountMap(),
    classesQuery(supabase, { facilityId }),
    ratingMap(),
    wishCountMap(),
    supabase
      .from("facility_promo_images")
      .select("url")
      .eq("facility_id", facilityId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("facility_home_categories")
      .select("id, name, facility_home_category_classes(team_class_id)")
      .eq("facility_id", facilityId)
      .order("sort_order", { ascending: true }),
  ]);

  if (!facility) return null;

  const instructors: FacilityInstructor[] = (instructorRows ?? []).map((i) => ({
    id: i.id,
    name: i.name,
    careerYears: i.career_years ?? 0,
    certified: i.certification_verified ?? false,
    certifiedBy: i.certified_by ?? undefined,
    bio: i.bio ?? "",
    profileImageUrl: i.profile_image_url ?? "",
    wishCount: instructorWishCounts.get(i.id) ?? 0,
  }));

  const classes =
    classError || !classRows
      ? []
      : (classRows as unknown as RawClass[]).map((r) =>
          toTeamClass(r, ratings, wishCounts, instructorWishCounts)
        );

  return {
    id: facility.id,
    name: facility.name,
    address: facility.address,
    phone: facility.phone ?? "",
    description: facility.description ?? "",
    coverImageUrl: facility.cover_image_url ?? "",
    profileImageUrl: facility.profile_image_url ?? "",
    promoImages: (promoRows ?? []).map((r) => r.url),
    homeCategories: (
      (categoryRows ?? []) as unknown as {
        id: string;
        name: string;
        facility_home_category_classes: { team_class_id: string }[];
      }[]
    ).map((c) => ({
      id: c.id,
      name: c.name,
      classIds: c.facility_home_category_classes.map((l) => l.team_class_id),
    })),
    instagramUrl: facility.instagram_url ?? "",
    ownerType: (facility.owner_type as "club" | "solo_coach") ?? "club",
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
    .select("id, rating, content, photo_urls, created_at, author_label")
    .eq("target_type", "team_class")
    .eq("target_id", classId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id,
    classId,
    parentName: r.author_label,
    rating: r.rating,
    content: r.content ?? "",
    photoUrls: r.photo_urls ?? [],
    createdAt: r.created_at,
  }));
}

// 홈 화면 "우리 지도자들" 섹션용: 프로필 사진이 있는 인증 강사 위주로 노출
export async function getFeaturedInstructors(): Promise<FeaturedInstructor[]> {
  const supabase = await createClient();
  const [{ data }, instructorWishCounts] = await Promise.all([
    supabase
      .from("instructors")
      .select(
        "id, name, career_years, certification_verified, certified_by, profile_image_url, facility:facilities(id, name)"
      )
      .not("profile_image_url", "is", null)
      .order("career_years", { ascending: false })
      .limit(10),
    instructorWishCountMap(),
  ]);

  return (data ?? []).map((i) => {
    const facility = i.facility as unknown as { id: string; name: string } | null;
    return {
      id: i.id,
      name: i.name,
      careerYears: i.career_years ?? 0,
      certified: i.certification_verified ?? false,
      certifiedBy: i.certified_by ?? undefined,
      profileImageUrl: i.profile_image_url ?? "",
      facilityId: facility?.id ?? "",
      facilityName: facility?.name ?? "",
      wishCount: instructorWishCounts.get(i.id) ?? 0,
    };
  });
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
    if (!user) return { name: "", address: "", regionCode: "", avatarUrl: "" };
    uid = user.id;
  }

  const { data } = await supabase
    .from("parents")
    .select("name, address, region_code, avatar_url")
    .eq("id", uid)
    .maybeSingle();

  return {
    name: data?.name ?? "학부모",
    address: data?.address ?? "",
    regionCode: data?.region_code ?? "",
    avatarUrl: data?.avatar_url ?? "",
  };
}

export async function getMyChildren(): Promise<Child[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("children")
    .select("id, name, birth_date, photo_url")
    .order("created_at", { ascending: true });

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    age: yearsSince(c.birth_date),
    photoUrl: c.photo_url ?? "",
  }));
}

export async function getMyBookings(): Promise<Booking[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(
      "id, status, team_class_id, class_schedule_id, booking_type, trial_date, change_requested_at, requested_trial_date, change_note, cancel_requested_at, child:children(name), team_class:teams_classes(name, facility:facilities(name)), class_schedule:class_schedules!bookings_class_schedule_id_fkey(day_label, time_label), requested_schedule:class_schedules!bookings_requested_schedule_id_fkey(day_label, time_label)"
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
    const requestedSchedule = b.requested_schedule as unknown as {
      day_label: string;
      time_label: string;
    } | null;
    const child = b.child as unknown as { name: string } | null;

    return {
      id: b.id,
      classId: b.team_class_id,
      scheduleId: b.class_schedule_id,
      className: teamClass?.name ?? "",
      facilityName: teamClass?.facility?.name ?? "",
      childName: child?.name ?? "",
      status: b.status,
      scheduleLabel: schedule ? `${schedule.day_label} ${schedule.time_label}` : "",
      bookingType: (b.booking_type as "trial" | "enrollment" | null) ?? "enrollment",
      trialDate: b.trial_date ?? undefined,
      changeRequestedAt: b.change_requested_at ?? undefined,
      requestedScheduleLabel: requestedSchedule
        ? `${requestedSchedule.day_label} ${requestedSchedule.time_label}`
        : undefined,
      requestedTrialDate: b.requested_trial_date ?? undefined,
      changeNote: b.change_note ?? undefined,
      cancelRequestedAt: b.cancel_requested_at ?? undefined,
    };
  });
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const bookings = await getMyBookings();
  return bookings.find((b) => b.id === id) ?? null;
}

// 마이페이지 최상단 "수강중인 클래스" 섹션용: confirmed 상태 예약의 클래스만 (userId 옵션으로 중복 auth.getUser() 방지)
export async function getMyActiveClasses(userId?: string): Promise<ActiveClass[]> {
  const supabase = await createClient();

  let uid = userId;
  if (!uid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    uid = user.id;
  }

  const { data } = await supabase
    .from("bookings")
    .select(
      "id, team_class_id, team_class:teams_classes(name, sport_id, class_images(url, sort_order), facility:facilities(name)), class_schedule:class_schedules(day_label, time_label)"
    )
    .eq("status", "confirmed")
    .order("requested_at", { ascending: false });

  return (data ?? []).map((b) => {
    const teamClass = b.team_class as unknown as {
      name: string;
      sport_id: string;
      class_images: { url: string; sort_order: number }[];
      facility: { name: string } | null;
    } | null;
    const schedule = b.class_schedule as unknown as {
      day_label: string;
      time_label: string;
    } | null;

    return {
      bookingId: b.id,
      classId: b.team_class_id,
      name: teamClass?.name ?? "",
      facilityName: teamClass?.facility?.name ?? "",
      sportId: teamClass?.sport_id ?? "",
      images: [...(teamClass?.class_images ?? [])]
        .sort((a, c) => a.sort_order - c.sort_order)
        .map((img) => img.url),
      scheduleLabel: schedule ? `${schedule.day_label} ${schedule.time_label}` : "",
    };
  });
}

// 마이페이지 "내 리뷰" 섹션용: reviews.target_id는 target_type별 폴리모픽 참조라 FK 임베드가 안 되므로 2단계 조회
export async function getMyReviews(userId?: string): Promise<MyReview[]> {
  const supabase = await createClient();

  let uid = userId;
  if (!uid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    uid = user.id;
  }

  const { data } = await supabase
    .from("reviews")
    .select("id, target_id, rating, content, created_at")
    .eq("target_type", "team_class")
    .eq("parent_id", uid)
    .order("created_at", { ascending: false });

  const reviews = data ?? [];
  if (reviews.length === 0) return [];

  const classIds = [...new Set(reviews.map((r) => r.target_id))];
  const { data: classRows } = await supabase
    .from("teams_classes")
    .select("id, name, facility:facilities(name)")
    .in("id", classIds);

  const classMap = new Map(
    (classRows ?? []).map((c) => {
      const facility = c.facility as unknown as { name: string } | null;
      return [c.id, { name: c.name, facilityName: facility?.name ?? "" }] as const;
    })
  );

  return reviews.map((r) => {
    const cls = classMap.get(r.target_id);
    return {
      id: r.id,
      classId: r.target_id,
      className: cls?.name ?? "",
      facilityName: cls?.facilityName ?? "",
      rating: r.rating,
      content: r.content ?? "",
      createdAt: r.created_at,
    };
  });
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

export async function getMyInstructorWishlistIds(userId?: string): Promise<string[]> {
  const supabase = await createClient();

  let uid = userId;
  if (!uid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    uid = user.id;
  }

  const { data } = await supabase.from("instructor_wishlists").select("instructor_id");
  return (data ?? []).map((w) => w.instructor_id);
}

export async function getMyWishlistedInstructors(userId?: string): Promise<FeaturedInstructor[]> {
  const supabase = await createClient();
  const [ids, instructorWishCounts] = await Promise.all([
    getMyInstructorWishlistIds(userId),
    instructorWishCountMap(),
  ]);
  if (ids.length === 0) return [];

  const { data } = await supabase
    .from("instructors")
    .select(
      "id, name, career_years, certification_verified, certified_by, profile_image_url, facility:facilities(id, name)"
    )
    .in("id", ids);

  return (data ?? []).map((i) => {
    const facility = i.facility as unknown as { id: string; name: string } | null;
    return {
      id: i.id,
      name: i.name,
      careerYears: i.career_years ?? 0,
      certified: i.certification_verified ?? false,
      certifiedBy: i.certified_by ?? undefined,
      profileImageUrl: i.profile_image_url ?? "",
      facilityId: facility?.id ?? "",
      facilityName: facility?.name ?? "",
      wishCount: instructorWishCounts.get(i.id) ?? 0,
    };
  });
}

export async function getMyFacilityWishlistIds(userId?: string): Promise<string[]> {
  const supabase = await createClient();

  let uid = userId;
  if (!uid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    uid = user.id;
  }

  const { data } = await supabase.from("facility_wishlists").select("facility_id");
  return (data ?? []).map((w) => w.facility_id);
}

export async function getMyWishlistedFacilities(userId?: string): Promise<FacilitySummary[]> {
  const [ids, all] = await Promise.all([getMyFacilityWishlistIds(userId), getAllFacilities()]);
  if (ids.length === 0) return [];
  const idSet = new Set(ids);
  return all.filter((f) => idSet.has(f.id));
}

// 시설(팀・클럽) 상세 페이지 헤더에서 찜 버튼 하나만 그릴 때 쓰는 가벼운 버전 —
// getAllFacilities()처럼 전체 클래스를 다시 긁어오지 않고 카운트/본인 찜 여부만 조회.
export async function getFacilityWishInfo(
  facilityId: string,
  userId?: string
): Promise<{ wished: boolean; count: number }> {
  const [wishCounts, ids] = await Promise.all([
    facilityWishCountMap(),
    getMyFacilityWishlistIds(userId),
  ]);
  return { wished: ids.includes(facilityId), count: wishCounts.get(facilityId) ?? 0 };
}

export async function getMyNotifications(userId?: string): Promise<AppNotification[]> {
  const supabase = await createClient();

  let uid = userId;
  if (!uid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    uid = user.id;
  }

  const { data } = await supabase
    .from("notifications")
    .select("id, booking_id, type, message, read_at, created_at")
    .order("created_at", { ascending: false });

  return (data ?? []).map((n) => ({
    id: n.id,
    bookingId: n.booking_id,
    type: n.type,
    message: n.message,
    read: !!n.read_at,
    createdAt: n.created_at,
  }));
}

export async function getUnreadNotificationCount(userId?: string): Promise<number> {
  const supabase = await createClient();

  let uid = userId;
  if (!uid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;
    uid = user.id;
  }

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  return count ?? 0;
}

export function yearsSince(dateStr: string): number {
  const birth = new Date(dateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
