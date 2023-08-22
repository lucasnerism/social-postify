import { IsBooleanString, IsDateString, IsOptional } from 'class-validator';

export class FindQuery {
  @IsBooleanString()
  @IsOptional()
  published: string;

  @IsDateString()
  @IsOptional()
  after: Date;
}
