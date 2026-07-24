function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M6.5 3.5c-1.7 0-3 1.3-3 3 0 8.3 6.7 15 15 15 1.7 0 3-1.3 3-3v-2.1c0-.5-.3-.9-.8-1l-3.6-.9c-.4-.1-.9 0-1.1.4l-1 1.5a12.3 12.3 0 0 1-5.9-5.9l1.5-1c.4-.3.5-.7.4-1.1l-.9-3.6c-.1-.5-.5-.8-1-.8H6.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  );
}

// 시설 상세/클래스 상세 양쪽에서 같이 쓰는 전화·인스타그램 바로가기 아이콘.
// 배경 원 없이 아이콘만 노출(예전엔 인스타그램 아이콘에 원형 border+배경이 있었음).
export default function FacilityContactLinks({
  phone,
  instagramUrl,
  facilityName,
}: {
  phone?: string;
  instagramUrl?: string;
  facilityName: string;
}) {
  if (!phone && !instagramUrl) return null;

  return (
    <div className="flex shrink-0 items-center gap-1">
      {phone && (
        <a
          href={`tel:${phone}`}
          aria-label={`${facilityName}에 전화 걸기`}
          className="flex h-9 w-9 items-center justify-center text-rink-deep transition hover:opacity-70"
        >
          <PhoneIcon />
        </a>
      )}
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${facilityName} 인스타그램 바로가기`}
          className="flex h-9 w-9 items-center justify-center text-rink-deep transition hover:opacity-70"
        >
          <InstagramIcon />
        </a>
      )}
    </div>
  );
}
