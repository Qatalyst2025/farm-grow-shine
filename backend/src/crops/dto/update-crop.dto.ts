import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCropDto {
  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsNumber()
  progress?: number;

  @IsOptional()
  @IsString()
  health?: string;

  @IsOptional()
  @IsBoolean()
  onChainVerified?: boolean;
}
