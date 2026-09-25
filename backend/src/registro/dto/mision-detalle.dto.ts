import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, Min } from 'class-validator';

export class MisionDetalleDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  misionId: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  estado: boolean;
}
