import { randomUUID } from "crypto";
import { connectRedis, redisClient } from "../database/RedisClient";

// A session lasts 1 hour. Redis deletes the key automatically when the time is up.
const SESSION_TTL_SECONDS = 60 * 60;

// Key looks like: session:<sessionId>  -> value: userId
const sessionKey = (sessionId: string) => `session:${sessionId}`;

class SessionService {
  static async create(userId: string): Promise<string> {
    await connectRedis();
    const sessionId = randomUUID();
    await redisClient.set(sessionKey(sessionId), userId, { EX: SESSION_TTL_SECONDS });
    return sessionId;
  }

  // Returns the userId, or null when the session is missing or expired.
  static async getUserId(sessionId: string): Promise<string | null> {
    await connectRedis();
    return redisClient.get(sessionKey(sessionId));
  }

  static async delete(sessionId: string): Promise<void> {
    await connectRedis();
    await redisClient.del(sessionKey(sessionId));
  }
}

export default SessionService;
