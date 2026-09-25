export interface Mision {
  misionId: number
  nombre: string
  descripcion: string | null
  estado: boolean
}

export interface Estudiante {
  carnet: string
  nombre: string
  correo: string
  progreso: {
    total: number
    completadas: number
    pendientes: number
    porcentaje: number
  }
  misiones: Mision[]
}
