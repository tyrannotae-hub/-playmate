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
};

export type Instructor = {
  id: string;
  name: string;
  careerYears: number;
  certified: boolean;
  certifiedBy?: string;
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
  instructor: Instructor;
  ageMin: number;
  ageMax: number;
  classType: "individual" | "group" | "team";
  price: number;
  priceUnit: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  schedules: ClassSchedule[];
  description: string;
  images: string[];
};

export type Review = {
  id: string;
  classId: string;
  parentName: string;
  rating: number;
  content: string;
  createdAt: string;
};

export type Child = {
  id: string;
  name: string;
  age: number;
};

export type ParentProfile = {
  name: string;
  address: string;
  regionCode: string;
};

export type BookingStatus = "requested" | "confirmed" | "completed" | "cancelled";

export type Booking = {
  id: string;
  classId: string;
  className: string;
  facilityName: string;
  childName: string;
  status: BookingStatus;
  scheduleLabel: string;
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
};

export type FacilityNotice = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export type FacilityHome = {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string;
  coverImageUrl: string;
  notices: FacilityNotice[];
  classes: TeamClass[];
};

export type ClubSchedule = {
  id: string;
  dayLabel: string;
  timeLabel: string;
  capacity: number;
  booked: number;
};

export type ClubClass = {
  id: string;
  name: string;
  sportId: string;
  instructorName: string;
  ageMin: number;
  ageMax: number;
  classType: "individual" | "group" | "team";
  price: number;
  priceUnit: string;
  schedules: ClubSchedule[];
  description: string;
  images: string[];
};

export type ClubBooking = {
  id: string;
  className: string;
  scheduleLabel: string;
  childName: string;
  childAge: number;
  status: BookingStatus;
  requestedAt: string;
};
