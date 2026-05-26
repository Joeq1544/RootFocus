import { SignJWT, jwtVerify } from 'jose'

export interface JwtPayload {
  userId: string
  email: string
}

const secret = () => {
  const key = process.env.JWT_SECRET
  if (!key) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(key)
}

/**
 * Signs a JWT with the given payload and a 7-day expiry.
 * Uses JWT_SECRET from environment variables.
 */
export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret())
}

/**
 * Verifies a JWT and returns the typed payload.
 * Throws if the token is invalid or expired.
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secret())
  return payload as unknown as JwtPayload
}

/**
 * Extracts the rootfocus-token value from the Cookie header of a Request.
 * Returns null if the cookie is absent.
 */
export function getTokenFromCookies(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('rootfocus-token='))
  if (!match) return null
  return match.split('=').slice(1).join('=') || null
}

/**
 * Reads the auth cookie from the request, verifies the JWT, and returns the
 * decoded payload. Returns null if the cookie is missing or the token invalid.
 */
export async function getAuthUser(request: Request): Promise<JwtPayload | null> {
  const token = getTokenFromCookies(request)
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}
