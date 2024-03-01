import { OtpType } from "@/types/OtpType";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

class GenerateOtpDto {
  @IsEmail()
  @IsNotEmpty()
  username: string;

  @IsString()
  otpType: OtpType;

  /**
   *
   */
  constructor({ username, otpType }) {
    this.username = username;
    this.otpType = otpType;
  }
}

export default GenerateOtpDto;
