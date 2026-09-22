import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import type { RubricCriterion } from '../../types/evaluation'

type RubricCriteriaListProps = {
  criteria: RubricCriterion[]
  // Editing controls appear only for a draft version.
  onEdit?: (criterion: RubricCriterion) => void
  onRemove?: (criterion: RubricCriterion) => void
  onMove?: (criterion: RubricCriterion, offset: -1 | 1) => void
  busy?: boolean
}

const iconButton =
  'rounded-lg p-2 text-[#5d6b64] hover:bg-[#f2f5f3] hover:text-[#184b38] disabled:pointer-events-none disabled:opacity-30'

export default function RubricCriteriaList({ criteria, onEdit, onRemove, onMove, busy }: RubricCriteriaListProps) {
  if (!criteria.length) {
    return (
      <p className='rounded-lg border border-dashed border-[#d3dbd6] p-5 text-center text-[13px] text-[#5d6b64]'>
        No criteria yet.
      </p>
    )
  }

  return (
    <ol className='space-y-2'>
      {criteria.map((criterion, index) => (
        <li key={criterion.id} className='rounded-xl border border-[#e3e8e5] p-4'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <p className='flex items-center gap-2 text-[14px] font-semibold text-[#14211b]'>
                <span className='text-[#8a958f]'>{index + 1}.</span>
                {criterion.name}
                {criterion.isVisibleToStudents ? (
                  <Eye className='size-3.5 text-[#2b6a50]' aria-label='Visible to students' />
                ) : (
                  <EyeOff className='size-3.5 text-[#8a958f]' aria-label='Hidden from students' />
                )}
              </p>
              <p className='mt-1 text-[13px] text-[#2b3833]'>{criterion.description}</p>
              {criterion.guidance ? <p className='mt-1 text-[12px] text-[#8a958f]'>{criterion.guidance}</p> : null}
            </div>
            <div className='flex items-center gap-3'>
              <div className='text-right'>
                <p className='text-[16px] font-bold tabular-nums text-[#14211b]'>{criterion.weight}%</p>
                <p className='text-[11px] text-[#8a958f]'>
                  1–{criterion.scaleMax} · step {criterion.ratingStep}
                </p>
              </div>
              {onEdit || onRemove || onMove ? (
                <div className='flex gap-0.5'>
                  {onMove ? (
                    <>
                      <button
                        type='button'
                        disabled={busy || index === 0}
                        onClick={() => onMove(criterion, -1)}
                        className={iconButton}
                        aria-label={`Move ${criterion.name} up`}
                      >
                        <ArrowUp className='size-4' aria-hidden='true' />
                      </button>
                      <button
                        type='button'
                        disabled={busy || index === criteria.length - 1}
                        onClick={() => onMove(criterion, 1)}
                        className={iconButton}
                        aria-label={`Move ${criterion.name} down`}
                      >
                        <ArrowDown className='size-4' aria-hidden='true' />
                      </button>
                    </>
                  ) : null}
                  {onEdit ? (
                    <button
                      type='button'
                      onClick={() => onEdit(criterion)}
                      className={iconButton}
                      aria-label={`Edit ${criterion.name}`}
                    >
                      <Pencil className='size-4' aria-hidden='true' />
                    </button>
                  ) : null}
                  {onRemove ? (
                    <button
                      type='button'
                      onClick={() => onRemove(criterion)}
                      className={`${iconButton} hover:bg-[#fdf0ef] hover:text-[#a1332b]`}
                      aria-label={`Remove ${criterion.name}`}
                    >
                      <Trash2 className='size-4' aria-hidden='true' />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
