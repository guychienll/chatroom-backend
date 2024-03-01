import { OtpType } from "@/types/OtpType";
import { IsString, Length } from "class-validator";

class ConsumeOtpDto {
  @Length(6, 6)
  otp: string;

  @IsString()
  type: OtpType;

  constructor({ otp, type }) {
    this.otp = otp;
    this.type = type;
  }
}

export default ConsumeOtpDto;
