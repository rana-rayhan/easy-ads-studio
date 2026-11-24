import { connect, Channel } from "amqplib";
import { RABBITMQ_URL } from "../secrets/envSecret";

let connection: Awaited<ReturnType<typeof connect>> | null = null;
let channel: Channel | null = null;

// Connect once and share one channel. No queues are created here.
export const getChannel = async (): Promise<Channel> => {
  if (channel) return channel;

  connection = await connect(RABBITMQ_URL);
  connection.on("error", (error) => console.error("RabbitMQ error:", error));
  channel = await connection.createChannel();

  console.log("***--- RabbitMQ connection established");
  return channel;
};

export const closeRabbit = async (): Promise<void> => {
  if (channel) await channel.close();
  if (connection) await connection.close();
  channel = null;
  connection = null;
  console.log("***--- RabbitMQ connection closed");
};
