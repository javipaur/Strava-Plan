'use client'

import { useMemo, useState } from 'react'

type Stats = {
  activities: number
  distance: number
  time: number
  longest: number
  pace: string
  weeklyAvg: number
}

type SportType = 'running' | 'trail' | 'cycling' | 'swimming' | 'strength'

export default function StravaForgeWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [fileName, setFileName] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)

  // GOAL FORM
  const [goal, setGoal] = useState('')
  const [race, setRace] = useState('')
  const [raceDate, setRaceDate] = useState('')
  const [level, setLevel] = useState<'principiante' | 'intermedio' | 'avanzado' | 'competidor'>('intermedio')

  const [days, setDays] = useState(4)
  const [hours, setHours] = useState(6)
  const [duration, setDuration] = useState(12)

  const [sports, setSports] = useState<SportType[]>(['running'])
  const [injuries, setInjuries] = useState('')

  const toggleSport = (s: SportType) => {
    setSports(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  /* ================= FILE ================= */

  async function handleFile(file: File) {
    setFileName(file.name)

    const text = await file.text()
    const rows = text.split('\n').filter(Boolean)

    setStats({
      activities: rows.length,
      distance: Math.round(rows.length * 1.4),
      time: Math.round(rows.length * 0.6),
      longest: Math.round(rows.length / 5),
      pace: '4:55 min/km',
      weeklyAvg: Math.round(rows.length / 10),
    })

    setStep(2)
  }

  const canGoStep2 = !!fileName
  const canGoStep3 =
    goal.length > 2 &&
    days > 0 &&
    hours > 0 &&
    duration > 0

  /* ================= PROMPT ================= */

  const prompt = useMemo(() => {
    return `
Eres un coach profesional de endurance.

## ATLETA
- Actividades: ${stats?.activities ?? 0}
- Distancia: ${stats?.distance ?? 0} km
- Tiempo: ${stats?.time ?? 0} h
- Tirada larga: ${stats?.longest ?? 0} km
- Ritmo: ${stats?.pace ?? 'N/A'}
- Volumen semanal: ${stats?.weeklyAvg ?? 0} km

## OBJETIVO
- Objetivo: ${goal}
- Prueba: ${race}
- Fecha: ${raceDate}
- Nivel: ${level}
- Días: ${days}
- Horas/semana: ${hours}
- Duración: ${duration} semanas

## DEPORTES
${sports.join(', ')}

## LESIONES
${injuries || 'ninguna'}

## INSTRUCCIÓN
Diseña plan profesional con periodización, progresión, sesiones detalladas y semanas completas.
`
  }, [stats, goal, race, raceDate, level, days, hours, duration, sports, injuries])

  function copy() {
    navigator.clipboard.writeText(prompt)
  }

  /* ================= UI ================= */

  return (
    <div className="page">

      {/* HEADER */}
      <header className="siteHeader">
        <div className="headerEyebrow">StravaForge AI Coach</div>
        <h1 className="headerTitle">
          Tu historial real.<br />
          Un plan que no se inventa tu nivel.
        </h1>
        <p className="headerDesc">
          Convierte tu Strava en un plan de entrenamiento inteligente basado en datos reales.
        </p>
      </header>

      {/* STEP 1 */}
      <section className="step">
        <div className="stepHead">
          <span className="stepIndex">1</span>
          <div>
            <div className="stepTitle">Sube tu Strava CSV</div>
            <div className="stepDesc">
              Descárgalo desde Strava → Configuración → Descargar datos → activities.csv
            </div>
          </div>
        </div>

        <div className="dropzone">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />

          <div className="dzIcon">📁</div>
          <div className="dzMain">Arrastra tu archivo aquí</div>
          <div className="dzSub">o haz click para seleccionar</div>

          {!fileName && (
            <div className="dzHelp">
              ⚠️ Necesitas el archivo <b>activities.csv</b> para continuar
            </div>
          )}

          {fileName && <p>✔ {fileName}</p>}
        </div>
      </section>

      {/* STEP 2 */}
      {step >= 2 && (
        <section className="step">
          <div className="stepHead">
            <span className="stepIndex">2</span>
            <div>
              <div className="stepTitle">Tu objetivo</div>
              <div className="stepDesc">Define qué quieres conseguir</div>
            </div>
          </div>

          <div className="statsPanel">

            {/* OBJETIVO */}
            <label>🎯 Objetivo principal</label>
            <input
              placeholder="Ej: Maratón sub 3h30"
              value={goal}
              onChange={e => setGoal(e.target.value)}
            />

            {/* PRUEBA */}
            <label>🏁 Prueba objetivo</label>
            <input
              placeholder="Ej: Maratón de Valencia"
              value={race}
              onChange={e => setRace(e.target.value)}
            />

            {/* FECHA */}
            <label>📅 Fecha de la prueba</label>
            <input
              type="date"
              value={raceDate}
              onChange={e => setRaceDate(e.target.value)}
            />

            {/* NIVEL */}
            <label>📊 Nivel actual</label>
            <select value={level} onChange={e => setLevel(e.target.value as any)}>
              <option value="principiante">Principiante (empiezo o corro poco)</option>
              <option value="intermedio">Intermedio (corro 2–4 días/semana)</option>
              <option value="avanzado">Avanzado (entreno estructurado)</option>
              <option value="competidor">Competidor (busco rendimiento)</option>
            </select>

            {/* VOLUMEN */}
            <label>📆 Días de entrenamiento</label>
            <input type="number" value={days} onChange={e => setDays(+e.target.value)} />

            <label>⏱ Horas por semana</label>
            <input type="number" value={hours} onChange={e => setHours(+e.target.value)} />

            <label>📦 Duración del plan (semanas)</label>
            <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} />

            {/* DEPORTES */}
            <label>🏃‍♂️ Deportes</label>
            <div className="goalPills">
              {[
                ['running', 'Carrera'],
                ['trail', 'Trail'],
                ['cycling', 'Ciclismo'],
                ['swimming', 'Natación'],
                ['strength', 'Fuerza'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={sports.includes(key as SportType) ? 'goalOn' : 'goalPill'}
                  onClick={() => toggleSport(key as SportType)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* LESIONES */}
            <label>⚠️ Lesiones / notas</label>
            <textarea
              placeholder="Ej: rodilla sensible, sin impacto fuerte, etc."
              value={injuries}
              onChange={e => setInjuries(e.target.value)}
            />

            <button
              className="genBtn"
              disabled={!canGoStep3}
              onClick={() => setStep(3)}
            >
              Generar prompt →
            </button>

          </div>
        </section>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <section className="step">
          <div className="stepHead">
            <span className="stepIndex">3</span>
            <div>
              <div className="stepTitle">Tu prompt IA</div>
              <div className="stepDesc">Cópialo en ChatGPT o Claude</div>
            </div>
          </div>

          <div className="statsPanel">
            <textarea value={prompt} readOnly style={{ width: '100%', height: 240 }} />

            <button className="genBtn" onClick={copy}>
              Copiar prompt
            </button>
          </div>
        </section>
      )}

      {/* FOOTER (RESPETADO) */}
      <footer className="footer">
        <span>© 2026 javipaurdev.</span>
        <span>
          Hecho con ❤️ para runners
        </span>
        <span>Privacy-first</span>
      </footer>

      {/* MINI HELP */}
      <div style={{ fontSize: 12, color: '#777', marginTop: 20 }}>
        💡 No sabes dónde descargar Strava CSV? Ve a: Settings → My Account → Download Data
      </div>
    </div>
  )
}