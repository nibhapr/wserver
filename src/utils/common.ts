import crypto from 'crypto';
export const verifyHmacSha256 = (secret: string, payload: any, providedHmac: string) => {
    // Create HMAC from the secret and the payload using SHA-256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload, 'utf8');
    const computedHmac = hmac.digest('hex'); // or 'hex' if you prefer

    // Use timingSafeEqual to compare the HMACs and prevent timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(providedHmac, 'base64'),
        Buffer.from(computedHmac, 'hex')
    );
}