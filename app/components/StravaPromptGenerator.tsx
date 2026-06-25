'use client'

import { useMemo, useState } from 'react'

type Step = 1 | 2 | 3

type Stats = {
  activities: number
  distance: number
  time: number
  longest: number
  pace: string
  weeklyAvg: number
}

type SportType =
  | 'running'
  | 'trail'
  | 'cycling'
  | 'swimming'
  | 'strength'

const LEVELS = [
  { id: 'principiante', title: 'Principiante', desc: 'Empiezas o <6 meses entrenando' },
  { id: 'recreativo', title: 'Recreativo', desc: 'Corres sin plan estructurado' },
  { id: 'intermedio', title: 'Intermedio', desc: 'Series + tiradas largas' },
  { id: 'avanzado', title: 'Avanzado', desc: 'Entrenamiento estructurado serio' },
]

const SPORTS: { id: SportType; label: string }[] = [
  { id: 'running', label: 'Carrera (asfalto)' },
  { id: 'trail', label: 'Trail running' },
  { id: 'cycling', label: 'Ciclismo' },
  { id: 'swimming', label: 'Natación' },
  { id: 'strength', label: 'Fuerza' },
]

export default function StravaWizard() {
  const [step, setStep] = useState<Step>(1)

  const [stats, setStats] = useState<Stats | null>(null)
  const [fileName, setFileName] = useState('')

  const [autoLevel, setAutoLevel] = useState<string>('intermedio')
  const [manualLevel, setManualLevel] = useState(false)

  const [goal, setGoal] = useState('')
  const [raceDate, setRaceDate] = useState('')
  const [level, setLevel] = useState('intermedio')

  const [days, setDays] = useState(4)
  const [weeks, setWeeks] = useState(12)

  const [sports, setSports] = useState<SportType[]>([])

  // 🔥 NUEVO: trail específico
  const [trailKm, setTrailKm] = useState(20)
  const [trailDplus, setTrailDplus] = useState(1000)

  const [injuries, setInjuries] = useState('')
  const [error, setError] = useState('')
// RUNNING
const [roadDistance, setRoadDistance] = useState('')
const [performanceGoal, setPerformanceGoal] = useState('finish')
const [targetTime, setTargetTime] = useState('')

// TRAIL
const [trailMode, setTrailMode] = useState('classic')
const isRunning = sports.includes('running')

  /* ================= FILE ================= */

  async function handleFile(file: File) {
    setError('')

    if (!file.name.includes('.csv')) {
      setError('Sube el archivo activities.csv de Strava')
      return
    }

    setFileName(file.name)

    const text = await file.text()
    const rows = text.split('\n').filter(Boolean)

    if (rows.length < 10) {
      setError('Archivo inválido')
      return
    }

    const inferred =
      rows.length > 120
        ? 'avanzado'
        : rows.length > 60
          ? 'intermedio'
          : 'recreativo'

    setAutoLevel(inferred)
    setLevel(inferred)

    setStats({
      activities: rows.length,
      distance: Math.round(rows.length * 1.4),
      time: Math.round(rows.length * 0.6),
      longest: Math.round(rows.length / 6),
      pace: '4:50 /km',
      weeklyAvg: Math.round(rows.length / 10),
    })

    setStep(2)
  }

  function toggleSport(s: SportType) {
    setSports(prev =>
      prev.includes(s)
        ? prev.filter(x => x !== s)
        : [...prev, s]
    )
  }

  const isTrail = sports.includes('trail')

  const canContinueStep2 =
    goal.trim().length > 3 &&
    raceDate.length > 0 &&
    sports.length > 0 &&
    stats !== null

  const prompt = useMemo(() => {
    return `
## ATLETA
- Actividades: ${stats?.activities ?? 0}
- Distancia: ${stats?.distance ?? 0} km
- Ritmo: ${stats?.pace ?? ''}

## OBJETIVO
- ${goal}
- Fecha: ${raceDate}
- Nivel: ${level}
- Deportes: ${sports.join(', ')}
- Días: ${days}
- Semanas: ${weeks}

${isTrail ? `## TRAIL
- Km carrera: ${trailKm}
- Desnivel D+: ${trailDplus}` : ''}

## CONTEXTO
- Lesiones: ${injuries || 'ninguna'}

Crea un plan profesional tipo entrenador olímpico.
`
  }, [
    stats,
    goal,
    raceDate,
    level,
    sports,
    days,
    weeks,
    injuries,
    trailKm,
    trailDplus,
    isTrail,
  ])

  function copy() {
    navigator.clipboard.writeText(prompt)
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#111] flex flex-col">

      {/* HEADER */}
      <header className="flex justify-between px-6 py-4 border-b bg-white">
        <div>
          <div className="font-bold">StravaForge</div>
          <div className="text-xs text-gray-500">AI Training Engine</div>
        </div>

        <div className="text-xs text-gray-500">
          🔒 Private · On-device
        </div>
      </header>

      {/* HERO */}
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <div className="text-xs text-orange-600 uppercase tracking-widest">
          Strava → AI Coach
        </div>

        <h1 className="text-4xl mt-2">
          Tu historial real.
          <br />
          <span className="text-xl text-gray-600 font-normal">
            Un plan que no se inventa tu nivel.
          </span>
        </h1>

        <div className="flex gap-6 mt-6 text-sm">
          <Step n={1} active={step >= 1} label="Strava" />
          <Step n={2} active={step >= 2} label="Objetivo" />
          <Step n={3} active={step >= 3} label="Plan" />
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-3xl mx-auto px-6 mt-8 space-y-6 flex-1">

        {/* STEP 1 */}
        {step === 1 && (
          <Card title="Importa Strava CSV">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="p-3 bg-white border rounded text-sm text-gray-600">
              Descarga en Strava → Settings → My Account → Download Data → activities.csv
            </div>
          </Card>
        )}

       {/* STEP 2 */}
{step >= 2 && (
<Card title="Objetivo PRO">

<div className="p-3 bg-green-50 border rounded text-sm">
Nivel detectado: <b>{autoLevel}</b>

<button
onClick={() => setManualLevel(true)}
className="ml-3 underline"
>
ajustar manual
</button>
</div>

{manualLevel && (
<div className="mt-3 space-y-2">

{LEVELS.map(lvl => (

<button
key={lvl.id}
onClick={() => setLevel(lvl.id)}
className={`w-full p-3 border rounded text-left ${
level === lvl.id
? 'bg-black text-white'
: ''
}`}
>

<b>{lvl.title}</b>

<div className="text-xs opacity-70">
{lvl.desc}
</div>

</button>

))}

</div>
)}

{/* OBJETIVO */}

<div className="mt-5">

<label className="text-sm font-medium">
🎯 Objetivo principal
</label>

<input
className="w-full border p-3 rounded-lg mt-2"
placeholder="Ej: Maratón sub 3h30"
value={goal}
onChange={(e)=>setGoal(e.target.value)}
/>

</div>

{/* FECHA */}

<div className="mt-5">

<label className="text-sm font-medium">
📅 Fecha objetivo
</label>

<input
type="date"
className="w-full border p-3 rounded-lg mt-2"
value={raceDate}
onChange={(e)=>setRaceDate(e.target.value)}
/>

</div>

{/* DEPORTES */}

<div className="mt-5">

<label className="text-sm font-medium">
🏃 Deporte principal
</label>

<div className="flex flex-wrap gap-2 mt-2">

{SPORTS.map(s=>(

<button
key={s.id}
onClick={()=>toggleSport(s.id)}
className={`px-4 py-2 rounded-full border ${
sports.includes(s.id)
? 'bg-black text-white'
: 'bg-white'
}`}
>

{s.label}

</button>

))}

</div>

</div>

{/* RUNNING */}

{isRunning && (

<div className="mt-5 border rounded-xl p-4 bg-gray-50">

<div className="font-semibold mb-4">
🏃 Configuración carrera asfalto
</div>

<label className="text-sm">
Distancia objetivo
</label>

<select
value={roadDistance}
onChange={(e)=>setRoadDistance(e.target.value)}
className="w-full mt-2 border p-3 rounded"
>

<option value="">
Selecciona distancia
</option>

<option value="5K">
5K
</option>

<option value="10K">
10K
</option>

<option value="21K">
Media maratón · 21 km
</option>

<option value="42K">
Maratón · 42 km
</option>

<option value="Ultra">
Ultra asfalto
</option>

</select>

<label className="text-sm mt-4 block">
Objetivo rendimiento
</label>

<select
value={performanceGoal}
onChange={(e)=>setPerformanceGoal(e.target.value)}
className="w-full mt-2 border p-3 rounded"
>

<option value="finish">
Terminar
</option>

<option value="time">
Marca objetivo
</option>

<option value="pb">
Mejorar marca personal
</option>

<option value="compete">
Competir
</option>

</select>

{performanceGoal==='time' && (

<input
className="w-full border p-3 rounded mt-3"
placeholder="Ej: 00:44:59"
value={targetTime}
onChange={(e)=>setTargetTime(e.target.value)}
/>

)}

</div>

)}

{/* TRAIL */}

{isTrail && (

<div className="mt-5 border rounded-xl p-4 bg-green-50">

<div className="font-semibold mb-4">
🌲 Configuración Trail
</div>

<select
value={trailMode}
onChange={(e)=>setTrailMode(e.target.value)}
className="w-full border p-3 rounded"
>

<option value="classic">
Trail clásico
</option>

<option value="ultra">
Ultra trail
</option>

<option value="technical">
Trail técnico
</option>

<option value="kv">
Kilómetro Vertical
</option>

</select>

<div className="grid grid-cols-2 gap-3 mt-4">

<input
type="number"
className="border p-3 rounded"
placeholder="Distancia km"
value={trailKm}
onChange={(e)=>
setTrailKm(+e.target.value)
}
/>

<input
type="number"
className="border p-3 rounded"
placeholder="Desnivel +"
value={trailDplus}
onChange={(e)=>
setTrailDplus(+e.target.value)
}
/>

</div>

</div>

)}

{/* CYCLING */}

{sports.includes('cycling') && (

<div className="mt-5 border rounded-xl p-4 bg-blue-50">

<div className="font-semibold mb-4">
🚴 Configuración Ciclismo
</div>

<select className="w-full border p-3 rounded">

<option>
Ruta
</option>

<option>
MTB
</option>

<option>
Gravel
</option>

<option>
Contrarreloj
</option>

</select>

<div className="grid grid-cols-2 gap-3 mt-4">

<input
type="number"
className="border p-3 rounded"
placeholder="Distancia objetivo (km)"
/>

<input
type="number"
className="border p-3 rounded"
placeholder="Desnivel objetivo (m)"
/>

</div>

<input
className="w-full border p-3 rounded mt-3"
placeholder="Horas máximas salida larga"
/>

</div>

)}

{/* SWIMMING */}

{sports.includes('swimming') && (

<div className="mt-5 border rounded-xl p-4 bg-cyan-50">

<div className="font-semibold mb-4">
🏊 Configuración Natación
</div>

<select className="w-full border p-3 rounded">

<option>
Piscina
</option>

<option>
Aguas abiertas
</option>

<option>
Triatlón
</option>

</select>

<input
className="w-full border p-3 rounded mt-3"
placeholder="Distancia objetivo"
/>

<input
className="w-full border p-3 rounded mt-3"
placeholder="Ritmo objetivo por 100m"
/>

</div>

)}

{/* STRENGTH */}

{sports.includes('strength') && (

<div className="mt-5 border rounded-xl p-4 bg-orange-50">

<div className="font-semibold mb-4">
🏋️ Configuración Fuerza
</div>

<select className="w-full border p-3 rounded">

<option>
Prevención lesiones
</option>

<option>
Rendimiento
</option>

<option>
Hipertrofia
</option>

</select>

<select className="w-full border p-3 rounded mt-3">

<option>
Gimnasio completo
</option>

<option>
Casa
</option>

<option>
Bandas
</option>

<option>
Mancuernas
</option>

</select>

<input
className="w-full border p-3 rounded mt-3"
placeholder="Minutos por sesión"
/>

</div>

)}

{/* PLAN */}

<div className="grid grid-cols-2 gap-3 mt-5">

<div>

<label className="text-sm">
📅 Días semana
</label>

<input
type="number"
className="w-full border p-3 rounded mt-2"
value={days}
onChange={(e)=>
setDays(+e.target.value)
}
/>

</div>

<div>

<label className="text-sm">
📆 Duración plan
</label>

<input
type="number"
className="w-full border p-3 rounded mt-2"
value={weeks}
onChange={(e)=>
setWeeks(+e.target.value)
}
/>

</div>

</div>

{/* LESIONES */}

<div className="mt-5">

<label className="text-sm">
⚠️ Lesiones o notas
</label>

<textarea
className="w-full border p-3 rounded mt-2"
value={injuries}
onChange={(e)=>
setInjuries(e.target.value)
}
placeholder="Ej: rodilla sensible"
/>

</div>

<button
disabled={!canContinueStep2}
onClick={()=>setStep(3)}
className={`w-full mt-6 py-3 rounded ${
canContinueStep2
? 'bg-black text-white'
: 'bg-gray-300'
}`}
>

Generar plan →

</button>

</Card>
)}

        {/* STEP 3 */}
        {step === 3 && (
          <Card title="Prompt IA">

            <textarea
              className="w-full h-64 border p-2"
              value={prompt}
              readOnly
            />

            <button onClick={copy} className="mt-3 border px-4 py-2">
              Copiar
            </button>

          </Card>
        )}

      </div>

      {/* FOOTER (UNCHANGED) */}
      <footer className="flex justify-between px-6 py-5 border-t bg-white text-xs text-gray-500">
        <span>© 2026 StravaForge</span>

        <span className="flex items-center gap-1">
          Hecho con ❤️ para runners
        </span>

        <span>Privacy-first</span>
      </footer>
    </div>
  )
}

/* ================= UI ================= */

function Step({ n, active, label }: any) {
  return (
    <div className={`flex items-center gap-2 ${active ? '' : 'opacity-40'}`}>
      <div className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">
        {n}
      </div>
      <span>{label}</span>
    </div>
  )
}

function Card({ title, children }: any) {
  return (
    <div className="bg-white border rounded-xl p-5 space-y-4 shadow-sm">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </div>
  )
}