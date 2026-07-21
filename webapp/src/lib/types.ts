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
