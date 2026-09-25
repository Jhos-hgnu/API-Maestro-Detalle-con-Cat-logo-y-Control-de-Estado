import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { ConsultasService } from './consultas.service';

@ApiTags('Consultas')
@Controller()
export class ConsultasController {
  constructor(private readonly consultasService: ConsultasService) {}

  @Get('misiones')
  @ApiOkResponse({ description: 'Catalogo de misiones de solo lectura.' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no esta disponible.' })
  obtenerMisiones() {
    return this.consultasService.obtenerMisiones();
  }

  @Get('estudiantes')
  @ApiOkResponse({ description: 'Estudiantes con sus misiones y avance.' })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no esta disponible.' })
  obtenerEstudiantes() {
    return this.consultasService.obtenerEstudiantes();
  }
}
