import { useEffect, useRef, useState } from 'react'
import { t, getLang } from '../i18n.js'

export default function GoogleAssistant(){
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null)
  const recRef = useRef(null)

  useEffect(()=>{
    const saved = localStorage.getItem('GEMINI_API_KEY')
    if (saved) setApiKey(saved)
  }, [])

  function saveKey() {
    localStorage.setItem('GEMINI_API_KEY', apiKey || '')
  }

  function speak(text){
    if (!synthRef.current) return
    const utter = new SpeechSynthesisUtterance(text)
    // Basic attempt to set language voice hint
    const lang = getLang()
    if (lang === 'hi') utter.lang = 'hi-IN'
    if (lang === 'kn') utter.lang = 'kn-IN'
    synthRef.current.cancel()
    synthRef.current.speak(utter)
  }

  async function ask(){
    setLoading(true)
    setA('')
    try{
      let answer = ''
      if (apiKey) {
        const payload = {
          contents: [{ parts: [{ text: q }]}]
        }
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${encodeURIComponent(apiKey)}`,{
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      } else {
        answer = 'Enter your Google API key to get AI answers. Tip: Provide land area, soil, rainfall, and preferred crops to receive specific guidance.'
      }
      setA(answer)
      speak(answer)
    } catch(err){
      setA('Unable to get answer right now. Please try again later.')
    } finally{
      setLoading(false)
    }
  }

  function startVoice(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Speech recognition not supported on this browser.'); return }
    const rec = new SR()
    rec.lang = getLang()==='hi' ? 'hi-IN' : getLang()==='kn' ? 'kn-IN' : 'en-US'
    rec.interimResults = false
    rec.onresult = (e)=>{
      const text = e.results[0][0].transcript
      setQ(text)
    }
    rec.onerror = ()=>{}
    rec.onend = ()=>{ recRef.current = null }
    recRef.current = rec
    rec.start()
  }

  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} title="Assistant" className="px-3 py-1 rounded border bg-white text-emerald-700 border-emerald-300">💬</button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white/95 backdrop-blur rounded-xl border border-emerald-200 shadow-lg p-3 z-20">
          <div className="text-sm text-emerald-800 font-semibold mb-2">Farmer Assistant</div>
          <div className="flex gap-2 mb-2">
            <input className="flex-1 border rounded px-2 py-1" placeholder="Ask your question..." value={q} onChange={(e)=>setQ(e.target.value)} />
            <button onClick={startVoice} title="Voice" className="px-2 py-1 rounded bg-emerald-600 text-white">🎤</button>
            <button onClick={ask} disabled={loading || !q} className="px-3 py-1 rounded bg-amber-500 text-white disabled:opacity-50">Ask</button>
          </div>
          <div className="text-xs text-emerald-900/80 mb-2">Optional: Paste your Google API key to enable AI answers.</div>
          <div className="flex gap-2 mb-3">
            <input className="flex-1 border rounded px-2 py-1" placeholder="Google API Key" value={apiKey} onChange={(e)=>setApiKey(e.target.value)} />
            <button onClick={saveKey} className="px-2 py-1 rounded border">Save</button>
          </div>
          <div className="max-h-40 overflow-auto text-sm bg-emerald-50 border border-emerald-200 rounded p-2 whitespace-pre-wrap">{loading ? 'Thinking…' : (a || 'Ask about crops, spacing, rainfall, or income.')}</div>
        </div>
      )}
    </div>
  )
}
