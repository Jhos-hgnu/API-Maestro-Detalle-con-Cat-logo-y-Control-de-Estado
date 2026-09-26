import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('API Maestro-Detalle disponible.');
  });

  it('/api/misiones (GET) returns catalog data', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/misiones')
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          misionId: expect.any(Number),
          nombre: expect.any(String),
        }),
      ]),
    );
  });

  it('/api/estudiantes (GET) returns consistent progress data', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/estudiantes')
      .expect(200);
    const carnets = response.body.map(
      (estudiante: { carnet: string }) => estudiante.carnet,
    );

    expect(new Set(carnets).size).toBe(carnets.length);
    for (const estudiante of response.body) {
      const { completadas, pendientes, porcentaje, total } =
        estudiante.progreso;

      expect(completadas + pendientes).toBe(total);
      expect(Number.isFinite(porcentaje)).toBe(true);
      expect(porcentaje).toBe(
        total === 0 ? 0 : Number(((completadas / total) * 100).toFixed(2)),
      );
      expect(
        new Set(
          estudiante.misiones.map(
            (mision: { misionId: number }) => mision.misionId,
          ),
        ).size,
      ).toBe(estudiante.misiones.length);
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
