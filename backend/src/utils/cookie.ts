// [deprecated] This file is no longer in use. The cookie-based authentication has been replaced with token-based authentication using the Authorization header.
// import { Response } from "express";
// import { isLocalhost } from "../secrets/envSecret";

// // Set an access token cookie that expires after 12 hours.
// export const setAccessTokenCookie = (res: Response, token: string) => {
//   res.cookie("accessToken", token, {
//     maxAge: 12 * 60 * 60 * 1000,
//     httpOnly: true, // Prevent client-side JavaScript from accessing the cookie.
//     secure: !isLocalhost, // Require HTTPS outside localhost.
//     sameSite: isLocalhost ? "lax" : "none", // Allow cross-site cookies in production.
//   });
// };

// // Set a refresh token cookie that expires after 7 days.
// export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
//   res.cookie("refreshToken", refreshToken, {
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//     httpOnly: true, // Prevent client-side JavaScript from accessing the cookie.
//     secure: !isLocalhost, // Require HTTPS outside localhost.
//     sameSite: isLocalhost ? "lax" : "none", // Allow cross-site cookies in production.
//   });
// };
