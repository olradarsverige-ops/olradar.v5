{/* Hero artwork – ölglas-bilden med snygg overlay */}
<div
  className="mt-6 rounded-2xl ring-1 ring-white/10 overflow-hidden relative
             min-h-[200px] md:min-h-[280px] lg:min-h-[320px]"
  aria-hidden="true"
>
  {/* Bakgrundsfoto */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: "url('/images/beer-glasses-hero.jpg?v=1')",
      backgroundSize: "cover",
      backgroundPosition: "center 65%",
    }}
  />

  {/* Läslighets-overlay */}
  <div
    className="absolute inset-0"
    style={{
      background:
        "linear-gradient(90deg, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.06) 85%, rgba(0,0,0,0) 100%)",
    }}
  />
</div>
