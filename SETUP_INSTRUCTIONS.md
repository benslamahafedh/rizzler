# Rizzler - Setup Instructions

## Overview
Rizzler is a simplified text-based AI dating coach with a 5-minute daily limit system. No microphone or payment functionality required.

## Key Features
- **5-minute daily limit** for each unique device/browser
- **Text-based chat interface** - no microphone required
- **Automatic daily reset** at midnight
- **Session persistence** across page refreshes
- **No payments** - completely free with usage limits

## Setup Steps

### 1. Environment Variables
Create a `.env.local` file in the root directory with the following:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Daily Limit System Details

#### How It Works:
1. **First Visit**: Users get 5 minutes of free time per day
2. **Session Tracking**: Uses localStorage for daily usage tracking
3. **Timer Display**: Shows countdown in top-right corner during chat
4. **Daily Reset**: Automatically resets at midnight local time
5. **Session End**: Automatic termination when daily limit is reached

#### Session Data Structure:
- Unique device ID based on browser fingerprint
- Daily time used (persists across sessions)
- Last used date for daily reset logic
- Session ID for server-side validation

### 4. Testing

#### Test Daily Limit:
1. Open the app in a new browser/incognito window
2. Click "Start Elite Coaching" to begin
3. Watch the 5-minute countdown
4. Session will end automatically when limit is reached

#### Test Daily Reset:
1. Use the app until daily limit is reached
2. Wait until after midnight (or manually change date)
3. Refresh the page
4. You should have 5 minutes available again

## Development

### Key Files:
- `src/components/SimpleChatInterface.tsx` - Main chat interface
- `src/lib/sessionManager.ts` - Daily limit management
- `src/lib/database.ts` - User session storage
- `src/app/api/chat/route.ts` - AI conversation endpoint
- `src/app/api/session/route.ts` - Session management

### Daily Limit Implementation:
- **Client-side**: localStorage tracks daily usage
- **Server-side**: Database validates and enforces limits
- **Reset logic**: Automatic reset at midnight local time
- **Usage tracking**: 30 seconds per chat interaction

### Customization:
- **Change daily limit**: Modify `DAILY_LIMIT` in `sessionManager.ts`
- **Adjust usage per interaction**: Change the 30-second value in `chat/route.ts`
- **Modify reset time**: Update the date comparison logic

## Production Deployment

### Environment Setup:
1. Set `OPENAI_API_KEY` in your production environment
2. Replace in-memory database with PostgreSQL/MongoDB
3. Configure proper session storage

### Database Migration:
For production, replace the in-memory database with a real database:
- Update `database.ts` to use your preferred database
- Implement proper session cleanup
- Add database connection pooling

## Troubleshooting

### Common Issues:
1. **Daily limit not resetting**: Check browser's date/time settings
2. **Session not persisting**: Ensure localStorage is enabled
3. **API errors**: Verify OpenAI API key is valid
4. **Rate limiting**: Check API usage limits

### Debug Mode:
Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Security Notes

- All user inputs are validated and sanitized
- Rate limiting is implemented on API endpoints
- No sensitive personal data is stored
- Session IDs are cryptographically secure 