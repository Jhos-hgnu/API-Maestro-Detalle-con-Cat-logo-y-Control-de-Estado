import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConsultasModule } from './consultas/consultas.module';
import { PrismaModule } from './prisma/prisma.module';
import { RegistroModule } from './registro/registro.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, RegistroModule, ConsultasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
