import { badRequestError } from "../utils/apiError.js";

/**
 * Validates request parts. The schema may define any subset of { body, query, params }.
 * Missing parts are skipped.
 */
export const validate = (schema) => (req, res, next) => {
  const input = {};
  if (schema.shape?.body) input.body = req.body;
  if (schema.shape?.query) input.query = req.query;
  if (schema.shape?.params) input.params = req.params;

  const result = schema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    throw badRequestError("Validation failed", details);
  }
  req.validated = result.data;
  next();
};