import { IsBoolean, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class UpdateTodoDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  completed?: boolean;
}