"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sport } from "@/lib/types";
import { buttonClass, cardClass } from "@/lib/ui";
import { revalidateSports } from "./actions";

const ID_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

function SportRow({ sport, onSaved }: { sport: Sport; onSaved: () => void }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(sport.name);
  const [category, setCategory] = useState(sport.category);
  const [traits, setTraits] = useState(sport.traits.join(", "));
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function save() {
    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    if (!trimmedName || !trimmedCategory) {
      setErrorMsg("이름과 카테고리는 비워둘 수 없어요.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase
      .from("sports")
      .update({
        name: trimmedName,
        category: trimmedCategory,
        traits: traits
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      })
      .eq("id", sport.id);
    setSubmitting(false);
    if (error) {
      setErrorMsg("저장에 실패했어요.");
      return;
    }
    setEditing(false);
    onSaved();
    await revalidateSports();
    router.refresh();
  }

  async function remove() {
    if (
      !confirm(
        `"${sport.name}"을(를) 삭제할까요? 이 종목으로 등록된 클래스가 있으면 삭제에 실패해요.`
      )
    )
      return;
    const supabase = createClient();
    const { error } = await supabase.from("sports").delete().eq("id", sport.id);
    if (error) {
      alert("삭제에 실패했어요 — 이 종목으로 등록된 클래스가 남아있을 수 있어요.");
      return;
    }
    onSaved();
    await revalidateSports();
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-sm border border-line px-3.5 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">
            {sport.name} <span className="font-normal text-muted">({sport.id})</span>
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {sport.category}
            {sport.traits.length > 0 && ` · ${sport.traits.join(", ")}`}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setEditing(true)}
            className={buttonClass({ variant: "outline", size: "sm", full: false })}
          >
            수정
          </button>
          <button
            onClick={remove}
            className={buttonClass({ variant: "outline", size: "sm", full: false, className: "text-negative" })}
          >
            삭제
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-line px-3.5 py-3">
      <p className="text-xs font-bold text-muted">id: {sport.id} (변경 불가)</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름"
        className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm"
      />
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="카테고리"
        className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm"
      />
      <input
        value={traits}
        onChange={(e) => setTraits(e.target.value)}
        placeholder="특성 (쉼표로 구분)"
        className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm"
      />
      {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={submitting}
          className={buttonClass({ variant: "custom", size: "sm", full: false, className: "flex-1 bg-rink text-white" })}
        >
          {submitting ? "저장 중..." : "저장"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className={buttonClass({ variant: "outline", size: "sm", full: false, className: "flex-1" })}
        >
          취소
        </button>
      </div>
    </div>
  );
}

export default function SportsManager({ initialSports }: { initialSports: Sport[] }) {
  const router = useRouter();
  const [sports, setSports] = useState(initialSports);
  const [adding, setAdding] = useState(false);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newTraits, setNewTraits] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const categories = Array.from(new Set(sports.map((s) => s.category))).sort();

  function refreshList() {
    // 낙관적 갱신 대신, 서버 목록을 다시 받아오는 게 확실하다 (router.refresh는
    // 부모 서버 컴포넌트를 재조회하지만 이 클라이언트 state는 그대로라 별도로 안내).
    router.refresh();
  }

  async function addSport(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const id = newId.trim().toLowerCase();
    const name = newName.trim();
    const category = newCategory.trim();
    if (!ID_PATTERN.test(id)) {
      setErrorMsg("id는 영문 소문자·숫자·하이픈만 가능해요 (예: ice-hockey).");
      return;
    }
    if (!name || !category) {
      setErrorMsg("이름과 카테고리는 비워둘 수 없어요.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sports")
      .insert({
        id,
        name,
        category,
        traits: newTraits
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      })
      .select("id, name, emoji, category, traits")
      .single();
    setSubmitting(false);

    if (error || !data) {
      setErrorMsg(error?.code === "23505" ? "이미 있는 id예요." : "추가에 실패했어요.");
      return;
    }

    setSports((prev) => [...prev, data as Sport]);
    setNewId("");
    setNewName("");
    setNewCategory("");
    setNewTraits("");
    setAdding(false);
    await revalidateSports();
    router.refresh();
  }

  return (
    <div className={cardClass("flex flex-col gap-2.5")}>
      <p className="text-sm font-bold text-muted">
        종목 {sports.length}개 — 여기서 추가/수정/삭제하면 바로 앱에 반영돼요.
      </p>
      <p className="text-xs text-muted">
        ⚠️ 새로 추가한 종목은 전용 아이콘이 없어서 임시로 🏅 아이콘으로 보여요.
        원하는 아이콘을 붙이려면 개발 쪽에 알려주세요.
      </p>

      <div className="flex flex-col gap-2">
        {sports.map((s) => (
          <SportRow key={s.id} sport={s} onSaved={refreshList} />
        ))}
        {sports.length === 0 && <p className="py-4 text-sm text-muted">등록된 종목이 없어요.</p>}
      </div>

      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className={buttonClass({ variant: "custom", size: "sm", className: "border border-dashed border-line text-muted" })}
        >
          + 종목 추가
        </button>
      ) : (
        <form onSubmit={addSport} className="flex flex-col gap-2 rounded-sm border border-line px-3.5 py-3">
          <input
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder="id (영문 소문자, 예: rugby)"
            className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm"
          />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="이름 (예: 럭비)"
            className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm"
          />
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="카테고리 (예: 구기)"
            list="sport-categories"
            className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm"
          />
          <datalist id="sport-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <input
            value={newTraits}
            onChange={(e) => setNewTraits(e.target.value)}
            placeholder="특성 (쉼표로 구분, 선택)"
            className="w-full rounded-sm border border-line bg-background px-3 py-2 text-sm"
          />
          {errorMsg && <p className="text-xs text-negative">{errorMsg}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className={buttonClass({ variant: "custom", size: "sm", full: false, className: "flex-1 bg-rink text-white" })}
            >
              {submitting ? "추가 중..." : "추가"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className={buttonClass({ variant: "outline", size: "sm", full: false, className: "flex-1" })}
            >
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
