import { card } from './styles'

// Placeholder shaped like a page while its data loads.
export default function PageLoader({ label }: { label: string }) {
  return (
    <div className='animate-pulse space-y-4 py-2' role='status' aria-busy='true'>
      <span className='sr-only'>{label}</span>
      <div className='h-3 w-24 rounded bg-[#e3e8e5]' />
      <div className='h-7 w-2/5 rounded bg-[#e3e8e5]' />
      <div className={`${card} space-y-3 p-5`}>
        <div className='h-4 w-1/3 rounded bg-[#eef1ef]' />
        <div className='h-3 w-full rounded bg-[#eef1ef]' />
        <div className='h-3 w-5/6 rounded bg-[#eef1ef]' />
      </div>
      <div className={`${card} h-32`} />
    </div>
  )
}
