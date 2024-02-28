import { OtpType } from "@/types/OtpType";
import { IsString, Length } from "class-validator";

class ValidateCodeDto {
  @Length(6, 6)
  otp: string;

  @IsString()
  type: OtpType;
}

export default ValidateCodeDto;
