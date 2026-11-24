import createHttpError from "http-errors";

// Check that the UUID exists and has a valid format.
export const validateUUID = (uuid?: string, message?: string) => {
  if (!uuid) throw createHttpError(403, `Access denied. ${message} UUID is missing!`);

  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(uuid)) throw createHttpError(422, `${message} UUID is not valid!`);
};

// Check that the email has a valid format and length.
export const validateEmail = (email: string) => {
  if (!/^[^\s@]{1,64}@[^\s@]{1,255}$/.test(email) || email.length > 320) {
    throw createHttpError(401, "Invalid email format or length.");
  }
};
