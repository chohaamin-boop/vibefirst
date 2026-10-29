import CreatePollForm from "@/components/CreatePollForm";

export default function Home() {
  return (
    <>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        질문 하나와 선택지 3개로 투표를 만들고 링크를 공유하세요.
      </p>
      <CreatePollForm />
    </>
  );
}
