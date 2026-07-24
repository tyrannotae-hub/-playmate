"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FacilityHomeCategory } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";

const SLOT_LABELS = ["카테고리 1", "카테고리 2"];

export default function HomeCategoriesManager({
  facilityId,
  initialCategories,
  myClasses,
}: {
  facilityId: string;
  initialCategories: FacilityHomeCategory[];
  myClasses: { id: string; name: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold text-muted">홈 진열장</p>
      {SLOT_LABELS.map((label, slotIndex) => (
        <CategorySlot
          key={slotIndex}
          label={label}
          slotIndex={slotIndex}
          facilityId={facilityId}
          category={initialCategories[slotIndex]}
          myClasses={myClasses}
        />
      ))}
    </div>
  );
}

function CategorySlot({
  label,
  slotIndex,
  facilityId,
  category,
  myClasses,
}: {
  label: string;
  slotIndex: number;
  facilityId: string;
  category?: FacilityHomeCategory;
  myClasses: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();

    const { error } = await supabase
      .from("facility_home_categories")
      .insert({ facility_id: facilityId, name, sort_order: slotIndex });

    setSubmitting(false);
    if (error) {
      setErrorMsg("카테고리 생성에 실패했어요.");
      return;
    }
    setName("");
    router.refresh();
  }

  if (!category) {
    return (
      <form onSubmit={createCategory} className={cardClass("flex flex-col gap-2.5")}>
        <p className="text-xs font-bold text-muted">{label}</p>
        <div className="flex gap-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="카테고리 이름"
            className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className={buttonClass({ size: "sm", full: false, className: "px-4" })}
          >
            만들기
          </button>
        </div>
        {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}
      </form>
    );
  }

  return (
    <ExistingCategorySlot label={label} category={category} myClasses={myClasses} />
  );
}

function ExistingCategorySlot({
  label,
  category,
  myClasses,
}: {
  label: string;
  category: FacilityHomeCategory;
  myClasses: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [savingName, setSavingName] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function saveName() {
    setSavingName(true);
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase
      .from("facility_home_categories")
      .update({ name })
      .eq("id", category.id);

    setSavingName(false);
    if (error) {
      setErrorMsg("이름 저장에 실패했어요.");
      return;
    }
    router.refresh();
  }

  async function toggleClass(classId: string, checked: boolean) {
    setTogglingId(classId);
    setErrorMsg("");
    const supabase = createClient();

    if (checked) {
      const { error } = await supabase.from("facility_home_category_classes").insert({
        category_id: category.id,
        team_class_id: classId,
        sort_order: category.classIds.length,
      });
      setTogglingId(null);
      if (error) {
        setErrorMsg("클래스 담기에 실패했어요.");
        return;
      }
    } else {
      const { error } = await supabase
        .from("facility_home_category_classes")
        .delete()
        .eq("category_id", category.id)
        .eq("team_class_id", classId);
      setTogglingId(null);
      if (error) {
        setErrorMsg("클래스 빼기에 실패했어요.");
        return;
      }
    }
    router.refresh();
  }

  async function deleteCategory() {
    setDeleting(true);
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase
      .from("facility_home_categories")
      .delete()
      .eq("id", category.id);

    setDeleting(false);
    if (error) {
      setErrorMsg("카테고리 삭제에 실패했어요.");
      return;
    }
    router.refresh();
  }

  const checkedSet = new Set(category.classIds);

  return (
    <div className={cardClass("flex flex-col gap-3")}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-muted">{label}</p>
        <button
          onClick={deleteCategory}
          disabled={deleting}
          className={buttonClass({ variant: "outline", size: "sm", full: false })}
        >
          카테고리 삭제
        </button>
      </div>

      <div className="flex gap-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="카테고리 이름"
          className="w-full rounded-md border border-line bg-background px-3.5 py-3 text-sm"
        />
        <button
          onClick={saveName}
          disabled={savingName || name === category.name}
          className={buttonClass({ variant: "outline", size: "sm", full: false, className: "px-4" })}
        >
          이름 저장
        </button>
      </div>

      {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}

      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-muted">담을 클래스 선택</p>
        {myClasses.length === 0 && (
          <p className="py-2 text-sm text-muted">등록된 클래스가 없어요.</p>
        )}
        {myClasses.map((c) => (
          <label
            key={c.id}
            className="flex items-center gap-2.5 rounded-md border border-line px-3.5 py-2.5 text-sm"
          >
            <input
              type="checkbox"
              checked={checkedSet.has(c.id)}
              disabled={togglingId === c.id}
              onChange={(e) => toggleClass(c.id, e.target.checked)}
            />
            {c.name}
          </label>
        ))}
      </div>
    </div>
  );
}
