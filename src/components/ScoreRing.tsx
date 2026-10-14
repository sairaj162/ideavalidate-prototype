import { cn } from "@/lib/utils";
import { interpretScore, type Tier } from "@/lib/scoring";

export const tierText: Record<Tier, string> = {
  low: "text-score-low",
  mid: "text-score-mid",
  good: "text-score-good",
  high: "text-score-high",
};
export const tierBg: Record<Tier, string> = {
  low: "bg-score-low",
  mid: "bg-score-mid",
  good: "bg-score-good",
  high: "bg-score-high",
};

/** Circular score indicator coloured by score band. */
export function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  const { tier } = interpretScore(score);
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative", tierText[tier])} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-muted" />
        <circle
          cx="50" cy="50" r={r} fill="none" strokeWidth="9" strokeLinecap="round"
          stroke="currentColor" strokeDasharray={c} strokeDashoffset={c - (score / 100) * c}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-3xl font-semibold text-foreground">{score}</div>
          <div className="text-xs text-muted-foreground">/ 100</div>
        </div>
      </div>
    </div>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const { tier } = interpretScore(score);
  return (
    <span className={cn("inline-flex min-w-10 justify-center rounded-full px-2.5 py-0.5 text-sm font-semibold text-primary-foreground", tierBg[tier])}>
      {score}
    </span>
  );
}
