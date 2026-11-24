// Keep PASSWORD_REGEX identical to the backend, or the form and the server will disagree.
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+-])[\^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+A-Za-z\d-]{12,72}$/;

// One entry per line of the checklist. `key` is the translation key suffix.
export const PASSWORD_RULES: { key: string; test: (value: string) => boolean }[] = [
  { key: "length", test: (v) => v.length >= 12 && v.length <= 72 },
  { key: "lowercase", test: (v) => /[a-z]/.test(v) },
  { key: "uppercase", test: (v) => /[A-Z]/.test(v) },
  { key: "number", test: (v) => /\d/.test(v) },
  { key: "special", test: (v) => /[\^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+-]/.test(v) },
  // The regex allows only these characters, so a space or "ä" fails even if the rules above pass.
  { key: "allowed", test: (v) => /^[\^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+A-Za-z\d-]*$/.test(v) },
];
