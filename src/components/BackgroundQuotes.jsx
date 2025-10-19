import { useEffect, useState } from 'react'

export default function BackgroundQuotes({ lang='en' }){
  const list = {
    en: [
      'The farmer is the backbone of the nation.',
      'Sow with care, harvest with joy.',
      'Healthy soil, healthy life.'
    ],
    hi: [
      'किसान देश की रीढ़ है।',
      'देखभाल से बोएं, खुशी से काटें।',
      'स्वस्थ मिट्टी, स्वस्थ जीवन।'
    ],
    kn: [
      'ರೈತನೇ ದೇಶದ ಬೆನ್ನುಹುರಿ.',
      'ಎಚ್ಚರಿಕೆಯಿಂದ ಬೀಜ ಬಿತ್ತಿರಿ, ಸಂತೋಷದಿಂದ ಕೊಯ್ಲು ಮಾಡಿ.',
      'ಆರೋಗ್ಯಕರ ಮಣ್ಣು, ಆರೋಗ್ಯಕರ ಜೀವನ.'
    ]
  }
  const [idx, setIdx] = useState(0)

  useEffect(()=>{
    setIdx(0)
    const id = setInterval(()=> setIdx(i=> (i+1)%3), 6000)
    return ()=> clearInterval(id)
  }, [lang])

  const quote = (list[lang] || list.en)[idx]

  return (
    <div aria-hidden className="fixed inset-x-0 bottom-6 z-0 flex justify-center px-4">
      <div className="max-w-3xl w-full text-center text-emerald-900/80 backdrop-blur-sm bg-white/50 border border-emerald-200 rounded-xl px-4 py-2 shadow">
        <div className="text-sm">“{quote}”</div>
      </div>
    </div>
  )
}
