import type { RequirementWeight, Candidate } from '../../types/skillMatch'
import { getCandidateSkillScore } from '../../data/skillMatchData'

interface RadarSkillChartProps {
  requirements: RequirementWeight[]
  candidate: Candidate
}

export default function RadarSkillChart({ requirements, candidate }: RadarSkillChartProps) {
  const size = 300
  const center = size / 2
  const radius = 92
  const count = requirements.length

  if (count < 3) {
    return null
  }

  // Generate angle for index i (starting at top: -PI/2)
  const getAngle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / count

  // Calculate coordinates
  const getCoordinates = (value: number, angle: number) => {
    const r = (Math.max(0, Math.min(100, value)) / 100) * radius
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y }
  }

  // Grid concentric levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0]

  // Calculate polygon points
  const candidatePoints = requirements
    .map((req, i) => {
      const score = getCandidateSkillScore(candidate, req)
      const { x, y } = getCoordinates(score, getAngle(i))
      return `${x},${y}`
    })
    .join(' ')

  const requiredPoints = requirements
    .map((req, i) => {
      const { x, y } = getCoordinates(req.gate, getAngle(i))
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="flex justify-center items-center py-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible select-none"
      >
        {/* Concentric grid lines */}
        {levels.map((lvl) => {
          const polyPoints = requirements
            .map((_, i) => {
              const r = lvl * radius
              const x = center + r * Math.cos(getAngle(i))
              const y = center + r * Math.sin(getAngle(i))
              return `${x},${y}`
            })
            .join(' ')

          return (
            <polygon
              key={lvl}
              points={polyPoints}
              fill={lvl === 1.0 ? '#fbfdfc' : 'none'}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          )
        })}

        {/* Spokes from center to vertices */}
        {requirements.map((_, i) => {
          const angle = getAngle(i)
          const x = center + radius * Math.cos(angle)
          const y = center + radius * Math.sin(angle)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          )
        })}

        {/* Required (Gate) Polygon - Orange dashed */}
        <polygon
          points={requiredPoints}
          fill="rgba(249, 115, 22, 0.12)"
          stroke="#f97316"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Candidate (Student) Polygon - Dark green filled */}
        <polygon
          points={candidatePoints}
          fill="rgba(30, 58, 44, 0.22)"
          stroke="#1e3a2c"
          strokeWidth="2"
        />

        {/* Candidate Vertex Dots */}
        {requirements.map((req, i) => {
          const score = getCandidateSkillScore(candidate, req)
          const { x, y } = getCoordinates(score, getAngle(i))
          return (
            <circle
              key={req.id}
              cx={x}
              cy={y}
              r="3.5"
              fill="#1e3a2c"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          )
        })}

        {/* Labels at vertices */}
        {requirements.map((req, i) => {
          const angle = getAngle(i)
          const labelOffset = 26
          const x = center + (radius + labelOffset) * Math.cos(angle)
          const y = center + (radius + labelOffset) * Math.sin(angle)

          // Alignment adjustments based on angle
          let textAnchor: 'middle' | 'start' | 'end' = 'middle'
          if (Math.cos(angle) > 0.2) textAnchor = 'start'
          else if (Math.cos(angle) < -0.2) textAnchor = 'end'

          // Shorten label for radar vertices if very long
          const displayName = req.name.length > 18 ? `${req.name.slice(0, 16)}...` : req.name

          return (
            <text
              key={req.id}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="central"
              className="text-[10px] sm:text-[11px] font-medium fill-gray-600 font-sans"
            >
              {displayName}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
