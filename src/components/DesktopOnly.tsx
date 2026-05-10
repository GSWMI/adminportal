import { useEffect, useState } from 'react'
import { Monitor } from 'lucide-react'

const DESKTOP_MIN_WIDTH = 1024

export default function DesktopOnly({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= DESKTOP_MIN_WIDTH)

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= DESKTOP_MIN_WIDTH)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (isDesktop) return <>{children}</>

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex flex-col items-center justify-center px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
        <Monitor size={32} className="text-white" strokeWidth={1.5} />
      </div>
      <img src="/logo.png" alt="GSWMI" className="h-10 object-contain" />
      <h1 className="text-white text-[20px] font-semibold mb-3">Desktop only</h1>
      <p className="text-white/60 text-[14px] leading-relaxed max-w-70">
        This admin dashboard is only available on desktop screens. Please open it on a laptop or larger display.
      </p>
    </div>
  )
}