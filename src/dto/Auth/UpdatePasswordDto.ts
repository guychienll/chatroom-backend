import { OtpType } from "@/types/Auth";

class UpdatePasswordDto {
  password: string;
  otp: string;
  otpType: OtpType;

  constructor(props: { password: string; otp: string; otpType: OtpType }) {
    this.password = props.password;
    this.otp = props.otp;
    this.otpType = props.otpType;
  }
}

export default UpdatePasswordDto;
