import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nom = searchParams.get('nom')
  const codePostal = searchParams.get('codePostal')

  try {
    let url: string
    
    if (codePostal) {
      url = `https://geo.api.gouv.fr/communes?codePostal=${codePostal}&fields=nom,codesPostaux,codeDepartement&limit=10`
    } else if (nom) {
      url = `https://geo.api.gouv.fr/communes?nom=${nom}&fields=nom,codesPostaux,codeDepartement&limit=10`
    } else {
      return NextResponse.json({ error: 'Paramètre manquant' }, { status: 400 })
    }

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Erreur API geo.gouv.fr')
    }

    const data = await response.json()
    
    // Filtrer uniquement les communes corses
    const corseCommunities = data.filter((commune: any) => 
      commune.codeDepartement === '2A' || commune.codeDepartement === '2B'
    )

    return NextResponse.json(corseCommunities)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
