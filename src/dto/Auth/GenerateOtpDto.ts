import { OtpType } from "@/types/Auth";
import { User } from "@/types/User";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

class GenerateOtpDto {
  @IsEmail()
  @IsNotEmpty()
  username: string;

  @IsString()
  otpType: OtpType;

  constructor(props: { username: User["username"]; otpType: OtpType }) {
    this.username = props.username;
    this.otpType = props.otpType;
  }
}

export default GenerateOtpDto;
