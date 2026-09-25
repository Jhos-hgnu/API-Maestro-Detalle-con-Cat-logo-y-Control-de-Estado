import { ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistroDto } from './dto/registro.dto';
import { RegistroService } from './registro.service';

const registro: RegistroDto = {
  maestro: {
    carnet: 'PRUEBA-FASE-2',
    nombre: 'Estudiante de Prueba',
    correo: 'prueba.fase2@example.test',
  },
  detalle: [{ misionId: 1, estado: true }],
};

describe('RegistroService', () => {
  function crearPrisma(misiones: number[], estudianteExiste = false) {
    const tx = {
      misiones: {
        findMany: jest.fn().mockResolvedValue(misiones.map((MisionID) => ({ MisionID }))),
      },
      estudiantes: {
        findUnique: jest
          .fn()
          .mockResolvedValue(estudianteExiste ? { Carnet: registro.maestro.carnet } : null),
        create: jest.fn(),
        update: jest.fn(),
      },
      estudianteMisiones: {
        upsert: jest.fn(),
      },
    };
    const prisma = {
      $transaction: jest.fn((callback) => callback(tx)),
    };

    return { prisma: prisma as unknown as PrismaService, tx };
  }

  it('creates the student and upserts each mission state', async () => {
    const { prisma, tx } = crearPrisma([1]);
    const service = new RegistroService(prisma);

    await expect(service.registrar(registro)).resolves.toMatchObject({
      estudianteCreado: true,
      carnet: registro.maestro.carnet,
      misionesProcesadas: 1,
    });
    expect(tx.estudiantes.create).toHaveBeenCalledWith({
      data: {
        Carnet: registro.maestro.carnet,
        Nombre: registro.maestro.nombre,
        Correo: registro.maestro.correo,
      },
    });
    expect(tx.estudianteMisiones.upsert).toHaveBeenCalledWith({
      where: { Carnet_MisionID: { Carnet: registro.maestro.carnet, MisionID: 1 } },
      create: { Carnet: registro.maestro.carnet, MisionID: 1, Estado: true },
      update: { Estado: true },
    });
  });

  it('rejects a missing catalog mission before student writes', async () => {
    const { prisma, tx } = crearPrisma([1]);
    const service = new RegistroService(prisma);
    const registroConMisionInvalida: RegistroDto = {
      ...registro,
      detalle: [
        { misionId: 1, estado: true },
        { misionId: 999, estado: false },
      ],
    };

    await expect(service.registrar(registroConMisionInvalida)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
    expect(tx.estudiantes.create).not.toHaveBeenCalled();
    expect(tx.estudiantes.update).not.toHaveBeenCalled();
    expect(tx.estudianteMisiones.upsert).not.toHaveBeenCalled();
  });

  it('rejects repeated mission IDs in one request', async () => {
    const { prisma } = crearPrisma([1]);
    const service = new RegistroService(prisma);
    const registroConDuplicado: RegistroDto = {
      ...registro,
      detalle: [
        { misionId: 1, estado: true },
        { misionId: 1, estado: false },
      ],
    };

    await expect(service.registrar(registroConDuplicado)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
