import ajv from "@/helper/Ajv";
import HttpError from "@/model/HttpError";

const Schema = (schema) => (fn) => {
  return async (...args) => {
    const [req] = args;
    if (ajv.getSchema(schema)(req.body)) {
      return await fn.apply(this, args);
    }
    throw new HttpError("Invalid Input", 400);
  };
};

export default Schema;
