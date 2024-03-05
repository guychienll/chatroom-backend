export default class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class SessionTimeoutError extends HttpError {
  constructor() {
    super("session_timeout", 401);
  }
}

export class EntityNotFoundError extends HttpError {
  constructor() {
    super("entity_not_found", 404);
  }
}

export class InvalidPayloadError extends HttpError {
  constructor() {
    super("invalid_payload", 400);
  }
}

export class UnauthorizedError extends HttpError {
  constructor() {
    super("unauthorized", 401);
  }
}

export class ConflictError extends HttpError {
  constructor() {
    super("conflict", 409);
  }
}

export class TooManyRequestsError extends HttpError {
  constructor() {
    super("too_many_requests", 429);
  }
}
