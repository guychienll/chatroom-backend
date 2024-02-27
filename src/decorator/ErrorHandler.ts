function ErrorHandler() {
  return function (_target, _propertyKey, descriptor) {
    const originalFn = descriptor.value;

    descriptor.value = async function (...args) {
      const [, , next] = args;
      try {
        return await originalFn.apply(this, args);
      } catch (e) {
        next(e);
      }
    };

    return descriptor;
  };
}

export default ErrorHandler;
