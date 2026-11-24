/**
 * MessageKey
 *
 * The backend never returns English sentences to the client.
 * It returns these translation keys instead, and the frontend
 * (react-i18next) turns each key into text in the user's language.
 *
 * Rules:
 * - The enum VALUE is the translation key. It must match the key in the
 *   frontend language files exactly (for example en.json, fi.json).
 * - Keys are grouped by area: auth.*, user.*, common.*
 * - Add new keys here instead of writing message strings in the code.
 */
export enum MessageKey {
  // ---------- Auth ----------
  AUTH_LOGIN_REQUIRED = "auth.loginRequired",
  AUTH_LOGIN_SUCCESS = "auth.loginSuccess",
  AUTH_INVALID_CREDENTIALS = "auth.invalidCredentials",
  AUTH_TOKEN_INVALID = "auth.tokenInvalid",
  AUTH_TOKEN_EXPIRED = "auth.tokenExpired",
  AUTH_USER_NOT_FOUND = "auth.userNotFound",
  AUTH_FORBIDDEN = "auth.forbidden",
  AUTH_ADMIN_ONLY = "auth.adminOnly",
  AUTH_ALREADY_LOGGED_IN = "auth.alreadyLoggedIn",
  // Auth group
  AUTH_REGISTER_SUCCESS = "auth.registerSuccess",

  // User group
  USER_EMAIL_EXISTS = "user.emailExists",

  // ---------- User ----------
  USER_NOT_FOUND = "user.notFound",
  USER_LIST_FETCHED = "user.listFetched",
  USER_DETAILS_FETCHED = "user.detailsFetched",
  USER_SEED_SUCCESS = "user.seedSuccess",

  // ---------- Common ----------
  COMMON_SERVER_ERROR = "common.serverError",
  COMMON_DATABASE_ERROR = "common.databaseError",
  COMMON_TOO_MANY_REQUESTS = "common.tooManyRequests",
  COMMON_TOO_MANY_LOGIN_ATTEMPTS = "common.tooManyLoginAttempts",
  COMMON_BAD_REQUEST = "common.badRequest",
  COMMON_NOT_FOUND = "common.notFound",

  // ---------- Validation ----------
  VALIDATION_FIRST_NAME_REQUIRED = "validation.firstNameRequired",
  VALIDATION_FIRST_NAME_LENGTH = "validation.firstNameLength",
  VALIDATION_LAST_NAME_REQUIRED = "validation.lastNameRequired",
  VALIDATION_LAST_NAME_LENGTH = "validation.lastNameLength",
  VALIDATION_EMAIL_REQUIRED = "validation.emailRequired",
  VALIDATION_EMAIL_INVALID = "validation.emailInvalid",
  VALIDATION_PASSWORD_REQUIRED = "validation.passwordRequired",
  VALIDATION_PASSWORD_LENGTH = "validation.passwordLength",
  VALIDATION_PASSWORD_WEAK = "validation.passwordWeak",
  VALIDATION_INVALID_CHARACTERS = "validation.invalidCharacters",
}
