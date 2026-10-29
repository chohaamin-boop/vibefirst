# 작업 계획

[pick-one-plan.md](pick-one-plan.md)의 요구사항과 [roles.md](roles.md)의 역할을 실제 작업 단위로 쪼갠 문서입니다. 시작 전에 셋이 함께 읽고 "공통 약속"에 동의한 뒤 시작합니다.

## 공통 약속 (시작 전 5분)

1. **API 계약은 바꾸지 않습니다.** 바꿔야 하면 팀 채팅에 먼저 알리고 `pick-one-plan.md`를 고칩니다.
2. **파일 소유권**을 지킵니다. 아래 표에 없는 파일을 만들거나 남의 파일을 고쳐야 하면 먼저 말합니다.
3. 공통 타입은 `src/lib/types.ts` 하나만 씁니다. A가 0단계에서 만들고, 이후 수정은 C가 담당합니다.
4. `localStorage` 키: `pickone:voted:{pollId}` (값: 선택한 `optionIndex`)
5. 프론트엔드는 응답이 `!res.ok`이면 `{ "error": "메시지" }`의 `error`를 화면에 보여줍니다. C는 모든 오류 응답을 이 형식으로 보냅니다.

## 파일 소유권

| 담당 | 파일 |
| --- | --- |
| A | `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `src/components/CreatePollForm.tsx`, `src/components/CopyLinkButton.tsx`, `README.md`, `AGENTS.md`(명령어 섹션) |
| B | `src/app/p/[id]/page.tsx`, `src/components/VoteOptions.tsx`, `src/components/ResultChart.tsx`, `src/lib/voted-storage.ts` |
| C | `src/app/api/**`, `src/lib/supabase-server.ts`, `src/lib/validate.ts`, `src/lib/types.ts`(0단계 이후), `supabase/schema.sql`, `.env.example` |

## 공통 타입 (`src/lib/types.ts`)

```ts
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
```

## 진행 순서

```
00:00 ─ A: Next.js 세팅 → main 머지 (0단계)
00:15 ─ B, C: 최신 main에서 브랜치 생성
00:15 ─ C: 메모리 저장소 버전 API 먼저 완성 → PR #1 머지 (~00:35)
         A, B는 이 API로 실제 연동하며 개발
00:35 ─ C: Supabase 연결로 교체 → PR #2
01:15 ─ 통합: C → A → B 순서로 머지
01:40 ─ A: Vercel 배포, 셋이 시연 테스트
```

---

## A - 투표 생성 화면 + 세팅 (`feat/create-poll`)

### 0단계: 프로젝트 세팅 (00:00-00:15, 가장 먼저)

- [ ] `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
- [ ] 위 "공통 타입" 내용으로 `src/lib/types.ts` 생성
- [ ] `AGENTS.md` "명령어" 섹션에 `npm install`, `npm run dev`, `npm run build`, `npm run lint` 추가
- [ ] `README.md` "시작하기"에 실행 방법 추가
- [ ] `chore/setup` 브랜치로 PR → 바로 머지 → 팀 채팅에 "main 올라감" 공지

### 1단계: 생성 화면

- [ ] `CreatePollForm.tsx` (client component): 질문 1개 + 선택지 3개 입력
- [ ] 검증: `trim()` 후 비어 있으면 제출 버튼 비활성화 또는 에러 표시
- [ ] 제출 중 버튼 비활성화(중복 생성 방지)
- [ ] `POST /api/polls` → 성공 시 `router.push(`/p/${id}`)`, 실패 시 에러 메시지 표시
- [ ] `src/app/page.tsx`에서 폼 렌더링

### 2단계: 공통 UI

- [ ] `CopyLinkButton.tsx`: props 없음, `navigator.clipboard.writeText(window.location.href)` 후 "복사됨" 표시. B가 `/p/[id]` 페이지에 넣습니다.
- [ ] `layout.tsx`: 제목 "PICK ONE", 가운데 정렬 카드 레이아웃, 기본 Tailwind 스타일

### 3단계: 배포 (01:40~)

- [ ] Vercel에 레포 연결
- [ ] C에게 받은 환경변수를 Vercel 설정에 입력 (채팅에 키 값 붙여넣지 않기, 직접 입력하거나 화면 공유)
- [ ] 배포 URL을 `README.md`에 추가

**완료 기준:** `/`에서 투표를 만들면 `/p/{id}`로 이동한다.

---

## B - 투표 참여·결과 화면 (`feat/vote-ui`)

### 1단계: 상세 조회

- [ ] `src/app/p/[id]/page.tsx`: client component, `useParams()`로 `id` 읽기
- [ ] `GET /api/polls/{id}`로 질문·선택지·결과 조회
- [ ] 상태 3가지 처리: 로딩 / 404("존재하지 않는 투표") / 기타 에러

### 2단계: 투표

- [ ] `voted-storage.ts`: `getVoted(id): number | null`, `setVoted(id, optionIndex)` (키: `pickone:voted:{id}`)
- [ ] `VoteOptions.tsx`: 선택지 3개 버튼, 클릭 시 `POST /api/polls/{id}/vote`
- [ ] 성공 시 `setVoted` 저장 → 버튼 비활성화, 내가 고른 선택지 표시
- [ ] 페이지 진입 시 `getVoted`로 이미 투표했으면 처음부터 비활성화
- [ ] 제출 중 중복 클릭 방지, 실패 시 에러 메시지

### 3단계: 결과

- [ ] `ResultChart.tsx`: props `{ options, counts, totalVotes }`, 선택지별 막대 + `N표 (NN%)`
- [ ] 백분율: `totalVotes === 0`이면 0%, 아니면 `Math.round(count / totalVotes * 100)`
- [ ] `setInterval`로 3초마다 재조회, 언마운트 시 `clearInterval`
- [ ] 투표 직후 즉시 한 번 재조회
- [ ] A의 `CopyLinkButton` 배치 (A 머지 전이면 import만 해두고 통합 때 확인)

**완료 기준:** 서로 다른 브라우저 3개에서 투표한 결과가 3초 안에 모든 화면에 반영된다.

---

## C - DB·API (`feat/backend`)

### 1단계: 메모리 버전 API (00:15-00:35, 가장 급함)

A와 B가 기다리지 않도록 DB 없이 계약대로 동작하는 API를 먼저 머지합니다.

- [ ] `validate.ts`: 질문·선택지 검증 함수, `optionIndex`가 정수 0~2인지 검증
- [ ] `src/app/api/polls/route.ts` — `POST`: 검증 실패 400, 성공 `{ id }`
- [ ] `src/app/api/polls/[id]/route.ts` — `GET`: 없으면 404, 있으면 `PollDetail`
- [ ] `src/app/api/polls/[id]/vote/route.ts` — `POST`: 잘못된 입력 400, 없는 투표 404, 성공 `{ ok: true }`
- [ ] 저장소는 모듈 전역 `Map` (임시)
- [ ] `curl`로 3개 API 확인 → PR #1 머지 → 팀 채팅 공지

### 2단계: Supabase 연결

- [ ] Supabase 프로젝트 생성, `supabase/schema.sql` 작성 후 SQL Editor에서 실행

  ```sql
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
  ```

  RLS만 켜고 정책은 만들지 않습니다. 서버는 service role 키로 접근하므로 영향이 없고, 브라우저에서 직접 접근하는 길은 막힙니다.
- [ ] `npm install @supabase/supabase-js`
- [ ] `supabase-server.ts`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`로 클라이언트 생성 (`NEXT_PUBLIC_` 접두사 금지)
- [ ] `.env.example`에 변수명만 추가
- [ ] 메모리 `Map`을 Supabase 쿼리로 교체
  - 조회: `polls` 1건 + `votes`의 `option_index` 목록을 가져와 `counts` 계산
  - `id`가 UUID 형식이 아니면 DB 호출 전에 404 반환 (Postgres 형식 오류가 500으로 나가지 않게)
  - 예상 못 한 에러는 `console.error` 후 500
- [ ] `docs/decisions.md`에 "Supabase 접근은 서버 전용, RLS 정책 없음" 기록
- [ ] `curl`로 다시 확인 → PR #2

**완료 기준:** 브라우저 없이 `curl`로 생성 → 조회 → 투표 → 조회 시 `counts`가 늘어난다.

---

## 통합 (01:15-01:40)

1. C의 PR #2 머지 → A, B는 `git pull origin main` 후 자기 브랜치에 반영
2. A PR 리뷰·머지 (리뷰어: C)
3. B PR 리뷰·머지 (리뷰어: A)
4. `main`에서 `npm run build`가 통과하는지 확인

## 시연 체크 (01:40-02:00)

- [ ] 배포 URL에서 투표 생성
- [ ] 링크 복사 → 셋이 각자 다른 브라우저로 접속해 투표
- [ ] 같은 브라우저에서 새로고침 후 재투표가 막히는지
- [ ] 3초 안에 모든 화면에서 3표가 보이는지
- [ ] 빈 값 제출, 없는 투표 주소(`/p/없는id`)에서 에러 메시지가 나오는지
- [ ] [pick-one-plan.md](pick-one-plan.md)의 "완료 체크리스트" 전부 체크

## 막혔을 때

- 10분 넘게 막히면 바로 채팅에 공유합니다.
- 시간이 부족하면 우선순위: 생성 → 투표 → 결과 표시 → 3초 갱신 → 재투표 제한 → 링크 복사 → 스타일
