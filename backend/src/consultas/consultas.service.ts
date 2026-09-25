import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConsultasService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerMisiones() {
    try {
      const misiones = await this.prisma.misiones.findMany({
        select: { MisionID: true, Nombre: true, Descripcion: true },
        orderBy: { MisionID: 'asc' },
      });

      return misiones.map((mision) => ({
        misionId: mision.MisionID,
        nombre: mision.Nombre,
        descripcion: mision.Descripcion,
      }));
    } catch (error) {
      this.rethrowDatabaseError(error);
    }
  }

  async obtenerEstudiantes() {
    try {
      const estudiantes = await this.prisma.estudiantes.findMany({
        select: {
          Carnet: true,
          Nombre: true,
          Correo: true,
          EstudianteMisiones: {
            select: {
              MisionID: true,
              Estado: true,
              Misiones: { select: { Nombre: true, Descripcion: true } },
            },
            orderBy: { MisionID: 'asc' },
          },
        },
        orderBy: { Carnet: 'asc' },
      });

      return estudiantes.map((estudiante) => {
        const misiones = estudiante.EstudianteMisiones.map((detalle) => ({
          misionId: detalle.MisionID,
          nombre: detalle.Misiones.Nombre,
          descripcion: detalle.Misiones.Descripcion,
          estado: detalle.Estado,
        }));
        const completadas = misiones.filter((mision) => mision.estado).length;
        const total = misiones.length;

        return {
          carnet: estudiante.Carnet,
          nombre: estudiante.Nombre,
          correo: estudiante.Correo,
          progreso: {
            total,
            completadas,
            pendientes: total - completadas,
            porcentaje: total === 0 ? 0 : Number(((completadas / total) * 100).toFixed(2)),
          },
          misiones,
        };
      });
    } catch (error) {
      this.rethrowDatabaseError(error);
    }
  }

  private rethrowDatabaseError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientInitializationError ||
      (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2024')
    ) {
      throw new ServiceUnavailableException(
        'El servicio de base de datos no esta disponible temporalmente.',
      );
    }

    throw error;
  }
}
