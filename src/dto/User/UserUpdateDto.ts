import { IsNumber, IsString, IsUrl } from "class-validator";

class UserUpdateDto {
  @IsString()
  @IsUrl()
  avatar: string;

  @IsNumber()
  age: number;
}

export default UserUpdateDto;
