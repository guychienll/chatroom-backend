import { InvalidPayloadError } from "@/model/HttpError";
import { Request, Response } from "@/types/Http";
import { validate } from "class-validator";

function RequestBodyValidator(shape: any) {
  return function (
    _target: any,
    _propertyKey: any,
    descriptor: TypedPropertyDescriptor<
      (req: Request, res: Response, next?: any) => Promise<void>
    >
  ) {
    const originalFn = descriptor.value;

    if (originalFn) {
      descriptor.value = async function (...args) {
        const [req, , next] = args;
        try {
          if ((await validate(new shape(req.body))).length > 0) {
            throw new InvalidPayloadError();
          } else {
            return await originalFn.apply(this, args);
          }
        } catch (e) {
          next(e);
        }
      };
    }

    return descriptor;
  };
}

export default RequestBodyValidator;
