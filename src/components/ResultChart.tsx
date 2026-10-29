type ResultChartProps = {
  options: string[];
  counts: number[];
  totalVotes: number;
};

export default function ResultChart({ options, counts, totalVotes }: ResultChartProps) {
  return (
    <ul className="flex flex-col gap-3">
      {options.map((option, index) => {
        const count = counts[index] ?? 0;
        const percent = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
        return (
          <li key={index} className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{option}</span>
              <span className="text-zinc-500">
                {count}표 ({percent}%)
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-900 transition-all duration-500 dark:bg-zinc-100"
                style={{ width: `${percent}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
