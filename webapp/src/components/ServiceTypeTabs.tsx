import Link from "next/link";
import { ServiceType } from "@/lib/types";

export type HomeTab = ServiceType | "trial";

const TABS: { type: HomeTab; label: string; href: string }[] = [
  { type: "academy", label: "아카데미", href: "/" },
  { type: "lesson", label: "레슨", href: "/?type=lesson" },
  { type: "trial", label: "원데이", href: "/?type=trial" },
];

export default function ServiceTypeTabs({ active }: { active: HomeTab }) {
  return (
    <div className="flex gap-4 px-4 pt-3">
      {TABS.map((tab) => {
        const isActive = tab.type === active;
        return (
          <Link
            key={tab.type}
            href={tab.href}
            className={`text-base font-extrabold transition ${
              isActive ? "text-foreground" : "text-muted"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
