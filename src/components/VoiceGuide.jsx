import { useEffect, useRef, useState } from 'react'
import { getLang } from '../i18n.js'

export default function VoiceGuide(){
  const [enabled, setEnabled] = useState(false)
  const [voicesReady, setVoicesReady] = useState(false)
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null)
  const voicesRef = useRef([])

  function loadVoices(){
    try {
      const v = synthRef.current?.getVoices() || []
      voicesRef.current = v
      if (v.length) setVoicesReady(true)
    } catch {}
  }

  function findVoice(code){
    const voices = voicesRef.current || []
    if (!voices.length) return null
    const lc = (code || '').toLowerCase()
    // exact lang match
    let v = voices.find(x => (x.lang||'').toLowerCase() === lc)
    if (v) return v
    // startsWith primary
    const primary = lc.split('-')[0]
    v = voices.find(x => (x.lang||'').toLowerCase().startsWith(primary))
    if (v) return v
    v = voices.find(x => (x.lang||'').toLowerCase().includes(primary))
    if (v) return v
    // name heuristics for Kannada/Hindi
    if (primary === 'kn'){
      v = voices.find(x => /kannada|kn-|kn_/i.test(`${x.lang} ${x.name}`))
      if (v) return v
    }
    if (primary === 'hi'){
      v = voices.find(x => /hindi|hi-|hi_/i.test(`${x.lang} ${x.name}`))
      if (v) return v
    }
    // prefer Indian region voices
    v = voices.find(x => /-in$/i.test(x.lang) || /India|Indian|IN/i.test(x.name))
    if (v) return v
    return voices[0] || null
  }

  useEffect(()=>{
    const synth = synthRef.current
    if (!synth) return
    loadVoices()
    const handler = () => loadVoices()
    try { synth.onvoiceschanged = handler } catch {}
    return ()=> { try { synth.onvoiceschanged = null } catch {} }
  }, [])

  useEffect(()=>{
    const synth = synthRef.current
    if (!synth) return
    if (!enabled){
      try { synth.cancel() } catch {}
      return
    }
    if (!voicesReady) {
      // will re-run when voicesReady -> setEnabled can be toggled again to speak
      return
    }

    const lang = getLang() // 'en'|'hi'|'kn'
    const messages = {
      en: 'Welcome to SasyaYojana. Fill land details and tap Generate Plan.',
      hi: 'सस्यायोजना में आपका स्वागत है। भूमि विवरण भरें और योजना बनाने के लिए जनरेट प्लान दबाएँ।',
      kn: 'ಸಸ್ಯಯೋಜನಾಕ್ಕೆ ಸುಸ್ವಾಗತ. ಭೂ ವಿವರಗಳನ್ನು ತುಂಬಿ ಮತ್ತು ಯೋಜನೆ ರಚಿಸಲು Generate Plan ಒತ್ತಿರಿ.'
    }
    const text = messages[lang] || messages.en
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang === 'hi' ? 'hi-IN' : lang === 'kn' ? 'kn-IN' : 'en-US'
    const v = findVoice(utter.lang)
    if (v) utter.voice = v

    utter.onend = () => {
      // speaking finished; keep enabled state as-is
    }

    try {
      synth.cancel()
      synth.speak(utter)
    } catch {}
  }, [enabled, voicesReady])

  return (
    <button onClick={()=>setEnabled(v=>!v)} aria-pressed={enabled} title="Voice" className={`px-3 py-1 rounded border ${enabled? 'bg-emerald-600 text-white border-emerald-600':'bg-white text-emerald-700 border-emerald-300'}`}>
      🎙
    </button>
  )
}