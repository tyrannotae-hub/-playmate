import { Booking, Child, Review, Sport, TeamClass } from "./types";

export const sports: Sport[] = [
  {
    id: "ice-hockey",
    name: "아이스하키",
    emoji: "🏒",
    category: "빙상",
    traits: ["활동적", "팀워크", "승부욕"],
  },
  {
    id: "figure-skating",
    name: "피겨스케이팅",
    emoji: "⛸️",
    category: "빙상",
    traits: ["집중력", "개인종목", "표현력"],
  },
];

const iceworks = {
  id: "fac-iceworks-yeoksam",
  name: "아이스웍스 역삼점",
  region: "강남구",
  address: "서울 강남구 역삼동",
};

const zenith = {
  id: "fac-zenith-guro",
  name: "제니스 스포츠클럽 아이스링크",
  region: "구로구",
  address: "서울 구로구",
};

export const classes: TeamClass[] = [
  {
    id: "class-1",
    name: "새싹 하키클럽",
    sportId: "ice-hockey",
    facility: iceworks,
    instructor: {
      id: "ins-1",
      name: "김OO",
      careerYears: 8,
      certified: true,
      certifiedBy: "대한아이스하키협회 지도자 자격증",
    },
    ageMin: 6,
    ageMax: 9,
    classType: "team",
    price: 150000,
    priceUnit: "월",
    distanceKm: 0.8,
    rating: 4.8,
    reviewCount: 32,
    schedules: [
      { dayLabel: "월·수·금", timeLabel: "18:00–19:00", capacity: 8, booked: 6 },
    ],
  },
  {
    id: "class-2",
    name: "U-8 하키팀",
    sportId: "ice-hockey",
    facility: zenith,
    instructor: {
      id: "ins-2",
      name: "박OO",
      careerYears: 6,
      certified: true,
      certifiedBy: "대한아이스하키협회 지도자 자격증",
    },
    ageMin: 7,
    ageMax: 9,
    classType: "team",
    price: 180000,
    priceUnit: "월",
    distanceKm: 3.2,
    rating: 4.6,
    reviewCount: 19,
    schedules: [
      { dayLabel: "화·목", timeLabel: "17:30–18:30", capacity: 10, booked: 10 },
    ],
  },
  {
    id: "class-3",
    name: "주니어 피겨 기초반",
    sportId: "figure-skating",
    facility: iceworks,
    instructor: {
      id: "ins-3",
      name: "이OO",
      careerYears: 5,
      certified: true,
      certifiedBy: "대한빙상경기연맹 지도자 자격증",
    },
    ageMin: 5,
    ageMax: 8,
    classType: "individual",
    price: 220000,
    priceUnit: "월",
    distanceKm: 0.8,
    rating: 4.9,
    reviewCount: 14,
    schedules: [
      { dayLabel: "화·목", timeLabel: "16:00–17:00", capacity: 6, booked: 4 },
    ],
  },
];

export const reviews: Review[] = [
  {
    id: "rev-1",
    classId: "class-1",
    parentName: "민준맘",
    rating: 5,
    content: "코치님이 아이 하나하나 잘 챙겨주셔서 겁 많던 아이가 이제 스스로 스케이트를 신어요.",
    createdAt: "2026-06-02",
  },
  {
    id: "rev-2",
    classId: "class-1",
    parentName: "서준맘",
    rating: 4,
    content: "시설은 좋은데 주차가 조금 불편해요. 그래도 재등록할 예정입니다.",
    createdAt: "2026-05-20",
  },
  {
    id: "rev-3",
    classId: "class-2",
    parentName: "하윤맘",
    rating: 5,
    content: "팀 분위기가 정말 좋아요. 대회 준비도 꼼꼼히 챙겨주십니다.",
    createdAt: "2026-05-11",
  },
];

export const children: Child[] = [{ id: "child-1", name: "민준", age: 7 }];

export const bookings: Booking[] = [
  {
    id: "book-1",
    classId: "class-1",
    className: "새싹 하키클럽",
    facilityName: "아이스웍스 역삼점",
    childName: "민준",
    status: "confirmed",
    scheduleLabel: "8/4(월) 18:00 첫 수업",
  },
  {
    id: "book-2",
    classId: "class-3",
    className: "주니어 피겨 기초반",
    facilityName: "아이스웍스 역삼점",
    childName: "민준",
    status: "completed",
    scheduleLabel: "지난 학기 수강 완료",
  },
];

export function getClassById(id: string): TeamClass | undefined {
  return classes.find((c) => c.id === id);
}

export function getReviewsForClass(classId: string): Review[] {
  return reviews.filter((r) => r.classId === classId);
}

export function getSportById(id: string): Sport | undefined {
  return sports.find((s) => s.id === id);
}
