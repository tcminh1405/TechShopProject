/**
 * Client-side Rate Limiter
 * Implements Fault Tolerance requirement: Rate Limiter client (API call 1 service)
 *
 * Default: 100 requests per minute per endpoint group
 * Per-route overrides for endpoints that need tighter limits
 */

const ROUTE_LIMITS = {
    "/api/auth": {
        maxRequests: 10,
        windowMs: 60000
    }, // Auth: strict (10/min)
    "/api/payments": {
        maxRequests: 10,
        windowMs: 60000
    }, // Payment: strict (10/min)
    "/api/orders": {
        maxRequests: 30,
        windowMs: 60000
    }, // Orders: moderate (30/min)
    "/api/users": {
        maxRequests: 30,
        windowMs: 60000
    }, // Users: moderate (30/min)
    "default": {
        maxRequests: 100,
        windowMs: 60000
    }, // Products, categories, banners, etc: relaxed (100/min)
};

class RateLimiter {
    constructor() {
        this.requests = new Map(); // key -> array of timestamps
    }

    /**
     * Get limit config for an endpoint
     * @param {string} endpoint
     * @returns {{ maxRequests: number, windowMs: number }}
     */
    getLimitConfig(endpoint) {
        const key = this.getKey(endpoint);
        for (const [prefix, config] of Object.entries(ROUTE_LIMITS)) {
            if (prefix !== "default" && key.startsWith(prefix)) {
                return config;
            }
        }
        return ROUTE_LIMITS["default"];
    }

    /**
     * Check if request is allowed
     * @param {string} endpoint - API endpoint
     * @returns {boolean} - true if allowed, false if rate limited
     */
    isAllowed(endpoint) {
        const now = Date.now();
        const key = this.getKey(endpoint);
        const {
            maxRequests,
            windowMs
        } = this.getLimitConfig(endpoint);

        // Get existing requests for this endpoint
        let timestamps = this.requests.get(key) || [];

        // Remove old timestamps outside the window
        timestamps = timestamps.filter((timestamp) => now - timestamp < windowMs);

        // Check if limit exceeded
        if (timestamps.length >= maxRequests) {
            console.warn(
                `[Rate Limiter] Request blocked for ${endpoint}. Limit: ${maxRequests} requests per ${windowMs / 1000}s`
            );
            return false;
        }

        // Add current timestamp
        timestamps.push(now);
        this.requests.set(key, timestamps);

        return true;
    }

    /**
     * Get remaining requests for an endpoint
     * @param {string} endpoint - API endpoint
     * @returns {number} - remaining requests
     */
    getRemaining(endpoint) {
        const now = Date.now();
        const key = this.getKey(endpoint);
        const {
            maxRequests,
            windowMs
        } = this.getLimitConfig(endpoint);
        const timestamps = this.requests.get(key) || [];

        const validTimestamps = timestamps.filter(
            (timestamp) => now - timestamp < windowMs
        );

        return Math.max(0, maxRequests - validTimestamps.length);
    }

    /**
     * Get time until rate limit resets
     * @param {string} endpoint - API endpoint
     * @returns {number} - milliseconds until reset
     */
    getResetTime(endpoint) {
        const now = Date.now();
        const key = this.getKey(endpoint);
        const {
            windowMs
        } = this.getLimitConfig(endpoint);
        const timestamps = this.requests.get(key) || [];

        if (timestamps.length === 0) {
            return 0;
        }

        const oldestTimestamp = Math.min(...timestamps);
        const resetTime = oldestTimestamp + windowMs - now;

        return Math.max(0, resetTime);
    }

    /**
     * Clear rate limit for an endpoint
     * @param {string} endpoint - API endpoint
     */
    clear(endpoint) {
        const key = this.getKey(endpoint);
        this.requests.delete(key);
    }

    /**
     * Clear all rate limits
     */
    clearAll() {
        this.requests.clear();
    }

    /**
     * Get normalized key for endpoint (strips query params)
     * @param {string} endpoint - API endpoint
     * @returns {string} - normalized key
     */
    getKey(endpoint) {
        return endpoint.split("?")[0].toLowerCase();
    }
}

// Singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;