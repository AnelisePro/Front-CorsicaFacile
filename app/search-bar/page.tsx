import { Suspense } from 'react'
import SearchResults from './SearchResults'

export default function Page() {
  return (
    <Suspense fallback={<p>Chargement des résultats...</p>}>
      <SearchResults />
    </Suspense>
  )
}







