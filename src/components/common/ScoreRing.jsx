export default function ScoreRing({ score, size = 56 }) {
  const value = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const tone =
    value >= 75 ? "text-success" : value >= 50 ? "text-warning" : "text-destructive";
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dash = (value / 100) * circumference;

  return (
    <div className={`relative ${tone}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="28" cy="28" r={radius} fill="none" strokeWidth="4" className="stroke-muted" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold text-foreground">
        {value}%
      </span>
      <span className="sr-only">Match confidence {value} percent</span>
    </div>
  );
}