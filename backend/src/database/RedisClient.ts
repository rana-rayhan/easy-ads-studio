/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createClient } from "redis";
import { REDIS_URL } from "../secrets/envSecret";

export const redisClient = createClient({ url: REDIS_URL });

redisClient.on("error", (error) => console.error("Redis error:", error));

export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("***--- Redis connection established");
  }
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    await redisClient.quit();
    console.log("***--- Redis connection closed");
  }
};
