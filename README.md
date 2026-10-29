# vibefirst

3인 바이브 코딩 대회 프로젝트.

## 팀

| 역할 | 담당 | 비고 |
| --- | --- | --- |
| 멤버 A | TBD | |
| 멤버 B | TBD | |
| 멤버 C | TBD | |

## 프로젝트 개요

- **주제**: PICK ONE - 질문 1개와 선택지 3개로 만드는 투표 웹사이트
- **목표**: 2시간 안에 투표 웹사이트를 만들고 Vercel에 배포
- **기술 스택**: Next.js (App Router), Tailwind CSS, Supabase PostgreSQL, Vercel
- **기획서**: [docs/pick-one-plan.md](docs/pick-one-plan.md)
- **역할 분담**: [docs/roles.md](docs/roles.md)
- **작업 계획**: [docs/work-plan.md](docs/work-plan.md)

## 디렉터리 구조

```
.
├── src/            # 애플리케이션 코드
├── docs/           # 기획, 결정 사항, 회의 메모
├── .github/        # PR 템플릿 등
└── CONTRIBUTING.md # 협업 규칙
```

## 시작하기

```bash
npm install
cp .env.example .env   # 값을 채운 뒤 사용 (커밋 금지)
npm run dev            # http://localhost:3000
```

### Supabase 설정

1. Supabase 프로젝트를 만들고 SQL Editor에서 [`supabase/schema.sql`](supabase/schema.sql)을 실행합니다.
2. `.env`에 아래 값을 채웁니다. service role(secret) 키는 서버에서만 사용하며 브라우저 코드에 넣지 않습니다.

| 변수 | 설명 |
| --- | --- |
| `SUPABASE_URL` | 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | secret(service role) 키. 없으면 `SUPABASE_ANON_KEY`를 사용 |
| `SUPABASE_ANON_KEY` | anon(publishable) 키 |

Vercel에 배포할 때도 같은 환경변수를 프로젝트 설정에 등록합니다.

### API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `POST` | `/api/polls` | 투표 생성, `{ id }` 반환 |
| `GET` | `/api/polls/[id]` | 투표 상세와 선택지별 득표수(`counts`), `totalVotes` |
| `POST` | `/api/polls/[id]/vote` | `optionIndex`(0~2)로 투표 |

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint |

협업 규칙은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.
