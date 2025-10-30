import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRecommendationDto {
  @IsUUID()
  cropId: string;

  @IsNotEmpty()
  recommendation: string;
}
