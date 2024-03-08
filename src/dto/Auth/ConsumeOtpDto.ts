import { OtpType } from "@/types/Auth";
import { IsString, Length } from "class-validator";

class ConsumeOtpDto {
  @Length(6, 6)
  otp: string;

  @IsString()
  otpType: OtpType;

  constructor(props: { otp: string; otpType: OtpType }) {
    this.otp = props.otp;
    this.otpType = props.otpType;
  }
}

export default ConsumeOtpDto;
