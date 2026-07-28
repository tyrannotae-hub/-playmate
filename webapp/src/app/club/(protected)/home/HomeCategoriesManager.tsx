"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FacilityHomeCategory } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";

type MyClass = { id: string; name: string; coverImage?: string };

export default function HomeCategoriesManager({
  facilityId,
  initialCategories,
  myClasses,
}: {
  facilityId: string;
  initialCategories: FacilityHomeCategory[];
  myClasses: MyClass[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
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
      .insert({ facility_id: facilityId, name, sort_order: initialCategories.length });

    setSubmitting(false);
    if (error) {
      setErrorMsg("카테고리 생성에 실패했어요.");
      return;
    }
    setName("");
    setAdding(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted">홈 진열장</p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className={buttonClass({ variant: "outline", size: "sm", full: false })}
          >
            + 카테고리 추가
          </button>
        )}
      </div>

      {initialCategories.map((category) => (
        <CategoryCard key={category.id} category={category} myClasses={myClasses} />
      ))}

      {adding && (
        <form onSubmit={createCategory} className={cardClass("flex flex-col gap-2.5")}>
          <div className="flex gap-2">
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="카테고리 이름"
              className="w-full rounded-sm border border-line bg-background px-3.5 py-3 text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className={buttonClass({ size: "sm", full: false, className: "px-4" })}
            >
              만들기
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className={buttonClass({ variant: "outline", size: "sm", full: false, className: "px-4" })}
            >
              취소
            </button>
          </div>
          {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}
        </form>
      )}
    </div>
  );
}

function CategoryCard({
  category,
  myClasses,
}: {
  category: FacilityHomeCategory;
  myClasses: MyClass[];
}) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [savingName, setSavingName] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [savingRows, setSavingRows] = useState(false);
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

  async function setDisplayRows(rows: 1 | 2) {
    if (rows === category.displayRows) return;
    setSavingRows(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("facility_home_categories")
      .update({ display_rows: rows })
      .eq("id", category.id);
    setSavingRows(false);
    if (!error) router.refresh();
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
    if (!confirm(`"${category.name}" 카테고리를 삭제할까요?`)) return;
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
        <p className="text-xs font-bold text-muted">{category.classIds.length}개 클래스</p>
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
          className="w-full rounded-sm border border-line bg-background px-3.5 py-3 text-sm"
        />
        <button
          onClick={saveName}
          disabled={savingName || name === category.name}
          className={buttonClass({ variant: "outline", size: "sm", full: false, className: "px-4" })}
        >
          이름 저장
        </button>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-bold text-muted">
          공개 페이지 노출 줄 수 <span className="font-normal">(안 쓰면 1줄로 두면 돼요)</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={savingRows}
            onClick={() => setDisplayRows(1)}
            className={buttonClass({
              variant: category.displayRows === 1 ? "secondary" : "outline",
              size: "sm",
              full: false,
              className: "flex-1",
            })}
          >
            1줄
          </button>
          <button
            type="button"
            disabled={savingRows}
            onClick={() => setDisplayRows(2)}
            className={buttonClass({
              variant: category.displayRows === 2 ? "secondary" : "outline",
              size: "sm",
              full: false,
              className: "flex-1",
            })}
          >
            2줄
          </button>
        </div>
      </div>

      {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold text-muted">담을 클래스 선택 (가로로 넘겨보세요)</p>
        {myClasses.length === 0 ? (
          <p className="py-2 text-sm text-muted">등록된 클래스가 없어요.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {myClasses.map((c) => {
              const checked = checkedSet.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={togglingId === c.id}
                  onClick={() => toggleClass(c.id, !checked)}
                  className={`relative flex w-20 shrink-0 flex-col items-center gap-1 rounded-sm border p-1.5 text-center transition ${
                    checked ? "border-rink bg-rink-soft" : "border-line"
                  }`}
                >
                  <div
                    className="h-14 w-14 shrink-0 rounded-sm bg-surface-2 bg-cover bg-center"
                    style={c.coverImage ? { backgroundImage: `url(${c.coverImage})` } : undefined}
                  />
                  <span className="line-clamp-2 text-[11px] font-bold leading-tight">{c.name}</span>
                  {checked && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rink text-[10px] text-white">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
