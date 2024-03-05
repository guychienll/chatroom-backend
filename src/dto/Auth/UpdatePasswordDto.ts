import { OtpType } from "@/types/Auth";

class UpdatePasswordDto {
  password: string;
  otp: string;
  otpType: OtpType;

  constructor({
    password,
    otp,
    otpType,
  }: {
    password: string;
    otp: string;
    otpType: OtpType;
  }) {
    this.password = password;
    this.otp = otp;
    this.otpType = otpType;
  }
}

export default UpdatePasswordDto;
