import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { pageTitleFor } from './navigation'
import { useAuth } from '../../hooks/authContext'
import TopBar from '../documentation/TopBar'

function DocumentationScrollButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const scrollContainer = document.querySelector('main')
    if (!scrollContainer) return

    const updateVisibility = () => setIsVisible(scrollContainer.scrollTop > 280)
    updateVisibility()
    scrollContainer.addEventListener('scroll', updateVisibility, { passive: true })
    return () => scrollContainer.removeEventListener('scroll', updateVisibility)
  }, [])

  const handleScrollToTop = () => {
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type='button'
      onClick={handleScrollToTop}
      aria-label='Back to top'
      title='Back to top'
      className={`fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 md:bottom-6 md:right-6 ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <ArrowUp className='h-5 w-5' />
    </button>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const { session } = useAuth()
  const isResourceFullPage = pathname.startsWith('/resources/')
  const isDocumentationPage = pathname.startsWith('/documentation')
  const roleLabel = session?.role ?? 'Student'

  return (
    <div className='flex h-screen w-full overflow-hidden bg-[#f5f7f6] text-[#14211b]'>
      {!isResourceFullPage && <Sidebar />}
      <div className='flex min-w-0 flex-1 flex-col'>
        {isDocumentationPage && <TopBar />}
        {!isDocumentationPage && (
          <header className='flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#e6ebe8] bg-white px-5 py-3 md:px-8'>
            <p className='text-[13px] text-[#5d6b64]'>
              {roleLabel} / {pageTitleFor(pathname)}
            </p>
          </header>
        )}
        <main className='min-w-0 flex-1 overflow-y-auto hardware-scroll scroll-smooth'>
          {isDocumentationPage ? (
            <Outlet />
          ) : (
            <div className='relative mx-auto w-full max-w-[1240px] px-5 py-7 md:px-8'>
              <Outlet />
            </div>
          )}
        </main>
        {isDocumentationPage && <DocumentationScrollButton />}
      </div>
    </div>
  )
}
