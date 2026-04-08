import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const schema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string().uri().required(),
  CORS_ORIGIN: Joi.string().default("http://localhost:5173"),
  ACCESS_TOKEN_SECRET: Joi.string().min(32).optional(),
  REFRESH_TOKEN_SECRET: Joi.string().min(32).optional(),
  JWT_SECRET: Joi.string().min(32).optional(),
  ACCESS_TOKEN_EXPIRES_IN: Joi.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default("7d"),
  JWT_EXPIRES_IN: Joi.string().default("7d"),
  COOKIE_DOMAIN: Joi.string().allow("").optional(),
}).unknown(true);

const { error, value } = schema.validate(process.env, {
  abortEarly: false,
  stripUnknown: false,
});

if (error) {
  throw new Error(`Environment validation failed: ${error.message}`);
}

const accessTokenSecret = value.ACCESS_TOKEN_SECRET || value.JWT_SECRET;
const refreshTokenSecret = value.REFRESH_TOKEN_SECRET || value.JWT_SECRET;

if (!accessTokenSecret || !refreshTokenSecret) {
  throw new Error("Missing token secrets. Set ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET, or fallback JWT_SECRET.");
}

const isProduction = value.NODE_ENV === "production";

const env = {
  nodeEnv: value.NODE_ENV,
  isProduction,
  port: Number(value.PORT),
  mongoUri: value.MONGODB_URI,
  corsOrigin: value.CORS_ORIGIN,
  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiresIn: value.ACCESS_TOKEN_EXPIRES_IN || value.JWT_EXPIRES_IN,
  refreshTokenExpiresIn: value.REFRESH_TOKEN_EXPIRES_IN || value.JWT_EXPIRES_IN,
  cookieDomain: value.COOKIE_DOMAIN || undefined,
};

export default env;
