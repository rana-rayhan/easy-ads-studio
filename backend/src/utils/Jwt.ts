import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../secrets/envSecret";

class Jwt {
  static signAccess({ userId }: { userId: string }) {
    return jwt.sign({ sub: userId }, JWT_ACCESS_SECRET, { expiresIn: "15m" });
  }

  static signRefresh({ userId }: { userId: string }) {
    return jwt.sign({ sub: userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  }

  // Both return the user id, or throw if the token is wrong or expired.
  static verifyAccess({ token }: { token: string }) {
    return String(jwt.verify(token, JWT_ACCESS_SECRET).sub);
  }

  static verifyRefresh({ token }: { token: string }) {
    return String(jwt.verify(token, JWT_REFRESH_SECRET).sub);
  }

  // The OAuth "state" proves who started the connect flow.
  // It uses a different secret, so it can never work as an access token.
  static signState({ userId }: { userId: string }) {
    return jwt.sign({ sub: userId }, `${JWT_ACCESS_SECRET}:google-oauth`, { expiresIn: "10m" });
  }

  static verifyState({ token }: { token: string }) {
    return String(jwt.verify(token, `${JWT_ACCESS_SECRET}:google-oauth`).sub);
  }
}

export default Jwt;
