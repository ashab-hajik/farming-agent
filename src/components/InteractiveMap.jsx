import { useEffect, useMemo, useState } from 'react'
import useStore from '../store.js'
import { t } from '../i18n.js'
import { getLabelColor } from '../utils/colors.js'
import { calculateEconomicForLayout } from '../utils/economics.js'

export default function InteractiveMap() {
  const { layout, setLayout, recommendations, inputs, setEconomic, economic } = useStore()
  const cols = layout.grid[0]?.length || 20
  const rows = layout.grid.length || 20
  const treeOptions = recommendations.trees?.length ? recommendations.trees : ['Neem','Tamarind','Mango']
  const cropOptions = recommendations.crops?.length ? recommendations.crops : ['Millet','Pulses','Turmeric']
  const [type, setType] = useState('crop')
  const [item, setItem] = useState(cropOptions[0])
  const [dragging, setDragging] = useState(false)
  const [hoverCell, setHoverCell] = useState(null)
  const [strokeCells, setStrokeCells] = useState([])

  const legend = useMemo(()=> layout.legend || { crop: '#43a047', tree: '#2e7d32' }, [layout])

  const grid = useMemo(()=>{
    if (rows && cols && layout.grid.length) return layout.grid
    return Array.from({ length: rows }, ()=>
      Array.from({ length: cols }, ()=> {
        const label = cropOptions[0] || 'Crop'
        return { type: 'crop', label, color: getLabelColor(label, 'crop') }
      })
    )
  }, [rows, cols, layout, cropOptions])

  const suggestions = useMemo(()=>{
    const tips = []
    const flat = grid.flat()
    const totalCells = Math.max(flat.length, 1)
    const areaAcres = inputs.area || 1
    const treeCells = flat.filter(cell=>cell.type==='tree')
    const cropCells = flat.filter(cell=>cell.type!=='tree')
    const treeShare = treeCells.length / totalCells
    const cropShare = cropCells.length / totalCells
    const cropCounts = {}
    cropCells.forEach(cell=>{ if (!cell.label) return; cropCounts[cell.label] = (cropCounts[cell.label] || 0) + 1 })
    const topCrop = Object.entries(cropCounts).sort((a,b)=>b[1]-a[1])[0]
    const roi = economic?.roi ?? 0

    if (areaAcres < 2){
      tips.push('Small plots benefit from high-value quick harvests like Banana, Papaya, or leafy greens on at least 40% of the grid.')
    } else if (areaAcres > 5){
      tips.push('Dedicate 15–20% of the outer grid to long-term timber trees (Teak, Mahogany) for future lump-sum income while keeping the interior for cash crops.')
    }

    if (treeShare < 0.15){
      tips.push('Increase tree cover along boundaries with nitrogen fixers (Subabul, Drumstick) to boost soil fertility and microclimate resilience.')
    }
    if (cropShare > 0.7 && topCrop && topCrop[1] / totalCells > 0.5){
      tips.push(`Diversify crops—${topCrop[0]} occupies over half the field. Add legumes or spices to reduce risk and improve prices.`)
    }

    if (roi < 30){
      tips.push('ROI is moderate; convert a few low-yield cells to premium crops (Turmeric, Okra) or intensive vegetables with drip irrigation.')
    } else if (roi > 80){
      tips.push('Strong ROI—set aside 10% of cells for cover crops (Sweet Potato, Green Gram) to maintain soil without sacrificing profit.')
    }

    if (!tips.length){
      tips.push('Current mix is balanced. Keep rotating legumes after harvest to sustain soil health and profit margins.')
    }

    return tips
  }, [grid, inputs, economic])

  function applyCell(r,c){
    const label = item || (type === 'crop' ? cropOptions[0] : treeOptions[0]) || ''
    const val = { type, label, color: getLabelColor(label, type) }
    const next = grid.map((row,i)=> row.map((cell,j)=> (i===r && j===c) ? val : cell))
    const updatedLayout = { grid: next, legend }
    setLayout(updatedLayout)
    const economics = calculateEconomicForLayout(updatedLayout, inputs)
    setEconomic(economics)
  }

  function startDrag(r,c){
    setDragging(true)
    applyCell(r,c)
    const key = `${r}-${c}`
    setStrokeCells([key])
    setHoverCell([r,c])
  }

  function enterCell(r,c){
    if (!dragging) return
    applyCell(r,c)
    const key = `${r}-${c}`
    setStrokeCells(prev=> prev.includes(key) ? prev : [...prev, key])
    setHoverCell([r,c])
  }

  function stopDrag(){
    setDragging(false)
    setStrokeCells([])
    setHoverCell(null)
  }

  useEffect(()=>{
    window.addEventListener('mouseup', stopDrag)
    window.addEventListener('touchend', stopDrag)
    return ()=>{
      window.removeEventListener('mouseup', stopDrag)
      window.removeEventListener('touchend', stopDrag)
    }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white/85 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white/90 to-amber-50/80"></div>
      <div className="absolute -top-12 -right-10 h-28 w-28 rounded-full bg-emerald-200/40 blur-3xl"></div>
      <div className="absolute -bottom-16 -left-12 h-32 w-32 rounded-full bg-amber-200/35 blur-3xl"></div>
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow">🧭</span>
            {t('map')}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <select value={type} onChange={(e)=>{ const v=e.target.value; setType(v); setItem((v==='crop'? cropOptions[0]:treeOptions[0]) || ''); }} className="border rounded px-2 py-1">
              <option value="crop">{t('crops')}</option>
              <option value="tree">{t('trees')}</option>
            </select>
            <select value={item} onChange={(e)=>setItem(e.target.value)} className="border rounded px-2 py-1 min-w-28">
              {(type==='crop'? cropOptions: treeOptions).map((opt)=> (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <button onClick={()=>alert(t('plantingConfirmed'))} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded shadow">✔</button>
          </div>
        </div>
        <p className="text-emerald-900/80 text-sm mb-3">{t('mapInstructions')}</p>
        <div className="overflow-auto">
          <div className="inline-grid rounded-lg p-2 bg-gradient-to-br from-emerald-50 to-amber-50 border border-emerald-100" style={{gridTemplateColumns: `repeat(${cols}, 26px)`}}>
            {grid.map((row, r)=> row.map((cell, c)=> {
              const key = `${r}-${c}`
              const isActive = strokeCells.includes(key) || (hoverCell && hoverCell[0]===r && hoverCell[1]===c)
              return (
              <button key={key}
                    onMouseDown={(e)=>{ e.preventDefault(); startDrag(r,c) }}
                    onMouseEnter={()=>{ setHoverCell([r,c]); enterCell(r,c) }}
                    onMouseLeave={()=>{ if (!dragging) setHoverCell(null) }}
                    onTouchStart={(e)=>{ e.preventDefault(); startDrag(r,c) }}
                    onTouchMove={(e)=>{
                      const touch = e.touches[0]
                      if (!touch) return
                      const target = document.elementFromPoint(touch.clientX, touch.clientY)
                      if (target?.dataset?.cell){
                        const [row,col] = target.dataset.cell.split('-').map(Number)
                        enterCell(row,col)
                        setHoverCell([row,col])
                      }
                    }}
                    data-cell={`${r}-${c}`}
                    className={`w-6 h-6 border border-white/40 rounded-sm transition transform ${isActive ? 'ring-2 ring-amber-400 scale-110' : 'hover:scale-110'} active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400`}
                    style={{backgroundColor: cell.color || getLabelColor(cell.label, cell.type), opacity: 0.95}}
                    title={`${cell.type}: ${cell.label}`}
                    aria-label={`${t('assignSelection')}: ${r},${c}`}></button>
          )}))}
          </div>
        </div>
        {suggestions.length > 0 && (
          <div className="mt-4 bg-white/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900/90 space-y-2 shadow-sm">
            <div className="font-semibold text-emerald-900">Income & land care tips</div>
            <ul className="list-disc pl-4 space-y-1">
              {suggestions.map((tip, idx)=>(
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
