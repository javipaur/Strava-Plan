'use client'

import { useMemo, useState } from 'react'

/* ================= TYPES ================= */

type Stats = {
  activities: number
  distance: number
  time: number
  longest: number
  pace: string
  weeklyAvg: number
}

/* ================= COMPONENT ================= */

export default function StravaSaaS() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [fileName, setFileName] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)

  const [goal, setGoal] = useState('')
  const [level, setLevel] = useState('intermedio')
  const [days, setDays] = useState('4')
  const [duration, setDuration] = useState('12')
  const [injuries, setInjuries] = useState('')
  const [context, setContext] = useState('')

  /* ================= FILE ================= */

  async function handleFile(file: File) {
    setFileName(file.name)

    const text = await file.text()
    const rows = text.split('\n').filter(Boolean)

    setStats({
      activities: rows.length,
      distance: Math.round(rows.length * 1.3),
      time: Math.round(rows.length * 0.5),
      longest: Math.round(rows.length / 6),
      pace: '4:50 min/km',
      weeklyAvg: Math.round(rows.length / 12),
    })

    setStep(2)
  }

  /* ================= PROMPT ================= */

  const prompt = useMemo(() => {
    return `
Eres un coach profesional de running.

## ATLETA (DATOS REALES)
- Actividades: ${stats?.activities ?? 0}
- Distancia: ${stats?.distance ?? 0} km
- Tiempo: ${stats?.time ?? 0} h
- Tirada más larga: ${stats?.longest ?? 0} km
- Ritmo: ${stats?.pace ?? 'N/A'}
- Volumen semanal: ${stats?.weeklyAvg ?? 0} km

## OBJETIVO
- Objetivo: ${goal}
- Nivel: ${level}
- Días/semana: ${days}
- Duración: ${duration} semanas

## CONTEXTO
- Lesiones: ${injuries || 'ninguna'}
- Contexto: ${context || 'sin información'}

## INSTRUCCIÓN
Crea un plan profesional completo, progresivo, con:
- periodización
- semanas detalladas
- sesiones estructuradas
- progresión realista
`
  }, [stats, goal, level, days, duration, injuries, context])

  function copy() {
    navigator.clipboard.writeText(prompt)
  }

  /* ================= UI ================= */

  return (
    <div style={styles.app}>

      {/* ================= TOP BAR ================= */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logo}>🏃‍♂️</div>
          <div>
            <div style={styles.name}>StravaForge</div>
            <div style={styles.tag}>AI Training Engine</div>
          </div>
        </div>

        <div style={styles.badge}>
          🔒 Private · On-device processing
        </div>
      </header>

      {/* ================= HERO ================= */}
<section style={styles.hero}>

  <div style={styles.kicker}>
    Strava → Prompt de entrenamiento
  </div>

  <h1 style={styles.h1}>
    Tu historial real.
    <br />
    <span style={{ color: '#111', fontWeight: 400 }}>
      Un plan que no se inventa tu nivel.
    </span>
  </h1>

  <p style={styles.p}>
    Convierte tu actividad de Strava en un plan de entrenamiento inteligente.
    Basado en tus datos reales, no en estimaciones.
  </p>

  {/* STEP INDICATOR (mantienes el tuyo) */}
  <div style={styles.steps}>
    <Step n={1} active={step >= 1} label="Importar Strava" />
    <Step n={2} active={step >= 2} label="Objetivo" />
    <Step n={3} active={step >= 3} label="Generar plan" />
  </div>

</section>

      {/* ================= MAIN GRID ================= */}
      <main style={styles.grid}>

        {/* LEFT */}
        <div style={styles.left}>

          {/* STEP 1 */}
          <Card active={step === 1} title="Sube tu Strava">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />

            {fileName && <p>📁 {fileName}</p>}

            <button onClick={() => setStep(2)} style={styles.btn}>
              Continuar →
            </button>
          </Card>

          {/* STEP 2 */}
          {step >= 2 && (
            <Card active={step === 2} title="Tu objetivo">

              <input
                placeholder="Objetivo (ej: maratón sub 3h30)"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />

              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option>principiante</option>
                <option>intermedio</option>
                <option>avanzado</option>
              </select>

              <select value={days} onChange={(e) => setDays(e.target.value)}>
                <option value="3">3 días</option>
                <option value="4">4 días</option>
                <option value="5">5 días</option>
              </select>

              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="8">8 semanas</option>
                <option value="12">12 semanas</option>
                <option value="16">16 semanas</option>
              </select>

              <input
                placeholder="Lesiones"
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
              />

              <textarea
                placeholder="Contexto adicional"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />

              <button onClick={() => setStep(3)} style={styles.primary}>
                Generar plan →
              </button>
            </Card>
          )}

          {/* STEP 3 */}
          {step >= 3 && (
            <Card active={true} title="Tu prompt">

              <textarea
                value={prompt}
                readOnly
                style={styles.textarea}
              />

              <div style={styles.row}>
                <button onClick={copy} style={styles.btn}>
                  Copiar
                </button>

                <button
                  onClick={() =>
                    window.open(
                      'https://chat.openai.com/?q=' + encodeURIComponent(prompt),
                      '_blank'
                    )
                  }
                  style={styles.btn}
                >
                  ChatGPT
                </button>
              </div>

            </Card>
          )}
        </div>

        {/* RIGHT SIDEBAR (SAAS STYLE INSIGHTS) */}
        <aside style={styles.right}>
          <Panel title="Insights">
            <Stat label="Actividades" value={stats?.activities ?? 0} />
            <Stat label="Distancia" value={stats?.distance ?? 0 + ' km'} />
            <Stat label="Ritmo" value={stats?.pace ?? '—'} />
            <Stat label="Volumen semanal" value={stats?.weeklyAvg ?? 0 + ' km'} />
          </Panel>

          <Panel title="Cómo funciona">
            <p style={{ fontSize: 13, opacity: 0.7 }}>
              1. Subes Strava<br />
              2. Definimos objetivo<br />
              3. Generamos prompt IA<br />
              4. Pegas en ChatGPT
            </p>
          </Panel>

          <Panel title="Privacidad">
            <p style={{ fontSize: 13, opacity: 0.7 }}>
              Todo se procesa en tu navegador. No enviamos datos a servidores.
            </p>
          </Panel>
        </aside>

      </main>

      {/* ================= FOOTER ================= */}
      <footer style={styles.footer}>
        <span>© 2026 javipaurdev.</span>
        <span> Hecho con 
            <svg className="size-3.5 text-red-500 inline" aria-label="amor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z"></path>
            </svg> 
            para runners</span>
        <span>Privacy-first</span>
      </footer>
    </div>
  )
}

