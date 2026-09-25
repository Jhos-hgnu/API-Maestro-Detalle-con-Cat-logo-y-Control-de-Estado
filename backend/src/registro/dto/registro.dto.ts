import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined, ValidateNested } from 'class-validator';
import { MaestroDto } from './maestro.dto';
import { MisionDetalleDto } from './mision-detalle.dto';

export class RegistroDto {
  @ApiProperty({ type: MaestroDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => MaestroDto)
  maestro: MaestroDto;

  @ApiProperty({ type: [MisionDetalleDto] })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MisionDetalleDto)
  detalle: MisionDetalleDto[];
}
