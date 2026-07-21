import { BookingStatus } from "@/lib/types";

const CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  requested: { label: "확인중", className: "bg-warn/15 text-warn" },
  confirmed: { label: "확정", className: "bg-good/15 text-good" },
  completed: { label: "완료", className: "bg-line text-muted" },
  cancelled: { label: "취소", className: "bg-line text-muted" },
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  const c = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${c.className}`}
    >
      {c.label}
    </span>
  );
}
