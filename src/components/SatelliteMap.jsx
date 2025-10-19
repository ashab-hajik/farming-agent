import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Rectangle, Polygon, useMapEvents, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import useStore from '../store.js'
import { recommend } from '../ai/engine.js'
import { t } from '../i18n.js'

function MapInteractions({ mode, drawing, onSquarePoint, onPolygonPoint }) {
  useMapEvents({
    click(e) {
      if (!drawing) return
      const point = [e.latlng.lat, e.latlng.lng]
      if (mode === 'square') {
        onSquarePoint(point)
      } else {
        onPolygonPoint(point)
      }
    }
  })
  return null
}

function MapViewUpdater({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (!center) return
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export default function SatelliteMap() {
  const { inputs, setInputs, setLayout, setRecommendations, setEconomic, recommendations } = useStore()
  const [bounds, setBounds] = useState(null)
  const [center, setCenter] = useState([20.5937, 78.9629])
  const [zoom, setZoom] = useState(5)
  const [area, setArea] = useState(null)
  const [drawing, setDrawing] = useState(false)
  const [mode, setMode] = useState('square')
  const [sizeM, setSizeM] = useState(100) // side length in meters
  const [squareCenter, setSquareCenter] = useState(null)
  const [polygonPoints, setPolygonPoints] = useState([])
  const [liveLocation, setLiveLocation] = useState(null)
  const [watching, setWatching] = useState(false)
  const watchRef = useRef(null)

  const legend = useMemo(() => ({ crop: '#43a047', tree: '#2e7d32' }), [])
  const treeOptions = recommendations.trees?.length ? recommendations.trees : ['Neem', 'Tamarind', 'Mango']
  const cropOptions = recommendations.crops?.length ? recommendations.crops : ['Millet', 'Pulses', 'Turmeric']

  function applyToLayout() {
    const rows = 30
    const cols = 30
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ type: 'crop', label: cropOptions[0] })))
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isBorder = r === 0 || c === 0 || r === rows - 1 || c === cols - 1
        if (isBorder) grid[r][c] = { type: 'tree', label: treeOptions[(r + c) % treeOptions.length] }
      }
    }
    setLayout({ grid, legend })
  }

  function toRad(d) { return d * Math.PI / 180 }
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  function polygonAreaMeters(points) {
    if (points.length < 3) return 0
    const R = 6371000
    const meanLat = points.reduce((acc, [lat]) => acc + lat, 0) / points.length
    const latFactor = Math.PI / 180 * R
    const cosLat = Math.cos(meanLat * Math.PI / 180)
    const coords = points.map(([lat, lng]) => [
      lng * cosLat * latFactor,
      lat * latFactor
    ])
    let area = 0
    for (let i = 0; i < coords.length; i++) {
      const [x1, y1] = coords[i]
      const [x2, y2] = coords[(i + 1) % coords.length]
      area += x1 * y2 - x2 * y1
    }
    return Math.abs(area) / 2
  }

  useEffect(() => {
    if (mode === 'polygon' && polygonPoints.length >= 3) {
      const lats = polygonPoints.map(p => p[0])
      const lngs = polygonPoints.map(p => p[1])
      setBounds([
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      ])
      const polyArea = polygonAreaMeters(polygonPoints)
      setArea({ m2: Math.round(polyArea), widthM: null, heightM: null })
    } else if (mode === 'square' && squareCenter) {
      const b = pointToBounds(squareCenter, sizeM)
      setBounds(b)
      const [[sLat, sLng], [nLat, nLng]] = b
      const heightM = haversine(sLat, sLng, nLat, sLng)
      const widthM = haversine(sLat, sLng, sLat, nLng)
      setArea({ m2: Math.round(widthM * heightM), widthM: Math.round(widthM), heightM: Math.round(heightM) })
    } else {
      setBounds(null)
      setArea(null)
    }
  }, [mode, polygonPoints, squareCenter, sizeM])

  useEffect(() => {
    if (!area?.m2) return
    const acres = Number((area.m2 / 4046.86).toFixed(2))
    if (!acres) return
    if (Math.abs(acres - inputs.area) < 0.01) return
    const updatedInputs = { ...inputs, area: acres }
    setInputs(updatedInputs)
    const out = recommend(updatedInputs)
    setRecommendations(out.recommendations)
    setLayout(out.layout)
    setEconomic(out.economic)
  }, [area, inputs, setInputs, setRecommendations, setLayout, setEconomic])

  useEffect(() => {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setCenter([lat, lng])
      setLiveLocation([lat, lng])
      setZoom(15)
    }, () => { }, { enableHighAccuracy: true, maximumAge: 30000, timeout: 8000 })
  }, [])

  function pointToBounds([lat, lng], sideMeters) {
    const half = sideMeters / 2
    const dLat = (half / 111320)
    const dLng = (half / (111320 * Math.cos(lat * Math.PI / 180)))
    return [
      [lat - dLat, lng - dLng],
      [lat + dLat, lng + dLng]
    ]
  }

  function goToCurrentLocation() {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setCenter([lat, lng])
      setLiveLocation([lat, lng])
      setZoom(17)
    }, () => { }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 8000 })
  }

  function toggleLiveTracking() {
    if (!('geolocation' in navigator)) return
    if (watching) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
      setWatching(false)
      return
    }
    goToCurrentLocation()
    const id = navigator.geolocation.watchPosition((pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setCenter([lat, lng])
      setLiveLocation([lat, lng])
      setZoom(17)
    }, () => { }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 8000 })
    watchRef.current = id
    setWatching(true)
  }

  function handleModeChange(nextMode) {
    setMode(nextMode)
    setDrawing(false)
    setPolygonPoints([])
    setSquareCenter(null)
    setBounds(null)
    setArea(null)
  }

  function toggleDrawing() {
    if (mode === 'square') {
      setDrawing(d => !d)
      if (drawing) {
        setSquareCenter(null)
      }
    } else {
      setDrawing(d => !d)
      if (!drawing) {
        setPolygonPoints([])
      }
    }
  }

  function stopDrawing() {
    setDrawing(false)
  }

  function resetSelection() {
    setDrawing(false)
    setPolygonPoints([])
    setSquareCenter(null)
    setBounds(null)
    setArea(null)
  }

  return (
    <div className="bg-white/90 rounded-2xl border border-emerald-200 p-5 shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow">🛰</span>
          {t('satelliteMap')}
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <div className="inline-flex rounded border border-emerald-300 overflow-hidden">
            <button onClick={() => handleModeChange('square')} className={`px-2 py-1 ${mode === 'square' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700'}`}>{t('squareMode')}</button>
            <button onClick={() => handleModeChange('polygon')} className={`px-2 py-1 ${mode === 'polygon' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700'}`}>{t('polygonMode')}</button>
          </div>
          {mode === 'square' && (
            <label className="flex items-center gap-1">
              <span className="text-emerald-800">{t('sizeLabel')}</span>
              <input type="range" min="20" max="400" step="10" value={sizeM} onChange={(e) => { const v = Number(e.target.value); setSizeM(v); if (squareCenter) setSquareCenter([...squareCenter]) }} />
              <span className="w-14 text-right">{sizeM} m</span>
            </label>
          )}
          <button onClick={toggleDrawing} className={`px-3 py-1 rounded border ${drawing ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-300'}`}>{drawing ? t('stopDrawing') : t('startDrawing')}</button>
          <button onClick={stopDrawing} className="px-3 py-1 rounded border border-emerald-300 text-emerald-700">{t('stopDrawing')}</button>
          <button onClick={resetSelection} className="px-3 py-1 rounded border border-emerald-300 text-emerald-700">{t('reset')}</button>
          <button onClick={toggleLiveTracking} className={`px-3 py-1 rounded border ${watching ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-300'}`}>{watching ? t('stopLiveLocation') : t('liveLocation')}</button>
          <button onClick={applyToLayout} className="px-3 py-1 rounded bg-amber-500 text-white disabled:opacity-60" disabled={!bounds}>{t('applyToLayout')}</button>
        </div>
      </div>
      <p className="text-emerald-900/80 text-sm mb-1">{t('satelliteInstructions')}</p>
      <div className="text-xs text-emerald-900/70 mb-3">
        <div>{mode === 'square' ? t('squareInstructions') : t('polygonInstructions')}</div>
      </div>
      <div className="h-72 rounded-xl overflow-hidden border border-emerald-100">
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; Esri, Maxar'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          <MapViewUpdater center={center} zoom={zoom} />
          <MapInteractions
            mode={mode}
            drawing={drawing}
            onSquarePoint={(pt) => { setSquareCenter(pt) }}
            onPolygonPoint={(pt) => setPolygonPoints(prev => [...prev, pt])}
          />
          {mode === 'square' && squareCenter && (<Marker position={squareCenter} />)}
          {mode === 'square' && bounds && (<Rectangle bounds={bounds} pathOptions={{ color: '#f59e0b', weight: 2 }} />)}
          {mode === 'polygon' && polygonPoints.length >= 1 && (<Polygon positions={polygonPoints} pathOptions={{ color: '#10b981', weight: 2, fillOpacity: 0.2 }} />)}
          {liveLocation && (<Marker position={liveLocation} />)}
        </MapContainer>
      </div>
      {area && (
        <div className="mt-2 text-xs text-emerald-900/80">
          <span className="font-semibold">Area:</span> {area.m2.toLocaleString()} m² ({(area.m2 / 4046.86).toFixed(2)} acres)
          {area.widthM && area.heightM ? ` · ${area.widthM.toLocaleString()} m × ${area.heightM.toLocaleString()} m` : ''}
        </div>
      )}
    </div>
  )
}
