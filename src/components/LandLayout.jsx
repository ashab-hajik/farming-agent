import useStore from '../store.js'
import { t } from '../i18n.js'
import { getLabelColor } from '../utils/colors.js'

export default function LandLayout() {
  const { layout } = useStore()
  const { grid=[], legend={} } = layout
  const rows = grid.length
  const cols = rows ? grid[0].length : 0
  const legendItems = (()=>{
    const entries = new Map()
    grid.flat().forEach(cell => {
      if (!cell?.label) return
      const key = `${cell.type}-${cell.label}`
      if (!entries.has(key)) entries.set(key, { label: cell.label, type: cell.type, color: cell.color || getLabelColor(cell.label, cell.type) })
    })
    return Array.from(entries.values())
  })()
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white/85 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white/90 to-amber-50/80"></div>
      <div className="absolute -top-12 -right-10 h-28 w-28 rounded-full bg-emerald-200/40 blur-3xl"></div>
      <div className="absolute -bottom-14 -left-12 h-32 w-32 rounded-full bg-amber-200/35 blur-3xl"></div>
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow">🗺</span>
            {t('layout')}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {legendItems.length ? legendItems.map(item => (
              <span key={`${item.type}-${item.label}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 text-emerald-800 border border-emerald-200 shadow-sm">
                <span className="inline-block w-3 h-3 rounded-sm" style={{backgroundColor: item.color}}></span> {item.label}
              </span>
            )) : (
              <span className="text-emerald-700">{t('crops')}</span>
            )}
          </div>
        </div>
        <p className="text-emerald-900/80 text-sm mb-3">{t('layoutInstructions')}</p>
        {rows>0 ? (
          <div className="overflow-x-auto">
            <div className="inline-grid rounded-lg p-2 bg-gradient-to-br from-emerald-50 to-amber-50 border border-emerald-100" style={{gridTemplateColumns: `repeat(${cols}, 18px)`}}>
              {grid.flat().map((cell, idx)=> (
                <div key={idx}
                   className="w-[18px] h-[18px] border border-white/40 rounded-sm shadow-[inset_0_0_3px_rgba(0,0,0,.15)]"
                   style={{backgroundColor: cell.color || getLabelColor(cell.label, cell.type), opacity: 0.95}}
                   title={cell.label}></div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-emerald-900/80 text-sm">—</p>
        )}
      </div>
    </div>
  )
}
