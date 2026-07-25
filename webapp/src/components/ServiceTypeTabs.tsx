import Link from "next/link";
import { ServiceType } from "@/lib/types";

const TABS: { type: ServiceType; label: string; href: string }[] = [
  { type: "academy", label: "아카데미", href: "/" },
  { type: "lesson", label: "레슨", href: "/?type=lesson" },
];

export default function ServiceTypeTabs({ active }: { active: ServiceType }) {
  return (
    <div className="flex gap-2 px-4 pt-3">
      {TABS.map((tab) => {
        const isActive = tab.type === active;
        return (
          <Link
            key={tab.type}
            href={tab.href}
            className={`btn-label rounded-md px-3.5 py-2 text-sm font-bold transition ${
              isActive ? "bg-rink text-white" : "bg-surface-2 text-muted"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
