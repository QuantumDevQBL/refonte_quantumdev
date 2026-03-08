interface ScoreCircleProps {
  score: number;
  size?: number;
}

export function ScoreCircle({ score, size = 160 }: ScoreCircleProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const color =
    score >= 70 ? "#22C55E" : score >= 40 ? "#F59E0B" : "#EF4444";

  const label =
    score >= 70 ? "Bon" : score >= 40 ? "À améliorer" : "Critique";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="absolute inset-0 -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1F2937"
            strokeWidth="10"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="relative flex flex-col items-center">
          <span
            className="font-mono text-4xl font-bold leading-none"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-xs text-text-muted">/100</span>
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
