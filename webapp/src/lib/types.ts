export type Sport = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  traits: string[];
};

export type Facility = {
  id: string;
  name: string;
  region: string;
  address: string;
  phone: string;
  instagramUrl: string;
};

export type Instructor = {
  id: string;
  name: string;
  careerYears: number;
  certified: boolean;
  certifiedBy?: string;
  profileImageUrl?: string;
  wishCount: number;
};

export type ClassSchedule = {
  id: string;
  dayLabel: string;
  timeLabel: string;
  capacity: number;
  booked: number;
};

export type TeamClass = {
  id: string;
  name: string;
  sportId: string;
  facility: Facility;
  instructors: Instructor[];
  ageMin: number;
  ageMax: number;
  classType: "individual" | "group" | "team";
  price: number;
  priceUnit: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  wishCount: number;
  schedules: ClassSchedule[];
  description: string;
  images: string[];
  createdAt: string;
  collectHeight: boolean;
  collectShoeSize: boolean;
  collectResidence: boolean;
  allowTrial: boolean;
  trialPrice?: number;
  showPrice: boolean;
  showTrialPrice: boolean;
  trialDates: string[];
  trialDayLabel?: string;
  holidays: string[];
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  trialDiscountPrice?: number;
};

export type Review = {
  id: string;
  classId: string;
  parentName: string;
  rating: number;
  content: string;
  photoUrls: string[];
  createdAt: string;
};

export type Child = {
  id: string;
  name: string;
  age: number;
  photoUrl: string;
};

export type ParentProfile = {
  name: string;
  address: string;
  regionCode: string;
  avatarUrl: string;
};

export type BookingStatus = "requested" | "confirmed" | "completed" | "cancelled";

export type Booking = {
  id: string;
  classId: string;
  scheduleId: string;
  className: string;
  facilityName: string;
  childName: string;
  status: BookingStatus;
  scheduleLabel: string;
  bookingType: "trial" | "enrollment";
  trialDate?: string;
  changeRequestedAt?: string;
  requestedScheduleLabel?: string;
  requestedTrialDate?: string;
  changeNote?: string;
};

export type ActiveClass = {
  bookingId: string;
  classId: string;
  name: string;
  facilityName: string;
  sportId: string;
  images: string[];
  scheduleLabel: string;
};

export type MyReview = {
  id: string;
  classId: string;
  className: string;
  facilityName: string;
  rating: number;
  content: string;
  createdAt: string;
};

export type FacilitySummary = {
  id: string;
  name: string;
  address: string;
  region: string;
  coverImageUrl: string;
  ownerType: "club" | "solo_coach";
  sportIds: string[];
  classCount: number;
  rating: number;
  reviewCount: number;
  popularity: number;
  wishCount: number;
};

export type FeaturedInstructor = {
  id: string;
  name: string;
  careerYears: number;
  certified: boolean;
  certifiedBy?: string;
  profileImageUrl: string;
  facilityId: string;
  facilityName: string;
  wishCount: number;
};

export type ClubOwner = {
  id: string;
  name: string;
  facilityId: string;
};

export type ClubFacility = {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string;
  coverImageUrl: string;
  instagramUrl: string;
  ownerType: "club" | "solo_coach";
};

export type FacilityNotice = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export type FacilityInstructor = {
  id: string;
  name: string;
  careerYears: number;
  certified: boolean;
  certifiedBy?: string;
  bio: string;
  profileImageUrl: string;
  wishCount: number;
};

export type FacilityHome = {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string;
  coverImageUrl: string;
  instagramUrl: string;
  ownerType: "club" | "solo_coach";
  notices: FacilityNotice[];
  instructors: FacilityInstructor[];
  classes: TeamClass[];
};

export type ClubSchedule = {
  id: string;
  dayLabel: string;
  timeLabel: string;
  capacity: number;
  booked: number;
};

export type ClubInstructorRef = {
  id: string;
  name: string;
};

export type ClubClass = {
  id: string;
  name: string;
  sportId: string;
  instructors: ClubInstructorRef[];
  ageMin: number;
  ageMax: number;
  classType: "individual" | "group" | "team";
  price: number;
  priceUnit: string;
  schedules: ClubSchedule[];
  description: string;
  images: string[];
  collectHeight: boolean;
  collectShoeSize: boolean;
  collectResidence: boolean;
  allowTrial: boolean;
  trialPrice?: number;
  showPrice: boolean;
  showTrialPrice: boolean;
  trialDates: string[];
  trialDayLabel?: string;
  holidays: string[];
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  trialDiscountPrice?: number;
};

export type Admin = {
  id: string;
  name: string;
  username: string;
};

export type ClubSignupRequest = {
  id: string;
  username: string;
  name: string;
  ownerType: "club" | "solo_coach";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  sportName?: string;
};

export type NotificationType =
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_completed"
  | "booking_change_approved"
  | "booking_change_rejected";

export type AppNotification = {
  id: string;
  bookingId: string | null;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
};

export type ClubBooking = {
  id: string;
  classId: string;
  className: string;
  scheduleLabel: string;
  childName: string;
  childAge: number;
  status: BookingStatus;
  requestedAt: string;
  contactPhone?: string;
  gender?: "male" | "female";
  heightCm?: number;
  shoeSizeMm?: number;
  residence?: string;
  bookingType: "trial" | "enrollment";
  trialDate?: string;
  changeRequestedAt?: string;
  requestedScheduleLabel?: string;
  requestedTrialDate?: string;
  changeNote?: string;
};
