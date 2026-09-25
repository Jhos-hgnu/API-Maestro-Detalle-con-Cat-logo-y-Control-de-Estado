import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class MaestroDto {
  @ApiProperty({ example: '1890-20-11489', maxLength: 25 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  carnet: string;

  @ApiProperty({ example: 'MERCEDES AZUCENA LOPEZ PEREZ', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @ApiProperty({ example: 'mlopezp58@miumg.edu.gt', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(150)
  correo: string;
}
