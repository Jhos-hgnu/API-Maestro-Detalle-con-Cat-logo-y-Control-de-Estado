import { useEffect, useState } from 'react'
import type { Estudiante } from './types'

const apiUrl = import.meta.env.VITE_API_URL

function App() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [carnetAbierto, setCarnetAbierto] = useState<string | null>(null)

  useEffect(() => {
    async function cargarEstudiantes() {
      if (!apiUrl) {
        setError('Falta configurar VITE_API_URL.')
        setCargando(false)
        return
      }

      try {
        const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/estudiantes`)

        if (!response.ok) {
          throw new Error('No fue posible obtener los estudiantes.')
        }

        setEstudiantes(await response.json())
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Error de conexion.')
      } finally {
        setCargando(false)
      }
    }

    void cargarEstudiantes()
  }, [])

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">Control de estado</p>
        <h1>Avance de estudiantes</h1>
        <p>Consulta las misiones registradas y el progreso de cada estudiante.</p>
      </header>

      {cargando && <p className="state-message">Cargando estudiantes...</p>}
      {error && <p className="state-message error-message">{error}</p>}
      {!cargando && !error && estudiantes.length === 0 && (
        <p className="state-message">No hay estudiantes registrados todavia.</p>
      )}

      <section className="student-list" aria-label="Estudiantes registrados">
        {estudiantes.map((estudiante) => {
          const abierto = carnetAbierto === estudiante.carnet
          const porcentaje = Math.min(100, Math.max(0, estudiante.progreso.porcentaje))

          return (
            <article className="student-card" key={estudiante.carnet}>
              <div className="student-summary">
                <div>
                  <p className="carnet">{estudiante.carnet}</p>
                  <h2>{estudiante.nombre}</h2>
                  <p className="email">{estudiante.correo}</p>
                </div>
                <strong className="percentage">{porcentaje}%</strong>
              </div>

              <div className="progress-track" aria-label={`${porcentaje}% completado`}>
                <div className="progress-fill" style={{ width: `${porcentaje}%` }} />
              </div>

              <dl className="progress-data">
                <div><dt>Completadas</dt><dd>{estudiante.progreso.completadas}</dd></div>
                <div><dt>Pendientes</dt><dd>{estudiante.progreso.pendientes}</dd></div>
                <div><dt>Total</dt><dd>{estudiante.progreso.total}</dd></div>
              </dl>

              <button
                className="detail-button"
                type="button"
                aria-expanded={abierto}
                onClick={() => setCarnetAbierto(abierto ? null : estudiante.carnet)}
              >
                {abierto ? 'Ocultar misiones' : 'Ver misiones'}
              </button>

              {abierto && (
                <ul className="mission-list">
                  {estudiante.misiones.map((mision) => (
                    <li key={mision.misionId} className={mision.estado ? 'completed' : 'pending'}>
                      <span>Mision {mision.misionId}: {mision.nombre}</span>
                      <strong>{mision.estado ? 'Completada' : 'Pendiente'}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          )
        })}
      </section>
    </main>
  )
}

export default App
