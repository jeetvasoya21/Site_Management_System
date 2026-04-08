import Joi from "joi";

const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  .messages({
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  });

const roleSchema = Joi.string().valid(
  "Admin",
  "Project_Manager",
  "Site_Engineer",
  "Storekeeper",
  "Worker"
);

export const registerValidation = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(80).required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: password.required(),
    phone: Joi.string().trim().allow("").max(20).optional(),
    role: roleSchema.optional(),
  }),
};

export const adminCreateUserValidation = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(80).required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: password.required(),
    phone: Joi.string().trim().allow("").max(20).optional(),
    role: roleSchema.required(),
    isActive: Joi.boolean().optional(),
    verified: Joi.boolean().optional(),
  }),
};

export const loginValidation = {
  body: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required(),
  }),
};

export const updateProfileValidation = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(80).optional(),
    phone: Joi.string().trim().allow("").max(20).optional(),
  }).min(1),
};

export const changePasswordValidation = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: password.required(),
  }),
};
