import { UnauthorizedError } from "@/model/HttpError";
import { Request, Response } from "@/types/Http";

function AuthGuard() {
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
          if (!req.session.profile) {
            throw new UnauthorizedError();
          }
          return await originalFn.apply(this, args);
        } catch (e) {
          next(e);
        }
      };
    }

    return descriptor;
  };
}

export default AuthGuard;
