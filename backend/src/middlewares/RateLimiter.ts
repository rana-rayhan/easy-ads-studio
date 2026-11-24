// For template, infrastructure-level rate limiting will be sufficient. so I will remove it ---***
// import rateLimit from "express-rate-limit";

// // Define the maximum number of requests and the time window in milliseconds.
// type IRateLimitType = { maxRequest: number; windowMs: number; message?: string };

// const defaultMessage = "Too many attempts, please try again later!";

// export class RateLimiter {
//   // Create middleware to limit how often a user can make requests.
//   // Example: maxRequest: 5 and windowMs: 60 * 60 * 1000 allows 5 requests per hour.
//   static create = ({ maxRequest, windowMs, message = defaultMessage }: IRateLimitType) => {
//     return rateLimit({
//       max: maxRequest,
//       windowMs,
//       message,
//       standardHeaders: true, // Include rate limit information in response headers.
//       legacyHeaders: false, // Disable older rate limit headers.
//     });
//   };
// }
