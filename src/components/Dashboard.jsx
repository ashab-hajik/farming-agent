import useStore from '../store.js'
import { t } from '../i18n.js'

export default function Dashboard() {
  const { recommendations } = useStore()
  const { trees=[], crops=[], patterns=[] } = recommendations
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white/90 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white/90 to-amber-50/80"></div>
      <div className="absolute -top-16 -right-12 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-14 h-36 w-36 rounded-full bg-amber-200/40 blur-3xl"></div>
      <div className="relative p-5">
        <h2 className="text-lg font-semibold text-emerald-900 mb-4 tracking-tight flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow">📊</span>
          {t('dashboard')}
        </h2>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <ul className="rounded-xl border border-emerald-200/60 bg-white/80 shadow-sm p-3">
            <li className="font-semibold text-emerald-900 mb-2">{t('trees')}</li>
            {trees.map((x,i)=>(<li key={i} className="py-1">🌳 {x}</li>))}
          </ul>
          <ul className="rounded-xl border border-emerald-200/60 bg-white/80 shadow-sm p-3">
            <li className="font-semibold text-emerald-900 mb-2">{t('crops')}</li>
            {crops.map((x,i)=>(<li key={i} className="py-1">🌾 {x}</li>))}
          </ul>
          <div className="rounded-xl border border-emerald-200/60 bg-white/80 shadow-sm p-3 space-y-2">
            <div>
              <div className="font-semibold text-emerald-900 mb-1">{t('patterns')}</div>
              <p className="text-emerald-900/80 leading-snug mb-2">{t('patternsExplanation')}</p>
            </div>
            <ul className="space-y-1">
              {patterns.map((x,i)=>(<li key={i} className="py-1">🧩 {x}</li>))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
