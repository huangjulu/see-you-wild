/**
 * Domain errors thrown by service layer.
 * Each subclass carries the HTTP status it maps to;
 * `handleError` (lib/api/handle-error.ts) translates them at the route boundary.
 */
export abstract class DomainError extends Error {
  abstract readonly status: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EventNotFoundError extends DomainError {
  readonly status = 404;
  constructor() {
    super("Event not found");
  }
}

export class EventClosedError extends DomainError {
  readonly status = 400;
  constructor() {
    super("Event registration is closed");
  }
}

export class AlreadyRegisteredError extends DomainError {
  readonly status = 409;
  constructor() {
    super("Already registered for this event");
  }
}

export class RegistrationNotFoundError extends DomainError {
  readonly status = 404;
  constructor() {
    super("Registration not found");
  }
}

export class RegistrationPaidError extends DomainError {
  readonly status = 409;
  constructor() {
    super("Registration already paid");
  }
}

export class RegistrationExpiredError extends DomainError {
  readonly status = 410;
  constructor() {
    super("Registration expired");
  }
}

export class InvalidTokenError extends DomainError {
  readonly status = 403;
  constructor() {
    super("Invalid token");
  }
}

export class UnauthorizedError extends DomainError {
  readonly status = 401;
  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class HasCarpoolAssignmentError extends DomainError {
  readonly status = 409;
  constructor() {
    super(
      "Cannot delete registration with active carpool assignment. Re-run carpool assignment first."
    );
  }
}

/**
 * Catch-all for unexpected failures (DB connection drops, unknown PG errors, etc.).
 * `cause` carries the original error for server-side logging — never serialised to the client.
 */
export class InternalError extends DomainError {
  readonly status = 500;

  constructor(
    message = "Internal server error",
    public readonly cause?: unknown
  ) {
    super(message);
  }
}
