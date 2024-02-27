import { IsEmail } from "class-validator";

class SendValidationCodeRequest {
  @IsEmail()
  username: string;

  constructor(props) {
    this.username = props.username;
  }
}

export default SendValidationCodeRequest;
