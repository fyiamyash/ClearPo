import IORedis from "ioredis";
export const redisConnection = new IORedis({ maxRetriesPerRequest: null });

export const connectionForBullmq = redisConnection.duplicate();
export const liveEventPublisher = redisConnection.duplicate();
export const liveEventSubscriber = redisConnection.duplicate();
