import { Suspense } from 'react'

export default function AnnoncesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Suspense fallback={<div className="text-center py-8">Chargement des annonces...</div>}>
        {children}
      </Suspense>
    </div>
  )
}
