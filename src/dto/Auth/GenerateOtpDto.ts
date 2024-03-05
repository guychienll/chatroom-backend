import { OtpType } from "@/types/Auth";
import { User } from "@/types/User";
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
  constructor({
    username,
    otpType,
  }: {
    username: User["username"];
    otpType: OtpType;
  }) {
    this.username = username;
    this.otpType = otpType;
  }
}

export default GenerateOtpDto;
