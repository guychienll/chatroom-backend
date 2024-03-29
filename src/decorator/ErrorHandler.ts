import { Request, Response } from "@/types/Http";

function ErrorHandler() {
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
        const [, , next] = args;
        try {
          return await originalFn.apply(this, args);
        } catch (e) {
          next(e);
        }
      };
    }

    return descriptor;
  };
}

export default ErrorHandler;
