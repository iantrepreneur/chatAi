# ChatAI Pro - Claude.ai Clone with Google Integrations

A modern chat application powered by Google Gemini AI with integrated Google Drive and Gmail search capabilities.

## Features

- **AI Chat**: Powered by Google Gemini AI for intelligent conversations
- **Google Drive Integration**: Search and reference files from your Drive
- **Gmail Integration**: Search and reference emails in conversations
- **Authentication**: Secure JWT-based authentication
- **Conversation History**: Save and manage multiple chat conversations
- **Markdown Support**: Rich text formatting in AI responses
- **Source Citations**: Automatic linking to relevant Drive files and emails
- **Responsive Design**: Modern, clean UI inspired by Claude.ai

## Tech Stack

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- JWT authentication
- Google APIs (Drive, Gmail, Gemini)

### Frontend
- React + TypeScript
- Vite
- TailwindCSS
- React Router
- React Markdown

## Installation

### Prerequisites

- Node.js 18+ installed
- Google Cloud Project with OAuth credentials
- Gemini API key

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

### 2. Configure Backend Environment

Create `backend/.env` file:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./database/chatai.db

JWT_SECRET=your-super-secret-jwt-key-change-this

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

GEMINI_API_KEY=your-gemini-api-key
```

### 3. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs: Google Drive API, Gmail API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy to `.env` as `GEMINI_API_KEY`

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3001`

### Start Frontend Development Server

```bash
# In project root
npm run dev
```

Frontend will run on `http://localhost:5173`

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Start Chatting**: Create a new conversation and start asking questions
3. **Connect Google**: Click "Integrations" to connect your Google account
4. **Enhanced Responses**: Once connected, the AI will search Drive and Gmail for relevant context

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Conversations
- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation with messages
- `DELETE /api/conversations/:id` - Delete conversation

### Chat
- `POST /api/chat` - Send message and get AI response

### Integrations
- `GET /api/google/auth-url` - Get Google OAuth URL
- `GET /auth/google/callback` - OAuth callback handler
- `GET /api/integrations` - List user integrations
- `DELETE /api/integrations/:provider` - Remove integration

## Database Schema

### users
- id, email, password, created_at

### conversations
- id, user_id, title, created_at, updated_at

### messages
- id, conversation_id, role, content, sources, created_at

### integrations
- id, user_id, provider, access_token, refresh_token, expires_at, scopes, created_at

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- OAuth 2.0 for Google integration
- Read-only access to Google services
- CORS protection
- SQL injection prevention with prepared statements

## Development Notes

- Backend uses `--watch` flag for hot reload
- Frontend uses Vite's HMR
- Database auto-initializes on first run
- SQLite database stored in `backend/database/`

## Production Deployment

1. Set strong `JWT_SECRET` in production environment
2. Update `FRONTEND_URL` to production domain
3. Update Google OAuth redirect URI in Google Cloud Console
4. Use environment variables for all secrets
5. Consider using PostgreSQL for production database
6. Enable HTTPS for all endpoints

## Troubleshooting

**Backend won't start:**
- Check Node.js version (18+)
- Ensure all environment variables are set
- Check if port 3001 is available

**Google integration fails:**
- Verify OAuth credentials in Google Cloud Console
- Check redirect URI matches exactly
- Ensure APIs are enabled in Google Cloud

**AI responses fail:**
- Verify Gemini API key is valid
- Check API quota limits
- Review backend logs for errors

## License

MIT

## Credits

Built with Google Gemini AI, inspired by Claude.ai
