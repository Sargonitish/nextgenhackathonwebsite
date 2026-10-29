interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(key, newRecord);
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: newRecord.resetAt,
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    memoryStore.forEach((record, key) => {
      if (now > record.resetAt) {
        memoryStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}
