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

const LEVELS = [
  { id: 'principiante', title: 'Principiante', desc: 'Empiezas o <6 meses entrenando' },
  { id: 'recreativo', title: 'Recreativo', desc: 'Corres sin plan estructurado' },
  { id: 'intermedio', title: 'Intermedio', desc: 'Ya haces series y tiradas largas' },
  { id: 'avanzado', title: 'Avanzado', desc: 'Entrenamiento serio y estructurado' },
]

export default function StravaWizard() {
  const [step, setStep] = useState<Step>(1)

  const [stats, setStats] = useState<Stats | null>(null)
  const [fileName, setFileName] = useState('')

  const [goal, setGoal] = useState('')
  const [level, setLevel] = useState('intermedio')

  const [days, setDays] = useState(4)
  const [duration, setDuration] = useState(12)

  const [error, setError] = useState('')

  /* ================= FILE ================= */

  async function handleFile(file: File) {
    setError('')

    if (!file.name.includes('.csv')) {
      setError('Por favor sube el archivo activities.csv de Strava')
      return
    }

    setFileName(file.name)

    const text = await file.text()
    const rows = text.split('\n').filter(Boolean)

    if (rows.length < 10) {
      setError('El archivo parece inválido o vacío')
      return
    }

    setStats({
      activities: rows.length,
      distance: Math.round(rows.length * 1.4),
      time: Math.round(rows.length * 0.6),
      longest: Math.round(rows.length / 5),
      pace: '4:55 /km',
      weeklyAvg: Math.round(rows.length / 10),
    })

    setStep(2)
  }

  /* ================= VALIDATION STEP 2 ================= */

  const canContinueStep2 =
    goal.trim().length > 3 &&
    stats !== null

  /* ================= PROMPT ================= */

  const prompt = useMemo(() => {
    return `
## ATLETA
- Actividades: ${stats?.activities ?? 0}
- Distancia: ${stats?.distance ?? 0} km
- Volumen semanal: ${stats?.weeklyAvg ?? 0}

## OBJETIVO
- ${goal}
- Nivel: ${level}
- Días: ${days}
- Duración: ${duration}

Crea un plan profesional estructurado y progresivo.
`
  }, [stats, goal, level, days, duration])

  function copy() {
    navigator.clipboard.writeText(prompt)
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#111]">

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

        {/* STEPS */}
        <div className="flex gap-6 mt-6 text-sm">
          <Step n={1} active={step >= 1} label="Strava" />
          <Step n={2} active={step >= 2} label="Objetivo" />
          <Step n={3} active={step >= 3} label="Plan" />
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-3xl mx-auto px-6 mt-8 space-y-6">

        {/* STEP 1 */}
        {step === 1 && (
          <Card title="Importa tu Strava">

            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />

            {/* ERROR */}
            {error && (
              <div className="text-red-600 text-sm mt-2">
                {error}
              </div>
            )}

            {/* HELP BOX */}
            <div className="mt-4 p-3 bg-white border rounded text-sm text-gray-600">
              <b>¿Dónde descargo el CSV?</b>
              <br />
              Strava → Settings → My Account →
              <b> Download or delete your data</b> →
              solicita exportación → abre ZIP → usa <b>activities.csv</b>
            </div>

          </Card>
        )}

        {/* STEP 2 */}
        {step >= 2 && (
          <Card title="Tu objetivo">

            {/* STATS CHECK */}
            {!stats && (
              <div className="text-sm text-red-600">
                ⚠️ Necesitas subir el archivo de Strava para continuar
              </div>
            )}

            <input
              className="w-full border p-2"
              placeholder="Objetivo (ej: maratón sub 3h30)"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />

            {/* LEVEL */}
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Nivel</div>
              <div className="grid gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`p-3 border rounded text-left ${
                      level === l.id ? 'bg-black text-white' : 'bg-white'
                    }`}
                  >
                    <div className="font-semibold">{l.title}</div>
                    <div className="text-xs opacity-70">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* INPUTS */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <input
                className="border p-2"
                type="number"
                value={days}
                onChange={(e) => setDays(+e.target.value)}
                placeholder="Días/semana"
              />

              <input
                className="border p-2"
                type="number"
                value={duration}
                onChange={(e) => setDuration(+e.target.value)}
                placeholder="Semanas"
              />
            </div>

            {/* BUTTON */}
            <button
              disabled={!canContinueStep2}
              onClick={() => setStep(3)}
              className={`w-full mt-4 py-3 rounded ${
                canContinueStep2
                  ? 'bg-black text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Generar plan →
            </button>

            {!canContinueStep2 && (
              <div className="text-xs text-gray-500 mt-2">
                Completa objetivo + datos de Strava para continuar
              </div>
            )}

          </Card>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Card title="Tu prompt">

            <textarea
              className="w-full h-64 border p-3 text-sm"
              value={prompt}
              readOnly
            />

            <div className="flex gap-2 mt-3">
              <button onClick={copy} className="border px-4 py-2">
                Copiar
              </button>
            </div>

          </Card>
        )}

      </div>
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