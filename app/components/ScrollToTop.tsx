'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Délai pour s'assurer que la navigation est terminée
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      })
    }, 50)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
