import { IsDate, IsDateString, IsInt, IsPositive } from 'class-validator';

export class CreatePublicationDto {
  @IsInt()
  @IsPositive()
  postId: number;
  @IsInt()
  @IsPositive()
  mediaId: number;
  @IsDateString()
  date: Date;
}
