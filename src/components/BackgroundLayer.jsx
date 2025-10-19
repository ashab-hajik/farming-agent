export default function BackgroundLayer(){
  const img = 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1920&auto=format&fit=crop'
  return (
    <div aria-hidden className="fixed inset-0 -z-10">
      <div className="absolute inset-0" style={{
        backgroundImage: `url(${img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'saturate(1.1) brightness(1)'
      }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-emerald-50/70 to-amber-50/70"></div>
    </div>
  )
}
