import { useEffect, useState } from 'react'
import LanguageToggle from './components/LanguageToggle.jsx'
import InputForm from './components/InputForm.jsx'
import Dashboard from './components/Dashboard.jsx'
import LandLayout from './components/LandLayout.jsx'
import InteractiveMap from './components/InteractiveMap.jsx'
import EconomicAssessment from './components/EconomicAssessment.jsx'
import VoiceGuide from './components/VoiceGuide.jsx'
import ChatAssistant from './components/ChatAssistant.jsx'
import SatelliteMap from './components/SatelliteMap.jsx'
import BackgroundLayer from './components/BackgroundLayer.jsx'
import BackgroundQuotes from './components/BackgroundQuotes.jsx'
import { t, setLang } from './i18n.js'
import useStore from './store.js'

const supportedLangs = new Set(['en','hi','kn'])

export default function App() {
  const { recommendations, layout, economic, setRecommendations, setLayout, setEconomic } = useStore()
  const [lang, setLangState] = useState(()=>{
    if (typeof window !== 'undefined'){
      const saved = window.localStorage?.getItem('appLang')
      if (saved && supportedLangs.has(saved)) return saved
      const browser = window.navigator?.language?.slice(0,2)
      if (browser && supportedLangs.has(browser)) return browser
    }
    return 'en'
  })

  useEffect(() => {
    setLang(lang)
    if (typeof document !== 'undefined'){
      document.documentElement.lang = lang
    }
    if (typeof window !== 'undefined'){
      window.localStorage?.setItem('appLang', lang)
    }
  }, [lang])

  return (
    <div className="relative">
      <BackgroundLayer />
      <div className="absolute inset-x-0 top-0 h-32 pointer-events-none overflow-hidden">
        <div className="absolute left-0 top-6 h-16 w-40 bg-white/70 rounded-full blur animate-cloud"></div>
        <div className="absolute left-1/3 top-3 h-12 w-32 bg-white/60 rounded-full blur animate-cloud" style={{animationDelay: '5s'}}></div>
        <div className="absolute left-2/3 top-8 h-20 w-52 bg-white/60 rounded-full blur animate-cloud" style={{animationDelay: '10s'}}></div>
      </div>

      <header className="sticky top-0 z-20 backdrop-blur bg-gradient-to-r from-emerald-600/90 via-emerald-500/90 to-amber-400/80 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-3 justify-between text-white">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 border border-white/70 shadow-lg transform transition hover:rotate-3">
              <span className="text-2xl">🌱</span>
            </span>
            SasyaYojana
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-white/30 opacity-0 group-hover:opacity-100 blur transition"></div>
              <div className="relative rounded-full bg-white/20 px-3 py-1 border border-white/40 shadow-md transition transform group-hover:-translate-y-0.5 group-hover:scale-[1.03]">
                <VoiceGuide />
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-white/30 opacity-0 group-hover:opacity-100 blur transition"></div>
              <div className="relative rounded-full bg-white/20 px-3 py-1 border border-white/40 shadow-md transition transform group-hover:-translate-y-0.5 group-hover:scale-[1.03]">
                <ChatAssistant />
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-white/30 opacity-0 group-hover:opacity-100 blur transition"></div>
              <div className="relative rounded-full bg-white/20 px-3 py-1 border border-white/40 shadow-md transition transform group-hover:-translate-y-0.5 group-hover:scale-[1.03]">
                <LanguageToggle value={lang} onChange={setLangState} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main key={lang} className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        <section>
          <InputForm lang={lang} onUpdate={({ recommendations, layout, economic }) => {
            setRecommendations(recommendations)
            setLayout(layout)
            setEconomic(economic)
          }} />
        </section>
        <section>
          <div className="grid gap-4 lg:grid-cols-2 items-start">
            <div className="lg:col-span-2">
              <Dashboard lang={lang} />
            </div>
            <div className="lg:col-span-2">
              <LandLayout lang={lang} />
            </div>
            <div className="lg:col-span-2">
              <SatelliteMap lang={lang} />
            </div>
            <div className="lg:col-span-2">
              <InteractiveMap lang={lang} />
            </div>
            <div className="lg:col-span-2">
              <EconomicAssessment lang={lang} />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 max-w-6xl mx-auto px-4 pb-8 text-center text-sm text-emerald-900/80">
        {t('footer')}
      </footer>
      <BackgroundQuotes lang={lang} />
    </div>
  )
}
