import useStore from '../store.js'
import { t } from '../i18n.js'

export default function EconomicAssessment(){
  const { economic } = useStore()
  const { cost=0, yield: y=0, incomeYearly=[] , roi=0} = economic

  const chartValues = incomeYearly.length ? incomeYearly : [0, 0, 0, 0, 0]
  const maxValue = Math.max(...chartValues, cost, y, 1)
  const minValue = Math.min(...chartValues, 0)
  const range = Math.max(maxValue - minValue, 1)
  const padding = 12
  const points = chartValues.map((val, index)=>{
    const x = (index/(chartValues.length-1 || 1)) * 100
    const yPoint = 100 - (((val - minValue) / range) * (100 - padding*2) + padding)
    return `${x},${yPoint}`
  }).join(' ')

  const areaPath = `M0,100 L${points.replace(/ /g, ' L')} L100,100 Z`

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white/85 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white/90 to-amber-50/80"></div>
      <div className="absolute -top-14 -right-12 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl"></div>
      <div className="absolute -bottom-16 -left-14 h-32 w-32 rounded-full bg-amber-200/35 blur-3xl"></div>
      <div className="relative p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow">📈</span>
            {t('economics')}
          </h2>
          <div className="text-xs text-emerald-900/70">{t('fiveYearOutlook')}</div>
        </div>
        <div className="grid sm:grid-cols-4 gap-3 text-sm mb-4">
          <div className="rounded-xl border border-emerald-200/60 bg-white/80 shadow-sm p-3">
            <div className="text-emerald-600 text-xs uppercase tracking-wide">{t('costLabel')}</div>
            <div className="text-xl font-bold text-emerald-900">₹{cost.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-emerald-200/60 bg-white/80 shadow-sm p-3">
            <div className="text-emerald-600 text-xs uppercase tracking-wide">{t('yieldLabel')}</div>
            <div className="text-xl font-bold text-emerald-900">₹{y.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-emerald-200/60 bg-white/80 shadow-sm p-3">
            <div className="text-emerald-600 text-xs uppercase tracking-wide">{t('roiLabel')}</div>
            <div className="text-xl font-bold text-emerald-900">{roi}%</div>
          </div>
          <div className="rounded-xl border border-emerald-200/60 bg-white/80 shadow-sm p-3">
            <div className="text-emerald-600 text-xs uppercase tracking-wide">{t('incomeTimeline')}</div>
            <div className="font-semibold text-emerald-900 text-xs leading-relaxed">
              {chartValues.map((v,i)=> `Y${i}: ₹${Math.round(v).toLocaleString()}`).join(' • ')}
            </div>
          </div>
        </div>
        <div className="bg-white/80 border border-emerald-200 rounded-xl p-4 shadow-inner">
          <div className="flex items-center justify-between text-xs text-emerald-900/70 mb-2">
            <span>{t('incomeTipsTitle')}</span>
            <span>{t('fiveYearOutlook')}</span>
          </div>
          <svg viewBox="0 0 100 100" className="w-full h-40">
            <defs>
              <linearGradient id="incomeGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#incomeGradient)" opacity="0.6" />
            <polyline points={points} fill="none" stroke="#047857" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
            {chartValues.map((val,i)=>{
              const x = (i/(chartValues.length-1 || 1)) * 100
              const yPoint = 100 - (((val - minValue) / range) * (100 - padding*2) + padding)
              return (
                <circle key={i} cx={x} cy={yPoint} r="1.8" fill="#047857" stroke="#ffffff" strokeWidth="0.6" />
              )
            })}
            {[0,25,50,75,100].map((yTick)=>{
              const valueLabel = Math.round(maxValue - (range * yTick/100))
              return (
                <g key={yTick}>
                  <line x1="0" x2="100" y1={yTick} y2={yTick} stroke="#04785720" strokeWidth="0.3" />
                  <text x="2" y={yTick - 1} fontSize="4" fill="#047857" opacity="0.7">₹{valueLabel.toLocaleString()}</text>
                </g>
              )
            })}
            {chartValues.map((_, i)=>{
              const x = (i/(chartValues.length-1 || 1)) * 100
              return (
                <text key={i} x={x} y="98" textAnchor="middle" fontSize="4" fill="#047857" opacity="0.7">Y{i}</text>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
