const {
  BaseError,
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  ConnectionError,
  ConnectionAcquireTimeoutError,
  DatabaseError,
  TimeoutError,
} = require("sequelize");

const errorHandler = (error, req, res, _next) => {
  // TODO: colocar logging (Sentry, Winston, etc.) em vez de console.error em prod
  console.error("NOME DO ERRO REAL:", error);

  if (error instanceof BaseError) {
    if (error instanceof ValidationError)
      return res.status(400).json({ elements: "Invalid data provided." });

    if (error instanceof UniqueConstraintError)
      return res.status(409).json({ elements: "Record already exists." });

    if (error instanceof ForeignKeyConstraintError)
      return res.status(409).json({ elements: "Cannot complete operation — record has dependencies." });

    if (error instanceof ConnectionAcquireTimeoutError)
      return res.status(503).json({ elements: "Service temporarily unavailable." });

    if (error instanceof ConnectionError)
        // cobre: ConnectionRefused, HostNotFound, HostNotReachable,
        // AccessDenied, InvalidConnection, ConnectionTimedOut, etc.
      return res.status(503).json({ elements: "Service temporarily unavailable." });

    if (error instanceof TimeoutError)
      return res.status(503).json({ elements: "Request timed out, please try again." });

    if (error instanceof DatabaseError)
        // query malformada, coluna/tabela inexistente — bug de código, não do cliente
      return res.status(500).json({ elements: "Internal server error." });

    return res.status(500).json({ elements: "Internal server error." });
  }

  const kind = error.kind?.toLowerCase().trim();

  if (kind === "same_pass")
    return res.status(400).json({ elements: "The password cannot be the same as the old one." });
  if (kind === "no_compatible_pass")
    return res.status(400).json({ elements: "The current password does not match." });
  if (kind === "invalid_input")
    return res.status(400).json({ elements: error.detail || "Invalid data provided." });
  if (["robot", "robot_detected"].includes(kind))
    return res.status(400).json({ elements: "Robot detected." });
  if (kind === "email error")
    return res.status(502).json({ elements: "Could not send the email, please try again." });
  if (kind === "expired")
    return res.status(401).json({ elements: "Expired token." });
  if (["forbidden", "forbiden"].includes(kind))
    return res.status(403).json({ elements: "Forbidden." });
  if (["not_found", "not found", "material not found", "user not found",
    "levels not found", "no results"].includes(kind))
    return res.status(404).json({ elements: "Not found." });
  if (["already_exists", "conflict"].includes(kind))
    return res.status(409).json({ elements: error.message || "Resource already exists." });

  // TODO: colocar logging em vez de console.error comentado
  //console.error(error);
  return res.status(500).json({ elements: "Internal server error." });
};

module.exports = errorHandler;