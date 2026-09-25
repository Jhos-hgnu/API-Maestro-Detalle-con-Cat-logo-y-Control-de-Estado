import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegistroDto } from './dto/registro.dto';

@Injectable()
export class RegistroService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(registro: RegistroDto) {
    const { maestro, detalle } = registro;
    const misionIds = detalle.map(({ misionId }) => misionId);
    const misionIdsDuplicados = misionIds.filter(
      (misionId, indice) => misionIds.indexOf(misionId) !== indice,
    );

    if (misionIdsDuplicados.length > 0) {
      throw new ConflictException({
        message: 'No se permite repetir una mision en el detalle.',
        misionIdsDuplicados: [...new Set(misionIdsDuplicados)],
      });
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // The catalog is checked before any student or detail write occurs.
        const misionesExistentes = await tx.misiones.findMany({
          where: { MisionID: { in: misionIds } },
          select: { MisionID: true },
        });
        const idsExistentes = new Set(misionesExistentes.map(({ MisionID }) => MisionID));
        const misionIdsInvalidos = misionIds.filter((misionId) => !idsExistentes.has(misionId));

        if (misionIdsInvalidos.length > 0) {
          throw new UnprocessableEntityException({
            message: 'Una o mas misiones no existen en el catalogo.',
            misionIdsInvalidos,
          });
        }

        const estudianteActual = await tx.estudiantes.findUnique({
          where: { Carnet: maestro.carnet },
          select: { Carnet: true },
        });

        if (estudianteActual) {
          await tx.estudiantes.update({
            where: { Carnet: maestro.carnet },
            data: { Nombre: maestro.nombre, Correo: maestro.correo },
          });
        } else {
          await tx.estudiantes.create({
            data: { Carnet: maestro.carnet, Nombre: maestro.nombre, Correo: maestro.correo },
          });
        }

        await Promise.all(
          detalle.map(({ misionId, estado }) =>
            tx.estudianteMisiones.upsert({
              where: {
                Carnet_MisionID: { Carnet: maestro.carnet, MisionID: misionId },
              },
              create: { Carnet: maestro.carnet, MisionID: misionId, Estado: estado },
              update: { Estado: estado },
            }),
          ),
        );

        return {
          mensaje: estudianteActual
            ? 'Registro actualizado correctamente.'
            : 'Registro creado correctamente.',
          estudianteCreado: !estudianteActual,
          carnet: maestro.carnet,
          misionesProcesadas: detalle.length,
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('El correo ya pertenece a otro estudiante.');
      }

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
}
