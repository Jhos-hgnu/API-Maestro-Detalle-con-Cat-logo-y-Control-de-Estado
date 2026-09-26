import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { RegistroDto } from './dto/registro.dto';
import { RegistroService } from './registro.service';

@ApiTags('Registro')
@Controller('registro')
export class RegistroController {
  constructor(private readonly registroService: RegistroService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Estudiante creado y misiones registradas.',
  })
  @ApiOkResponse({ description: 'Estudiante y misiones actualizados.' })
  @ApiBadRequestResponse({ description: 'JSON o campos de entrada invalidos.' })
  @ApiUnprocessableEntityResponse({
    description: 'Una o mas misiones no existen.',
  })
  @ApiConflictResponse({
    description: 'El correo pertenece a otro estudiante.',
  })
  @ApiServiceUnavailableResponse({
    description: 'La base de datos no esta disponible.',
  })
  async registrar(
    @Body() registro: RegistroDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const resultado = await this.registroService.registrar(registro);
    response.status(
      resultado.estudianteCreado ? HttpStatus.CREATED : HttpStatus.OK,
    );
    return resultado;
  }
}
