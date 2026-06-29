function getScoreConfig(score) {
  if (score == null) return { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', label: 'N/A' }
  if (score >= 70) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', label: 'Good' }
  if (score >= 40) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', label: 'Moderate' }
  return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Poor' }
}

function HealthScoreBadge({ score, reasoning }) {
  const config = getScoreConfig(score)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = score != null ? ((score) / 100) * circumference : 0
  const offset = circumference - progress

  return (
    <div className="glass-card rounded-2xl p-6 flex items-center gap-6 animate-slide-up">
      {/* Animated SVG ring */}
      <div className="relative flex-shrink-0">
        <svg width="100" height="100" className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx="50" cy="50" r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress ring */}
          <circle
            cx="50" cy="50" r={radius}
            stroke={config.color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${config.color}60)`,
            }}
          />
        </svg>
        {/* Score number in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-bold"
            style={{ color: config.color }}
          >
            {score ?? '—'}
          </span>
          <span
            className="text-[10px] font-medium uppercase tracking-wider mt-0.5"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-100">Health Score</h3>
        {reasoning && (
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">{reasoning}</p>
        )}
      </div>
    </div>
  )
}

export default HealthScoreBadge
