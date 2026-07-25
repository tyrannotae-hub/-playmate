// 한글 이름 뒤에 받침 유무에 따라 조사/접미사를 붙일 때 쓰는 헬퍼.
// 예: "민준"(받침 있음) → "민준이", "지우"(받침 없음) → "지우".
function hasBatchim(text: string): boolean {
  const lastChar = text.trim().slice(-1);
  const code = lastChar.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

// 이름 여러 개를 "민준이 지우에게" 처럼 각자 받침에 맞는 "이" 접미사를 붙여 나열한다.
export function namesWithSuffix(names: string[]): string {
  return names.map((name) => (hasBatchim(name) ? `${name}이` : name)).join(" ");
}
