import { Length } from "class-validator";

class ValidateCodeDto {
  @Length(6, 6)
  code: string;
  constructor(props) {
    this.code = props.code;
  }
}

export default ValidateCodeDto;
