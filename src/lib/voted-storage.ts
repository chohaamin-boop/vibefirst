const keyOf = (pollId: string) => `pickone:voted:${pollId}`;

export function getVoted(pollId: string): number | null {
  try {
    const raw = window.localStorage.getItem(keyOf(pollId));
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isInteger(value) && value >= 0 && value <= 2 ? value : null;
  } catch {
    return null;
  }
}

export function setVoted(pollId: string, optionIndex: number): void {
  try {
    window.localStorage.setItem(keyOf(pollId), String(optionIndex));
  } catch {
    // 저장소를 쓸 수 없어도 투표 자체는 성공한 상태로 둡니다.
  }
}
