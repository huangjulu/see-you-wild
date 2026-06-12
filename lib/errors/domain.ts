/**
 * Domain errors thrown by service layer.
 * Each subclass carries the HTTP status and a stable error code;
 * `handleError` (lib/api/handle-error.ts) translates them at the route boundary.
 */
export abstract class DomainError extends Error {
  abstract readonly status: number;
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EventNotFoundError extends DomainError {
  readonly status = 404;
  readonly code = "EVENT_NOT_FOUND";
  constructor() {
    super("Event not found");
  }
}

export class EventClosedError extends DomainError {
  readonly status = 400;
  readonly code = "EVENT_CLOSED";
  constructor() {
    super("Event registration is closed");
  }
}

export class AlreadyRegisteredError extends DomainError {
  readonly status = 409;
  readonly code = "ALREADY_REGISTERED";
  constructor() {
    super("Already registered for this event");
  }
}

export class DuplicateIdNumberError extends DomainError {
  readonly status = 409;
  readonly code = "DUPLICATE_ID_NUMBER";
  constructor() {
    super("This ID number is already registered for this event");
  }
}

export class RegistrationNotFoundError extends DomainError {
  readonly status = 404;
  readonly code = "REGISTRATION_NOT_FOUND";
  constructor() {
    super("Registration not found");
  }
}

export class RegistrationPaidError extends DomainError {
  readonly status = 409;
  readonly code = "REGISTRATION_PAID";
  constructor() {
    super("Registration already paid");
  }
}

export class RegistrationAlreadyReviewedError extends DomainError {
  readonly status = 409;
  readonly code = "REGISTRATION_ALREADY_REVIEWED";
  constructor() {
    super("Registration already reviewed");
  }
}

export class RegistrationExpiredError extends DomainError {
  readonly status = 410;
  readonly code = "REGISTRATION_EXPIRED";
  constructor() {
    super("Registration expired");
  }
}

export class InvalidTokenError extends DomainError {
  readonly status = 403;
  readonly code = "INVALID_TOKEN";
  constructor() {
    super("Invalid token");
  }
}

export class UnauthorizedError extends DomainError {
  readonly status = 401;
  readonly code = "UNAUTHORIZED";
  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class HasCarpoolAssignmentError extends DomainError {
  readonly status = 409;
  readonly code = "HAS_CARPOOL_ASSIGNMENT";
  constructor() {
    super(
      "Cannot delete registration with active carpool assignment. Re-run carpool assignment first."
    );
  }
}

export class CarpoolDatesLockedError extends DomainError {
  readonly status = 400;
  readonly code = "CARPOOL_DATES_LOCKED";
  constructor() {
    super(
      "Cannot modify start_date or carpool_cutoff_days after carpool assignments have been generated"
    );
  }
}

export class CarpoolCutoffInPastError extends DomainError {
  readonly status = 400;
  readonly code = "CARPOOL_CUTOFF_IN_PAST";
  constructor() {
    super("Cutoff date cannot be in the past");
  }
}

/**
 * Catch-all for unexpected failures (DB connection drops, unknown PG errors, etc.).
 * `cause` carries the original error for server-side logging — never serialised to the client.
 */
export class InternalError extends DomainError {
  readonly status = 500;
  readonly code = "INTERNAL_ERROR";

  constructor(
    message = "Internal server error",
    public readonly cause?: unknown
  ) {
    super(message);
  }
}
