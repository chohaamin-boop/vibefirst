export type CreatePollRequest = { question: string; options: [string, string, string] };
export type CreatePollResponse = { id: string };

export type PollDetail = {
  id: string;
  question: string;
  options: string[];
  counts: number[];
  totalVotes: number;
};

export type VoteRequest = { optionIndex: 0 | 1 | 2 };
export type VoteResponse = { ok: true };

export type ErrorResponse = { error: string };
