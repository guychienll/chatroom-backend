import { IsEmail, Length } from "class-validator";

class RegisterDto {
  @IsEmail()
  username: string;

  @Length(8, 20)
  password: string;
  constructor(props) {
    this.username = props.username;
    this.password = props.password;
  }
}

export default RegisterDto;
