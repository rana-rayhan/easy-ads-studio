import { config } from "dotenv";
config();

/**
This file loads environment variables from the .env file using dotenv and exports application settings,
including the server port, environment stage, database migration flag, client URL, and JWT secret.
It also determines whether the client is running on localhost and provides the PostgreSQL connection settings,
using default values when environment variables are not defined.
*/

export const PORT = process.env.SERVER_PORT;
export const isDevStage = process.env.STAGE === "dev";
export const isMigrationRequired = process.env.DB_MIGRATION === "required";
export const CLIENT_HOST_REACT = process.env.CLIENT_HOST_REACT || "missing";
export const isLocalhost = CLIENT_HOST_REACT.startsWith("http://localhost:");
export const JWT_TOKEN_SECRET = process.env.TOKEN_SECRET || "missing";

export const REDIS_URL = process.env.REDIS_URL || "missing";
export const RABBITMQ_URL = process.env.RABBITMQ_URL || "missing";
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "missing";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "missing";

export const GOOGLE_ADS_MODE = process.env.GOOGLE_ADS_MODE || "mock"; // "mock" or "real"
export const GOOGLE_ADS_API_VERSION = process.env.GOOGLE_ADS_API_VERSION || "v26";
export const GOOGLE_ADS_CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID || "missing"; // client account (where ads go)
export const GOOGLE_ADS_LOGIN_CUSTOMER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || "missing"; // manager account
export const GOOGLE_ADS_KEY_FILE = process.env.GOOGLE_ADS_KEY_FILE || "./google-ads-key.json";
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:4040/api/google-ads/callback";

export const databaseSecret = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "postgres",
};

// Ollama: free AI that runs on your own computer (https://ollama.com)
export const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:4b"; // small model that understands text and images
