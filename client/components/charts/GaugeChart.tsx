export function GaugeChart({ value }: { value: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.max(0, Math.min(100, value)) / 100) * circumference;
  const color = value > 85 ? "#00ff88" : value > 60 ? "#ffaa00" : "#ff3366";

  return (
    <svg width="150" height="150" viewBox="0 0 150 150">
      <circle cx="75" cy="75" r={radius} stroke="#1a2d4a" strokeWidth="14" fill="none" />
      <circle
        cx="75"
        cy="75"
        r={radius}
        stroke={color}
        strokeWidth="14"
        fill="none"
        strokeDasharray={`${progress} ${circumference}`}
        transform="rotate(-90 75 75)"
        strokeLinecap="round"
      />
      <text x="75" y="82" textAnchor="middle" fill="#e8f4ff" fontSize="26" className="mono">
        {value.toFixed(0)}
      </text>
    </svg>
  );
}
