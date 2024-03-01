import { IsNumber, IsString, IsUrl } from "class-validator";

class UserUpdateDto {
  @IsUrl()
  avatar: string;

  nickname: number;

  birthday: string;

  gender: "male" | "female" | "other";

  bio: string;
}

export default UserUpdateDto;
