import { OtpType } from "@/types/OtpType";

class UpdatePasswordDto {
  password: string;
  otp: string;
  otpType: OtpType;

  constructor({ password, otp, otpType }) {
    this.password = password;
    this.otp = otp;
    this.otpType = otpType;
  }
}

export default UpdatePasswordDto;
