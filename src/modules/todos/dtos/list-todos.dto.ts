import { Type } from 'class-transformer';
import {
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class ListTodosDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ValidateIf((_, value) => value !== undefined)
  @IsUUID('4')
  cursor?: string;
}