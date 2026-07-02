export class RateLimiter {
  private timestamps: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(id: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    let userTimestamps = this.timestamps.get(id) || [];
    userTimestamps = userTimestamps.filter(t => t > windowStart);
    
    if (userTimestamps.length >= this.maxRequests) {
      this.timestamps.set(id, userTimestamps);
      return false;
    }
    
    userTimestamps.push(now);
    this.timestamps.set(id, userTimestamps);
    return true;
  }
}
