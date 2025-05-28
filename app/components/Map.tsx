'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'

type MarkerType = {
  id: string
  position: [number, number]
  label: string
}

type MapProps = {
  center: [number, number]
  zoom: number
  markers: MarkerType[]
  onMarkerClick?: (id: string) => void
}

function ChangeMapCenter({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

const corseBounds: [[number, number], [number, number]] = [
  [41.2, 8.6],  // Sud-Ouest (lat, lon)
  [43.1, 9.7],  // Nord-Est (lat, lon)
]

function FitCorseBounds() {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(corseBounds, { padding: [20, 20] })
  }, [map])
  return null
}

export default function Map({ center, zoom, markers, onMarkerClick }: MapProps) {
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
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      maxBounds={corseBounds}
      maxBoundsViscosity={1.0}
      minZoom={8.5}
      maxZoom={16}
      scrollWheelZoom={true}
    >
      <ChangeMapCenter center={center} zoom={zoom} />
      <FitCorseBounds />
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map(({ position, label, id }, i) => (
        <Marker
          key={i}
          position={position}
          eventHandlers={{
            click: () => {
              if (onMarkerClick) onMarkerClick(id)
            }
          }}
        >
          <Popup>{label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}





