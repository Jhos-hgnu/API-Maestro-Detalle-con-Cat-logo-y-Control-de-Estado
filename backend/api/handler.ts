import type { Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

type ExpressHandler = (request: Request, response: Response) => void;

let cachedHandler: ExpressHandler | undefined;

async function getHandler() {
  if (!cachedHandler) {
    const app = await NestFactory.create(AppModule);
    configureApp(app);
    await app.init();
    cachedHandler = app.getHttpAdapter().getInstance() as ExpressHandler;
  }

  return cachedHandler;
}

export default async function handler(request: Request, response: Response) {
  // Vercel invokes this function per request; cache the initialized Nest app per warm instance.
  const nestHandler = await getHandler();
  nestHandler(request, response);
}
