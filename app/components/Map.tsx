'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'

type MarkerType = {
  position: [number, number]
  label: string
}

type MapProps = {
  center: [number, number]
  markers: MarkerType[]
}

export default function Map({ center, markers }: MapProps) {
  useEffect(() => {
    // Fix icône par défaut Leaflet (nécessaire avec Webpack/Next.js)
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  return (
    <MapContainer center={center} zoom={10} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map(({ position, label }, i) => (
        <Marker key={i} position={position}>
          <Popup>{label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}


