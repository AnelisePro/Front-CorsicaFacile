'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'
import styles from './Map.module.scss'

type MarkerType = {
  id: string
  position: [number, number]
  label: string
  isHovered?: boolean
}

type MapProps = {
  center: [number, number]
  zoom: number
  markers: MarkerType[]
  onMarkerClick?: (id: string) => void
  hoveredArtisanId?: string | null
}

function ChangeMapCenter({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

const corseBounds: [[number, number], [number, number]] = [
  [41.2, 8.6],
  [43.1, 9.7],
]

function FitCorseBounds() {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(corseBounds, { padding: [20, 20] })
  }, [map])
  return null
}

// Fonction pour créer les icônes avec classes SCSS
const createCustomIcon = (isHovered: boolean = false) => {
  const markerClass = isHovered ? styles.hovered : styles.normal
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="${styles.customMarker} ${markerClass}">
        <div class="${styles.markerDot}"></div>
      </div>
    `,
    iconSize: [isHovered ? 35 : 25, isHovered ? 35 : 25],
    iconAnchor: [isHovered ? 17.5 : 12.5, isHovered ? 17.5 : 12.5],
  })
}

export default function Map({ center, zoom, markers, onMarkerClick, hoveredArtisanId }: MapProps) {
  useEffect(() => {
    // Fix icône par défaut Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  return (
    <div className={styles.mapContainer}> {/* 🎯 Wrapper avec classe locale */}
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
        {markers.map(({ position, label, id }, i) => {
          const isHovered = hoveredArtisanId === id
          
          return (
            <Marker
              key={i}
              position={position}
              icon={createCustomIcon(isHovered)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(id)
                },
              }}
            >
              <Tooltip 
                permanent={false} 
                direction="top"
                offset={[0, -10]}
                className="custom-tooltip"
              >
                <div className={styles.tooltipContent}>
                  {label}
                </div>
              </Tooltip>
              
              <Popup>
                <div className={styles.popupContent}>
                  {label}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}








