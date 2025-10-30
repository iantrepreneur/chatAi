import express from 'express';
import db from '../config/database.js';
import { getOAuth2Client } from '../utils/google.js';

const router = express.Router();

router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/chat?error=missing_params`);
    }

    const userId = parseInt(state, 10);

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    const expiresAt = new Date(tokens.expiry_date);
    const scopes = tokens.scope || '';

    const existingIntegration = db.prepare(
      'SELECT id FROM integrations WHERE user_id = ? AND provider = ?'
    ).get(userId, 'google');

    if (existingIntegration) {
      db.prepare(`
        UPDATE integrations
        SET access_token = ?, refresh_token = ?, expires_at = ?, scopes = ?
        WHERE user_id = ? AND provider = ?
      `).run(
        tokens.access_token,
        tokens.refresh_token || null,
        expiresAt.toISOString(),
        scopes,
        userId,
        'google'
      );
    } else {
      db.prepare(`
        INSERT INTO integrations (user_id, provider, access_token, refresh_token, expires_at, scopes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        'google',
        tokens.access_token,
        tokens.refresh_token || null,
        expiresAt.toISOString(),
        scopes
      );
    }

    res.redirect(`${process.env.FRONTEND_URL}/chat?integration=success`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/chat?error=integration_failed`);
  }
});

export default router;