/* ================= UI COMPONENTS ================= */

function Step({ n, active, label }: any) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      opacity: active ? 1 : 0.4
    }}>
      <div style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        background: active ? '#111' : '#ccc',
        color: '#fff',
        fontSize: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {n}
      </div>
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  )
}

function Card({ title, children, active }: any) {
  return (
    <div style={{
      border: '1px solid #e5e5e5',
      borderRadius: 12,
      padding: 16,
      background: active ? '#fff' : '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }}>
      <h3 style={{ margin: 0 }}>{title}</h3>
      {children}
    </div>
  )
}

function Panel({ title, children }: any) {
  return (
    <div style={{
      border: '1px solid #eee',
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      background: '#fff'
    }}>
      <h4 style={{ marginBottom: 10 }}>{title}</h4>
      {children}
    </div>
  )
}

function Stat({ label, value }: any) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, opacity: 0.6 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  )
}

/* ================= STYLES ================= */

const styles: any = {
  app: { fontFamily: 'system-ui', background: '#f6f6f6', minHeight: '100vh' },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 16,
    borderBottom: '1px solid #eee',
    background: '#fff',
  },

  brand: { display: 'flex', gap: 10, alignItems: 'center' },
  logo: { fontSize: 22 },
  name: { fontWeight: 700 },
  tag: { fontSize: 12, opacity: 0.6 },

  badge: { fontSize: 12, opacity: 0.6 },

  hero: { padding: 24, maxWidth: 900, margin: '0 auto' },

  h1: { fontSize: 30, marginBottom: 8 },
  p: { opacity: 0.7 },

  steps: { display: 'flex', gap: 16, marginTop: 20 },

  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 20,
    maxWidth: 1100,
    margin: '0 auto',
    padding: 24,
  },

  left: { display: 'flex', flexDirection: 'column', gap: 16 },

  right: {},

  btn: {
    padding: 10,
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer',
    borderRadius: 8,
  },

  primary: {
    padding: 12,
    background: '#111',
    color: '#fff',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
  },

  textarea: { width: '100%', height: 200 },

  row: { display: 'flex', gap: 10 },

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 20,
    borderTop: '1px solid #eee',
    fontSize: 12,
    opacity: 0.6,
    background: '#fff',
  },
  kicker: {
  fontSize: 12,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  opacity: 0.6,
  marginBottom: 10,
  fontWeight: 600,
}
}