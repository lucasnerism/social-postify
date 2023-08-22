import { IsDate, IsDateString, IsInt, IsPositive } from 'class-validator';

export class CreatePublicationDto {
  @IsInt()
  @IsPositive()
  postId: Number;
  @IsInt()
  @IsPositive()
  mediaId: Number;
  @IsDate()
  date: Date;
}
