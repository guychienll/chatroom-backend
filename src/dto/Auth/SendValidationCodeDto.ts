import { IsEmail, IsString } from "class-validator";
import { OtpType } from "@/types/OtpType";

class SendValidationCodeRequest {
  @IsEmail()
  username: string;

  @IsString()
  otpType: OtpType;
}

export default SendValidationCodeRequest;
