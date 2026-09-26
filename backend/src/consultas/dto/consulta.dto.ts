import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MisionConsultaDto {
  @ApiProperty({ example: 1 })
  misionId: number;

  @ApiProperty({ example: 'Completar el laboratorio' })
  nombre: string;

  @ApiPropertyOptional({
    example: 'Registrar el avance del laboratorio.',
    nullable: true,
  })
  descripcion: string | null;
}

export class ProgresoDto {
  @ApiProperty({ example: 4 })
  total: number;

  @ApiProperty({ example: 2 })
  completadas: number;

  @ApiProperty({ example: 2 })
  pendientes: number;

  @ApiProperty({ example: 50 })
  porcentaje: number;
}

export class MisionEstudianteDto extends MisionConsultaDto {
  @ApiProperty({ example: true })
  estado: boolean;
}

export class EstudianteConsultaDto {
  @ApiProperty({ example: '1890-23-2862' })
  carnet: string;

  @ApiProperty({ example: 'Josue Fernando Hicho Garcia' })
  nombre: string;

  @ApiProperty({ example: 'jhicho@miumg.edu.gt' })
  correo: string;

  @ApiProperty({ type: ProgresoDto })
  progreso: ProgresoDto;

  @ApiProperty({ type: [MisionEstudianteDto] })
  misiones: MisionEstudianteDto[];
}
