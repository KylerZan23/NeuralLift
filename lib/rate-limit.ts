type RateLimitOptions = {
  key: string;
  limit: number;
  windowSeconds: number;
};

const memoryCounter: Map<string, { count: number; expiresAt: number }> = new Map();

async function tryUpstash(opts: RateLimitOptions): Promise<boolean | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const nowSec = Math.floor(Date.now() / 1000);
    const expireAt = nowSec + opts.windowSeconds;
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', opts.key],
        ['EXPIRE', opts.key, String(opts.windowSeconds), 'NX'],
        ['GET', opts.key],
        ['EXPIREAT', `${opts.key}:exp`, String(expireAt)],
      ])
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Pipeline returns array of results; the third command 'GET' returns string count
    const countStr = Array.isArray(data) && data.length >= 3 ? data[2]?.result ?? data[2] : null;
    const count = Number(countStr);
    if (!Number.isFinite(count)) return null;
    return count <= opts.limit;
  } catch {
    return null;
  }
}

function tryMemory(opts: RateLimitOptions): boolean {
  const now = Date.now();
  const entry = memoryCounter.get(opts.key);
  if (!entry || entry.expiresAt <= now) {
    memoryCounter.set(opts.key, { count: 1, expiresAt: now + opts.windowSeconds * 1000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= opts.limit;
}

export async function isAllowedAndConsume(opts: RateLimitOptions): Promise<boolean> {
  const upstash = await tryUpstash(opts);
  if (typeof upstash === 'boolean') return upstash;
  return tryMemory(opts);
}


