import { User } from "@/types/User";
import { IsEmail, Length } from "class-validator";

class RegisterDto {
  @IsEmail()
  username: string;

  @Length(8, 20)
  password: string;

  constructor({
    username,
    password,
  }: Required<Pick<User, "username" | "password">>) {
    this.username = username;
    this.password = password;
  }
}

export default RegisterDto;
