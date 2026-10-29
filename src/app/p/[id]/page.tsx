"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CopyLinkButton from "@/components/CopyLinkButton";
import ResultChart from "@/components/ResultChart";
import VoteOptions from "@/components/VoteOptions";
import type { ErrorResponse, PollDetail } from "@/lib/types";
import { getVoted } from "@/lib/voted-storage";

const POLL_INTERVAL_MS = 3000;

type LoadError = { notFound: boolean; message: string };

export default function PollPage() {
  return (
    <Suspense fallback={<p className="mt-4 text-zinc-500">불러오는 중...</p>}>
      <PollView />
    </Suspense>
  );
}

function PollView() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<PollDetail | null>(null);
  const [error, setError] = useState<LoadError | null>(null);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);

  const fetchPoll = useCallback(async () => {
    try {
      const res = await fetch(`/api/polls/${id}`, { cache: "no-store" });
      if (!res.ok) {
        const data: ErrorResponse = await res.json().catch(() => ({ error: "" }));
        setError(
          res.status === 404
            ? { notFound: true, message: "존재하지 않는 투표입니다." }
            : { notFound: false, message: data.error || "투표를 불러오지 못했습니다." },
        );
        return;
      }
      setPoll(await res.json());
      setVotedIndex((prev) => prev ?? getVoted(id));
      setError(null);
    } catch {
      setError({ notFound: false, message: "네트워크 오류가 발생했습니다." });
    }
  }, [id]);

  useEffect(() => {
    const first = setTimeout(fetchPoll, 0);
    const timer = setInterval(fetchPoll, POLL_INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [fetchPoll]);

  if (error?.notFound) {
    return <p role="alert" className="mt-4 text-red-600">{error.message}</p>;
  }

  if (!poll) {
    return error ? (
      <p role="alert" className="mt-4 text-red-600">{error.message}</p>
    ) : (
      <p className="mt-4 text-zinc-500">불러오는 중...</p>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-6">
      <h2 className="text-xl font-semibold">{poll.question}</h2>
      <VoteOptions
        pollId={poll.id}
        options={poll.options}
        votedIndex={votedIndex}
        onVoted={(optionIndex) => {
          setVotedIndex(optionIndex);
          fetchPoll();
        }}
      />
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-zinc-500">현재 결과 · 총 {poll.totalVotes}표</h3>
        <ResultChart options={poll.options} counts={poll.counts} totalVotes={poll.totalVotes} />
      </section>
      {error && (
        <p role="alert" className="text-sm text-red-600">{error.message}</p>
      )}
      <div>
        <CopyLinkButton />
      </div>
    </div>
  );
}
