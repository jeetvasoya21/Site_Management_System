const requestSegments = ["params", "query", "body"];

export const validate = (schemas) => (req, res, next) => {
  const errors = [];

  requestSegments.forEach((segment) => {
    const schema = schemas?.[segment];
    if (!schema) {
      return;
    }

    const { value, error } = schema.validate(req[segment], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      errors.push(...error.details.map((detail) => detail.message));
      return;
    }

    req[segment] = value;
  });

  if (errors.length) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};
