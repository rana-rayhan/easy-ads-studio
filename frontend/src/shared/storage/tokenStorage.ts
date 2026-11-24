const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// All token reads and writes go through this object, so storage can be changed later in one place.
const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  hasAccessToken: () => !!localStorage.getItem(ACCESS_TOKEN_KEY),

  save: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  saveAccessToken: (accessToken: string) => localStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
  hasRefreshToken: () => !!localStorage.getItem(REFRESH_TOKEN_KEY),

  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export default tokenStorage;
