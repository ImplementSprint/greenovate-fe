import { verifyAccessToken } from './auth';

export function getAdminFromRequest(request: Request): { userId: string; email: string } | null {
  const auth = request.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return null;
  // verifyAccessToken checks the signature + tokenType; never trust an unverified payload.
  const payload = verifyAccessToken(auth.slice(7));
  if (!payload?.isAdmin || !payload?.userId) return null;
  return { userId: payload.userId as string, email: payload.email as string };
}

export function requireAdmin(request: Request) {
  const user = getAdminFromRequest(request);
  if (!user) {
    return { user: null, error: Response.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user, error: null };
}
