import type { NextApiRequest, NextApiResponse } from 'next';
import {
  adminSessionCookie,
  clearAdminSessionCookie,
  createAdminSession,
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from '../../../lib/admin-session';
import { verifyAdminCredentials } from '../../../lib/site-data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.ADMIN_AI_SECRET;
  if (!secret) return res.status(503).json({ error: 'Admin AI sessions are not configured in Vercel.' });

  if (req.method === 'GET') {
    return res.status(200).json({ authenticated: verifyAdminSession(req.cookies[ADMIN_SESSION_COOKIE], secret) });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearAdminSessionCookie());
    return res.status(200).json({ authenticated: false });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const email = String(req.body?.email || '');
  const password = String(req.body?.password || '');
  if (!(await verifyAdminCredentials(email, password))) {
    return res.status(401).json({ error: 'Invalid Admin username or password.' });
  }

  res.setHeader('Set-Cookie', adminSessionCookie(createAdminSession(email, secret)));
  return res.status(200).json({ authenticated: true });
}
