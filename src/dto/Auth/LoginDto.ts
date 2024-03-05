import { User } from "@/types/User";
import { IsEmail, Length } from "class-validator";

class LoginDto {
  @IsEmail()
  username: string;

  @Length(8, 20)
  password: string;

  constructor(props: Required<Pick<User, "username" | "password">>) {
    this.username = props.username;
    this.password = props.password;
  }
}

export default LoginDto;
