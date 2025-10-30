import { google } from 'googleapis';
import db from '../config/database.js';

export const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

export const getAuthenticatedClient = async (userId) => {
  const integration = db.prepare(
    'SELECT * FROM integrations WHERE user_id = ? AND provider = ?'
  ).get(userId, 'google');

  if (!integration) {
    throw new Error('Google integration not found');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
    expiry_date: new Date(integration.expires_at).getTime(),
  });

  oauth2Client.on('tokens', (tokens) => {
    if (tokens.access_token) {
      const expiresAt = new Date(Date.now() + (tokens.expiry_date || 3600) * 1000);
      db.prepare(
        'UPDATE integrations SET access_token = ?, expires_at = ? WHERE user_id = ? AND provider = ?'
      ).run(tokens.access_token, expiresAt.toISOString(), userId, 'google');
    }
  });

  return oauth2Client;
};

export const searchGoogleDrive = async (oauth2Client, query, maxResults = 5) => {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.list({
    q: `fullText contains '${query}' and trashed=false`,
    fields: 'files(id, name, webViewLink, mimeType, modifiedTime)',
    pageSize: maxResults,
    orderBy: 'modifiedTime desc',
  });

  return response.data.files.map(file => ({
    title: file.name,
    url: file.webViewLink,
    type: 'drive',
    mimeType: file.mimeType,
    modifiedTime: file.modifiedTime,
  }));
};

export const searchGmail = async (oauth2Client, query, maxResults = 5) => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults,
  });

  if (!response.data.messages) {
    return [];
  }

  const messages = await Promise.all(
    response.data.messages.map(async (msg) => {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
      });

      const headers = details.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No subject';
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      return {
        title: subject,
        url: `https://mail.google.com/mail/u/0/#inbox/${msg.id}`,
        type: 'gmail',
        from,
        date,
      };
    })
  );

  return messages;
};
