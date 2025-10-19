import { useEffect, useState } from 'react'
import { t } from '../i18n.js'
import { recommend } from '../ai/engine.js'
import useStore from '../store.js'

export default function InputForm({ onUpdate }) {
  const { inputs, setInputs } = useStore()
  const [local, setLocal] = useState(inputs)

  useEffect(()=>{
    setLocal(inputs)
  }, [inputs])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 shadow-lg">
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-200/40 blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-amber-200/40 blur-2xl"></div>
      <div className="relative flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-emerald-900 tracking-tight drop-shadow-sm">{t('planBuilderTitle')}</h2>
        <div className="flex items-center gap-2 text-emerald-800 bg-white/70 border border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold shadow-sm">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2c-.6 0-1.2.26-1.6.74-1.4 1.57-3.65 4.2-4.64 6.4C4.1 11.75 4 13.42 4 15c0 4.3 3.35 7 8 7s8-2.7 8-7c0-1.58-.1-3.25-1.76-5.86-.99-2.2-3.24-4.83-4.64-6.4C13.2 2.26 12.6 2 12 2zm0 3.13c1.01 1.16 2.96 3.6 3.76 5.32.78 1.7.82 2.94.82 4.55 0 2.6-1.74 4.05-4.58 4.05s-4.58-1.45-4.58-4.05c0-1.61.04-2.85.82-4.55.8-1.72 2.75-4.16 3.76-5.32z" />
            </svg>
          </span>
          <span>{t('planBuilderTagline')}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="col-span-2">
          <span className="block text-emerald-900 mb-1">{t('landArea')}</span>
          <input aria-label={t('landArea')} type="number" min="0.25" step="0.25" value={local.area} onChange={(e)=>setLocal({...local, area: Number(e.target.value)})} className="w-full border rounded-lg px-3 py-2"/>
        </label>
        <label>
          <span className="block text-emerald-900 mb-1">{t('soilType')}</span>
          <select aria-label={t('soilType')} value={local.soil} onChange={(e)=>setLocal({...local, soil: e.target.value})} className="w-full border rounded-lg px-3 py-2">
            <option value="loam">Loam</option>
            <option value="clay">Clay</option>
            <option value="sandy">Sandy</option>
          </select>
        </label>
        <label>
          <span className="block text-emerald-900 mb-1">{t('rainfall')}</span>
          <select aria-label={t('rainfall')} value={local.rainfall} onChange={(e)=>setLocal({...local, rainfall: e.target.value})} className="w-full border rounded-lg px-3 py-2">
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>
          <span className="block text-emerald-900 mb-1">{t('climate')}</span>
          <select aria-label={t('climate')} value={local.climate} onChange={(e)=>setLocal({...local, climate: e.target.value})} className="w-full border rounded-lg px-3 py-2">
            <option value="tropical">Tropical</option>
            <option value="arid">Arid</option>
            <option value="temperate">Temperate</option>
          </select>
        </label>
        <label className="col-span-2">
          <span className="block text-emerald-900 mb-1">{t('investment')}</span>
          <div className="flex gap-3">
            {['low','medium','high'].map((inv)=> (
              <label key={inv} className="inline-flex items-center gap-2">
                <input type="radio" name="investment" value={inv} checked={local.investment===inv} onChange={()=>setLocal({...local, investment: inv})}/>
                <span className="capitalize">{inv}</span>
              </label>
            ))}
          </div>
        </label>
      </div>
      <button onClick={()=>{
        setInputs(local)
        const out = recommend(local)
        onUpdate(out)
      }} className="relative z-10 mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 py-3 text-sm font-semibold tracking-wide text-white shadow-lg transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-emerald-400">
        {t('generate')}
      </button>
    </div>
  )
}
