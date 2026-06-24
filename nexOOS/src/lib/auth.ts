import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// Resolve the secret lazily (at sign/verify time), not at module load: a load-time
// throw would crash `next build` and every test that imports this module, even though
// the secret is only needed when a token is actually signed or verified.
function getJwtSecret(): string {
  const secret = process.env.OOS_FRONTEND_JWT_SECRET;
  if (!secret) {
    throw new Error('OOS_FRONTEND_JWT_SECRET is not set. Refusing to sign/verify tokens with a default secret.');
  }
  return secret;
}
export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

type AuthPayload = {
  userId: string;
  email: string;
};

export function signAccessToken(payload: AuthPayload) {
  return jwt.sign({ ...payload, tokenType: 'access' }, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function signRefreshToken(payload: AuthPayload) {
  return jwt.sign({ ...payload, tokenType: 'refresh' }, getJwtSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

export function signToken(payload: AuthPayload) {
  return signAccessToken(payload);
}

type TokenPayload = jwt.JwtPayload & {
  tokenType?: string;
};

const isTokenPayload = (decoded: string | jwt.JwtPayload): decoded is TokenPayload =>
  typeof decoded !== 'string';

const decodeToken = (token: string) => {
  const decoded = jwt.verify(token, getJwtSecret());

  if (!isTokenPayload(decoded)) {
    return null;
  }

  return decoded;
};

export function verifyAccessToken(token: string) {
  try {
    const decoded = decodeToken(token);

    if (!decoded) {
      return null;
    }

    if (decoded.tokenType !== 'access') {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    const decoded = decodeToken(token);

    if (!decoded) {
      return null;
    }

    if (decoded.tokenType !== 'refresh') {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function verifyToken(token: string) {
  return verifyAccessToken(token) || verifyRefreshToken(token);
}

export function setRefreshTokenCookie(
  response: NextResponse,
  refreshToken: string
) {
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export function clearRefreshTokenCookie(response: NextResponse) {
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });

  return response;
}
