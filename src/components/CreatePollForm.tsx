"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CreatePollRequest, CreatePollResponse, ErrorResponse } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-300";

export default function CreatePollForm() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedQuestion = question.trim();
  const trimmedOptions = options.map((option) => option.trim());
  const canSubmit = trimmedQuestion !== "" && trimmedOptions.every((option) => option !== "");

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((option, i) => (i === index ? value : option)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);

    const body: CreatePollRequest = {
      question: trimmedQuestion,
      options: trimmedOptions as [string, string, string],
    };

    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data: CreatePollResponse | ErrorResponse = await res.json();

      if (!res.ok || !("id" in data)) {
        setError("error" in data ? data.error : "투표를 만들지 못했습니다.");
        setSubmitting(false);
        return;
      }

      router.push(`/p/${data.id}`);
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        질문
        <input
          className={inputClass}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="오늘 저녁 뭐 먹을까?"
          maxLength={100}
        />
      </label>

      {options.map((option, index) => (
        <label key={index} className="flex flex-col gap-1 text-sm font-medium">
          선택지 {index + 1}
          <input
            className={inputClass}
            value={option}
            onChange={(event) => updateOption(index, event.target.value)}
            placeholder={["치킨", "피자", "햄버거"][index]}
            maxLength={50}
          />
        </label>
      ))}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="rounded-lg bg-zinc-900 px-4 py-2 font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {submitting ? "만드는 중..." : "투표 만들기"}
      </button>
    </form>
  );
}
