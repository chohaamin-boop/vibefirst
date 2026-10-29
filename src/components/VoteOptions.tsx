"use client";

import { useState } from "react";
import type { ErrorResponse, VoteRequest } from "@/lib/types";
import { setVoted } from "@/lib/voted-storage";

type VoteOptionsProps = {
  pollId: string;
  options: string[];
  votedIndex: number | null;
  onVoted: (optionIndex: number) => void;
};

export default function VoteOptions({ pollId, options, votedIndex, onVoted }: VoteOptionsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = submitting || votedIndex !== null;

  async function handleVote(optionIndex: number) {
    if (disabled) return;

    setSubmitting(true);
    setError(null);

    const body: VoteRequest = { optionIndex: optionIndex as 0 | 1 | 2 };

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data: ErrorResponse = await res.json().catch(() => ({ error: "" }));
        setError(data.error || "투표하지 못했습니다.");
        setSubmitting(false);
        return;
      }

      setVoted(pollId, optionIndex);
      onVoted(optionIndex);
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map((option, index) => {
        const selected = votedIndex === index;
        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => handleVote(index)}
            className={`rounded-lg border px-4 py-3 text-left font-medium transition-colors disabled:cursor-not-allowed ${
              selected
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-300 hover:bg-zinc-100 disabled:opacity-50 disabled:hover:bg-transparent dark:border-zinc-700 dark:hover:bg-zinc-800"
            }`}
          >
            {option}
            {selected && <span className="ml-2 text-sm font-normal">✓ 내 선택</span>}
          </button>
        );
      })}
      {votedIndex !== null && (
        <p className="text-sm text-zinc-500">투표해 주셔서 감사합니다.</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
