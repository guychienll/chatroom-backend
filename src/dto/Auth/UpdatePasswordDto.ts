import { OtpType } from "@/types/OtpType";

class UpdatePasswordDto {
  password: string;
  otp: string;
  otpType: OtpType;
}

export default UpdatePasswordDto;
