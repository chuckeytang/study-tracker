import Redis from "ioredis";

type MemoryVerificationCodeEntry = {
  code: string;
  expiresAt: number;
};

const memoryVerificationCodes = new Map<string, MemoryVerificationCodeEntry>();
const REDIS_CONNECT_TIMEOUT_MS = 750;

let hasLoggedMemoryFallback = false;

function canUseMemoryFallback() {
  return process.env.NODE_ENV !== "production";
}

function logMemoryFallback(reason: unknown) {
  if (hasLoggedMemoryFallback) return;

  const message =
    reason instanceof Error ? reason.message : String(reason ?? "unknown error");
  console.warn(
    `[Verification Code Store] Redis unavailable, using in-memory fallback: ${message}`,
  );
  hasLoggedMemoryFallback = true;
}

function pruneMemoryVerificationCode(key: string) {
  const entry = memoryVerificationCodes.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    memoryVerificationCodes.delete(key);
    return null;
  }

  return entry.code;
}

async function runRedisCommand<T>(
  operation: (client: Redis) => Promise<T>,
): Promise<T | undefined> {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    if (canUseMemoryFallback()) {
      logMemoryFallback("REDIS_URL is not configured");
      return undefined;
    }

    throw new Error("REDIS_URL is not configured");
  }

  const client = new Redis(redisUrl, {
    connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
    enableOfflineQueue: false,
    lazyConnect: false,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });

  client.on("error", () => undefined);

  try {
    return await operation(client);
  } catch (error) {
    if (canUseMemoryFallback()) {
      logMemoryFallback(error);
      return undefined;
    }

    throw error;
  } finally {
    client.disconnect();
  }
}

export function buildVerificationCodeKey(type: string, email: string) {
  return `verify:${type}:${email}`;
}

export async function setVerificationCode(
  key: string,
  code: string,
  ttlSeconds = 300,
): Promise<"redis" | "memory"> {
  const redisResult = await runRedisCommand((client) =>
    client.set(key, code, "EX", ttlSeconds),
  );

  if (redisResult !== undefined) {
    memoryVerificationCodes.delete(key);
    return "redis";
  }

  if (!canUseMemoryFallback()) {
    throw new Error("Verification code storage is unavailable");
  }

  memoryVerificationCodes.set(key, {
    code,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  return "memory";
}

export async function getVerificationCode(key: string): Promise<string | null> {
  const memoryCode = pruneMemoryVerificationCode(key);
  if (memoryCode) {
    return memoryCode;
  }

  const redisResult = await runRedisCommand((client) => client.get(key));
  return redisResult ?? null;
}

export async function deleteVerificationCode(key: string): Promise<void> {
  memoryVerificationCodes.delete(key);
  await runRedisCommand((client) => client.del(key));
}
