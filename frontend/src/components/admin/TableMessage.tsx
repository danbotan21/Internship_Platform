import type { ReactNode } from 'react'

export default function TableMessage({ children }: { children: ReactNode }) {
  return <p className="border-t border-[#e2e8e4] px-5 py-10 text-center text-[13px] text-[#718078]">{children}</p>
}
