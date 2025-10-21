import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDate,
} from 'class-validator';

export class CreateCropDto {
  @IsUUID()
  farmerId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsDate()
  expectedHarvestDate?: Date;
}
