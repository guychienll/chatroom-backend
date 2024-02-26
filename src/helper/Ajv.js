import Ajv from "ajv";
import send_validation_code from "@/schema/auth/send_validation_code.json";
import login from "@/schema/auth/login.json";
import validate_code from "@/schema/auth/validate_code.json";
import register from "@/schema/auth/register.json";

const ajv = new Ajv();

ajv.addKeyword("isNotEmpty", {
  type: "string",
  validate: function (schema, data) {
    return typeof data === "string" && data.trim() !== "";
  },
  errors: false,
});

ajv.addSchema(send_validation_code, "send_validation_code");
ajv.addSchema(login, "login");
ajv.addSchema(validate_code, "validate_code");
ajv.addSchema(register, "register");

export default ajv;
