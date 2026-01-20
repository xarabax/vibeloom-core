const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

// Simple in-memory rate limiter
// Window: 60 seconds
// Max requests: 10
export function rateLimit(ip: string) {
    const windowMs = 60 * 1000
    const maxRequests = 10

    const now = Date.now()
    const record = rateLimitMap.get(ip) || { count: 0, lastReset: now }

    if (now - record.lastReset > windowMs) {
        record.count = 0
        record.lastReset = now
    }

    if (record.count >= maxRequests) {
        return { success: false }
    }

    record.count += 1
    rateLimitMap.set(ip, record)

    return { success: true }
}
