import HttpError from "@/model/HttpError";

function ErrorHandler(fn) {
  return async function (...args) {
    const [, , next] = args;
    try {
      return await fn.apply(this, args);
    } catch (e) {
      if (e instanceof HttpError) {
        next(e);
      } else {
        next(new HttpError("Internal Server Error", 500));
      }
    }
  };
}

export default ErrorHandler;
