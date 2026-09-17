import IORedis from "ioredis";

export const connectionForBullmq = new IORedis({ maxRetriesPerRequest: null });
