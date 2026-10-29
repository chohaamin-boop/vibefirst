-- PICK ONE 테이블 스키마 (docs/work-plan.md 기준)

create table polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null,
  created_at timestamptz not null default now()
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls(id) on delete cascade,
  option_index int not null check (option_index between 0 and 2),
  created_at timestamptz not null default now()
);

create index votes_poll_id_idx on votes(poll_id);

alter table polls enable row level security;
alter table votes enable row level security;

