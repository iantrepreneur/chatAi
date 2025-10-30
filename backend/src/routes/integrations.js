import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { getOAuth2Client } from '../utils/google.js';

const router = express.Router();

router.get('/google/auth-url', authenticateToken, (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();

    const scopes = [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: req.user.userId.toString(),
      prompt: 'consent',
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Generate auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

router.get('/integrations', authenticateToken, (req, res) => {
  try {
    const integrations = db.prepare(
      'SELECT id, provider, scopes, created_at FROM integrations WHERE user_id = ?'
    ).all(req.user.userId);

    res.json({ integrations });
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Failed to get integrations' });
  }
});

router.delete('/integrations/:provider', authenticateToken, (req, res) => {
  try {
    const { provider } = req.params;

    db.prepare('DELETE FROM integrations WHERE user_id = ? AND provider = ?').run(
      req.user.userId,
      provider
    );

    res.json({ message: 'Integration removed successfully' });
  } catch (error) {
    console.error('Delete integration error:', error);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
});

export default router;
