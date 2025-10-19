import { useRef, useState } from 'react'
import { t, getLang } from '../i18n.js'

export default function ChatAssistant(){
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null)
  const recRef = useRef(null)
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

  function pickIndianVoice(lang){
    const synth = synthRef.current
    if (!synth) return null
    const voices = synth.getVoices() || []
    const langPref = lang === 'hi' ? 'hi-IN' : lang === 'kn' ? 'kn-IN' : 'en-IN'
    return (
      voices.find(v=> v.lang === langPref) ||
      voices.find(v=> (v.lang||'').includes('IN')) ||
      voices.find(v=> /India|Indian/i.test(v.name)) ||
      voices.find(v=> (v.lang||'').startsWith('en-')) ||
      voices[0] || null
    )
  }

  function speak(text){
    if (!synthRef.current) return
    const utter = new SpeechSynthesisUtterance(text)
    const lang = getLang()
    if (lang === 'hi') utter.lang = 'hi-IN'
    if (lang === 'kn') utter.lang = 'kn-IN'
    const voice = pickIndianVoice(lang)
    if (voice) utter.voice = voice
    synthRef.current.cancel()
    synthRef.current.speak(utter)
  }

  async function ask(){   
    setLoading(true)
    setA('')
    try{
      let answer = ''
      const lang = getLang() // current app language ('en'|'hi'|'kn')
      const languageInstruction = lang === 'hi' ? 'Please reply in Hindi. Use simple, farmer-friendly language.' :
                                   lang === 'kn' ? 'Please reply in Kannada. Use simple, farmer-friendly language.' :
                                   'Please reply in English. Use simple, farmer-friendly language.'

      if (apiKey) {
        const res = await fetch('https://api.openai.com/v1/chat/completions',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a helpful farming advisor for sustainable multi-cropping and agroforestry. Use simple words.' },
              { role: 'system', content: languageInstruction },
              { role: 'user', content: q }
            ]
          })
        })
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        answer = data?.choices?.[0]?.message?.content || ''
      } else {
        // localized fallback when API key is not provided
        answer = lang === 'hi'
          ? 'OpenAI API कुंजी दर्ज करें ताकि मैं उत्तर दे सकूँ। सुझाव: फसलों, स्पेसिंग, वर्षा, या इंटरक्रॉपिंग के बारे में पूछें।'
          : lang === 'kn'
          ? 'OpenAI API ಕೀ ಅನ್ನು ನಮೂದಿಸಿ ताकि ನಾನು ಉತ್ತರ ನೀಡಬಲ್ಲೆ. ಸೂಚನೆ: ಬೆಳೆಗೆ, ದೂರ, ಮಳೆಗೆ ಅಥವಾ ಮಿಶ್ರಬೆಳೆ ಕುರಿತು ಕೇಳಿ.'
          : 'Enter your OpenAI API key to get AI answers. Tip: Ask about crops, spacing, rainfall timing, or intercropping.'
      }
      setA(answer)
      speak(answer)
    } catch(err){
      const lang = getLang()
      setA(lang === 'hi' ? 'अभी उत्तर प्राप्त करने में समस्या है। कृपया बाद में प्रयास करें।' : lang === 'kn' ? 'ಈಗ ಉತ್ತರ ಪಡೆಯಲು ತೊಂದರೆ ಇದೆ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.' : 'Unable to get answer right now. Please try again later.')
    } finally{
      setLoading(false)
    }
  }

  function startVoice(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Speech recognition not supported on this browser.'); return }
    if (window.isSecureContext === false) { alert('Voice needs a secure context (https).'); }
    const rec = new SR()
    rec.lang = getLang()==='hi' ? 'hi-IN' : getLang()==='kn' ? 'kn-IN' : 'en-US'
    rec.interimResults = true
    try { rec.continuous = true } catch {}
    rec.onresult = (e)=>{
      const res = e.results
      if (!res || !res.length) return
      const idx = res.length - 1
      const text = res[idx][0].transcript
      setQ(text)
    }
    rec.onerror = ()=>{ setListening(false) }
    rec.onend = ()=>{ recRef.current = null; setListening(false) }
    recRef.current = rec
    setListening(true)
    rec.start()
  }

  function openWhatsApp(){
    const num = '+18334363285'
    const text = encodeURIComponent(q || 'Hello, I need help with agroforestry planning.')
    window.open(`https://wa.me/${num.replace('+','')}?text=${text}`, '_blank')
  }

  function stopAllAudio(){
    try { synthRef.current?.cancel() } catch {}
    try { recRef.current?.stop?.() } catch {}
    setListening(false)
  }

  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} title={t('assistantName')} className="px-3 py-1 rounded border bg-white text-emerald-700 border-emerald-300">🤖</button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur rounded-xl border border-emerald-200 shadow-lg p-3 z-20 text-emerald-900">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-emerald-800 font-semibold">{t('assistantName')}</div>
            <button onClick={stopAllAudio} title={t('stopSpeech')} className="text-xs text-emerald-700 hover:text-emerald-900">Stop audio</button>
          </div>

          {/* input + controls */}
          <div className="flex gap-2 mb-3 items-center">
            <input
              className="flex-1 border rounded-lg px-3 py-2 bg-white text-emerald-900 placeholder:text-emerald-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Ask your question..."
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              aria-label="Ask your question"
            />

            {/* Mic button */}
            <button
              onClick={() => { if (!listening) { startVoice(); } else { try { recRef.current?.stop?.(); setListening(false) } catch {} } }}
              title={listening ? 'Stop listening' : 'Start voice input'}
              className={`flex items-center justify-center h-10 w-10 rounded-md text-white focus:outline-none ${listening ? 'bg-red-600 ring-2 ring-red-300' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              aria-pressed={listening}
            >
              <span className="text-lg">{listening ? '⏺' : '🎤'}</span>
            </button>

            {/* Ask button */}
            <button
              onClick={ask}
              disabled={loading || !q}
              className="h-10 px-3 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              title="Ask"
            >
              {loading ? 'Thinking…' : 'Ask'}
            </button>

            {/* Stop Voice prominent */}
            <button
              onClick={stopAllAudio}
              className="h-10 px-3 rounded-md border border-rose-500 text-rose-600 bg-rose-50 hover:bg-rose-100"
              title={t('stopSpeech')}
            >
              Stop
            </button>
          </div>

          {/* extra actions */}
          <div className="flex gap-2 mb-3">
            <button onClick={openWhatsApp} className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-emerald-200 bg-[#25D366] text-white shadow-sm text-xs">
              <svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M19.11 17.29c-.29-.14-1.7-.83-1.96-.92-.26-.1-.45-.14-.64.14-.19.29-.74.92-.91 1.12-.17.19-.34.22-.63.07-.29-.14-1.21-.45-2.3-1.44-.85-.76-1.43-1.7-1.6-1.98-.17-.29-.02-.45.12-.59.12-.12.29-.31.43-.46.14-.14.19-.24.29-.41.10-.19.05-.34-.02-.48-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.49-.64-.49-.17 0-.34-.02-.53-.02-.19 0-.48.07-.74.34-.26.29-1 1-1 2.43s1.02 2.82 1.16 3.02c.14.19 2 3.06 4.84 4.29.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.25.17-1.36-.07-.12-.26-.19-.55-.34z"/><path d="M26.84 5.16C24.14 2.45 20.68 1 17 1 9.83 1 4 6.83 4 14c0 2.45.67 4.83 1.95 6.92L4 27.5l6.72-1.77C12.71 26.57 14.83 27 17 27c7.17 0 13-5.83 13-13 0-3.68-1.45-7.14-3.16-8.84zM17 24.91c-2.04 0-4.03-.55-5.77-1.59l-.41-.24-3.99 1.05 1.06-3.89-.26-.4C6.56 18.01 6.09 16.04 6.09 14c0-6.03 4.88-10.91 10.91-10.91 2.9 0 5.63 1.13 7.68 3.18 2.05 2.05 3.18 4.78 3.18 7.68 0 6.03-4.88 10.91-10.91 10.91z"/></svg>
              <span className="text-xs">WhatsApp</span>
            </button>
          </div>

          {/* response area */}
          <div className="max-h-44 overflow-auto text-sm bg-emerald-50 border border-emerald-200 rounded p-3 whitespace-pre-wrap text-emerald-900">
            {loading ? <span>Thinking…</span> : (a || <span className="text-emerald-700/80">Ask about crops, spacing, rainfall, or income.</span>)}
          </div>
        </div>
      )}
    </div>
  )
}
