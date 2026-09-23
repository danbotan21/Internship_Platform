import { SlidersHorizontal, Plus, Trash2, RotateCcw, Timer } from 'lucide-react'
import type { RequirementWeight } from '../../types/skillMatch'

interface RequirementWeightsCardProps {
  requirements: RequirementWeight[]
  onChangeRequirements: (newRequirements: RequirementWeight[]) => void
  onOpenAddModal: () => void
  onResetDefault: () => void
}

export default function RequirementWeightsCard({
  requirements,
  onChangeRequirements,
  onOpenAddModal,
  onResetDefault,
}: RequirementWeightsCardProps) {
  const totalWeight = requirements.reduce((sum, r) => sum + r.weight, 0)
  const isExact100 = totalWeight === 100

  const handleUpdateWeight = (id: string, newWeight: number) => {
    onChangeRequirements(
      requirements.map((r) => (r.id === id ? { ...r, weight: Math.max(0, Math.min(100, newWeight)) } : r))
    )
  }

  const handleUpdateGate = (id: string, newGate: number) => {
    onChangeRequirements(
      requirements.map((r) => (r.id === id ? { ...r, gate: Math.max(0, Math.min(100, newGate)) } : r))
    )
  }

  const handleDelete = (id: string) => {
    const remaining = requirements.filter((r) => r.id !== id)
    if (remaining.length > 0) {
      const baseWeight = Math.floor(100 / remaining.length)
      let remWeight = 100 - baseWeight * remaining.length
      const rebalanced = remaining.map((r) => {
        const w = baseWeight + (remWeight > 0 ? 1 : 0)
        if (remWeight > 0) remWeight--
        return { ...r, weight: w }
      })
      onChangeRequirements(rebalanced)
    } else {
      onChangeRequirements([])
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-700 shrink-0">
            <SlidersHorizontal className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Requirement Weights</h2>
            <p className="text-xs text-gray-500">Set skill weights & minimum threshold gates</p>
          </div>
        </div>

        {/* Total Weight Counter Box */}
        <div
          className={`flex items-center justify-center rounded-xl border px-3.5 py-1.5 text-center font-bold text-xs tracking-tight transition-colors ${
            isExact100
              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
              : 'border-amber-200 bg-amber-50/70 text-amber-800'
          }`}
          title={isExact100 ? 'Weights total exactly 100%' : `Weights sum to ${totalWeight}%. Adjust sliders to equal 100%.`}
        >
          {totalWeight}% / 100
        </div>
      </div>

      {/* Requirement Items List */}
      {requirements.length === 0 ? (
        <div className="py-8 px-4 text-center">
          <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-400">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-gray-700">No quiz requirements set for this internship</p>
          <p className="text-[11px] text-gray-400 mt-1">
            Click "+ Add Requirement" below to add quizzes or criteria.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 py-2">
          {requirements.map((req) => (
            <div key={req.id} className="py-4.5 group">
              {/* Top Row: Skill Name, Gate Input, Weight Label */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">{req.name}</span>
                  {req.isQuiz && (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5">
                      <Timer className="h-3 w-3 text-emerald-700" />
                      QUIZ
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(req.id)}
                    title="Remove requirement"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-300 hover:text-rose-500 rounded cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

              <div className="flex items-center gap-4">
                {/* Gate Numeric Input */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="font-semibold tracking-wider text-[11px] text-gray-400">GATE</span>
                  <div className="flex items-center rounded-lg border border-gray-200 bg-white px-2 py-0.5 shadow-2xs focus-within:border-[#1e3a2c] focus-within:ring-1 focus-within:ring-[#1e3a2c]/10">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={req.gate}
                      onChange={(e) => handleUpdateGate(req.id, Number(e.target.value))}
                      className="w-8 text-center text-xs font-semibold text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none"
                    />
                    <span className="text-gray-400 text-[11px]">%</span>
                  </div>
                </div>

                {/* Weight Percentage Display */}
                <div className="w-12 text-right">
                  <span className="text-sm font-bold text-gray-900">{req.weight}%</span>
                </div>
              </div>
            </div>

            {/* Dual Tracks: Gate Visualizer (Top) and Weight Slider (Bottom) */}
            <div className="space-y-2 pt-1">
              {/* Gate Visualizer Bar */}
              <div className="relative h-1.5 w-full rounded-full bg-gray-100 overflow-visible">
                {/* Green fill up to gate */}
                <div
                  className="h-full rounded-full bg-[#1e3a2c] transition-all duration-200"
                  style={{ width: `${req.gate}%` }}
                />
                {/* Orange Gate Tick Mark */}
                <div
                  className="absolute top-[-4px] h-3.5 w-0.5 bg-[#f97316] rounded-full shadow-2xs cursor-ew-resize transition-all duration-200"
                  style={{ left: `${req.gate}%` }}
                  title={`Gate threshold: ${req.gate}%`}
                />
              </div>

              {/* Weight Slider */}
              <div className="relative flex items-center pt-0.5">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={req.weight}
                  onChange={(e) => handleUpdateWeight(req.id, Number(e.target.value))}
                  className="w-full h-1.5 appearance-none rounded-full bg-gray-200 cursor-pointer accent-[#1e3a2c] focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #1e3a2c 0%, #1e3a2c ${req.weight}%, #e2e8f0 ${req.weight}%, #e2e8f0 100%)`,
                  }}
                  title={`Weight: ${req.weight}%`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Footer Controls */}
      <div className="pt-4 space-y-2.5">
        {/* Add Requirement Button (Orange like in screenshot) */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f97316] px-4 py-3 text-sm font-bold text-white shadow-xs hover:bg-[#ea580c] active:scale-[0.99] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Add Requirement
        </button>

        {/* Reset / Helper Button */}
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <button
            type="button"
            onClick={onResetDefault}
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset to default
          </button>
          {!isExact100 && (
            <span className="text-[11px] text-amber-600 font-medium">
              Note: weights should sum to 100%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
