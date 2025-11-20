// app/lib/rate-limit.ts
// Simple rate limiting implementation

interface RateLimitConfig {
  interval: number; // in milliseconds
  uniqueTokenPerInterval: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(config: RateLimitConfig) {
  return {
    async check(limit: number, token: string): Promise<void> {
      const now = Date.now();
      const key = token;
      
      // Clean up expired entries
      if (store[key] && now > store[key].resetTime) {
        delete store[key];
      }
      
      // Initialize or get current count
      if (!store[key]) {
        store[key] = {
          count: 0,
          resetTime: now + config.interval,
        };
      }
      
      // Check if limit exceeded
      if (store[key].count >= limit) {
        throw new Error('Rate limit exceeded');
      }
      
      // Increment count
      store[key].count++;
    }
  };
}
