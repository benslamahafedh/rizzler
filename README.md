# Rizzler - Elite Dating Coach

A simplified text-based AI dating coach that provides expert advice on pickup lines, conversation mastery, and confidence building.

## Features

- **Text-based chat interface** - Clean, modern UI for seamless conversation
- **5-minute daily limit** - Free daily access with automatic reset
- **Expert dating advice** - Specialized in pickup lines, profile optimization, and social dynamics
- **No microphone required** - Pure text-based interaction
- **No payments** - Completely free with daily usage limits
- **Mobile optimized** - Works perfectly on all devices

## How It Works

1. **Start chatting** - Click "Start Elite Coaching" to begin
2. **Ask questions** - Get advice on pickup lines, dating profiles, conversation techniques
3. **Daily limit** - 5 minutes of free time per day, resets at midnight
4. **Expert guidance** - Receive professional dating advice and strategies

## Quick Start

### Prerequisites

- Node.js 18+ 
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd samantha-voice-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   Create a `.env.local` file:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### For Users

1. **Open the app** - You'll see the Rizzler welcome screen
2. **Start coaching** - Click "Start Elite Coaching" to begin your session
3. **Ask questions** - Type your dating challenges or questions
4. **Get advice** - Receive expert guidance on pickup lines, profiles, and more
5. **Daily limit** - You get 5 minutes per day, resets at midnight

### Example Questions

- "Generate some killer pickup lines for a coffee shop"
- "Help me optimize my Tinder bio"
- "How do I keep a conversation flowing naturally?"
- "What are some advanced flirting techniques?"
- "How do I build unshakeable confidence?"

## Technical Details

### Architecture

- **Frontend**: Next.js 14 with React
- **Backend**: Next.js API routes
- **AI**: OpenAI GPT-4o-mini
- **Database**: In-memory storage (replace with PostgreSQL/MongoDB in production)
- **Styling**: CSS-in-JS with custom design system

### Key Components

- `SimpleChatInterface.tsx` - Main chat interface
- `sessionManager.ts` - Daily limit management
- `database.ts` - User session storage
- `chat/route.ts` - AI conversation API

### Daily Limit System

- **5 minutes per day** - Tracks usage in milliseconds
- **Automatic reset** - Resets at midnight local time
- **Session persistence** - Remembers usage across browser sessions
- **Local storage** - Uses localStorage for client-side tracking

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # AI conversation endpoint
│   │   └── session/       # Session management
│   ├── page.tsx           # Main page
│   └── layout.tsx         # App layout
├── components/
│   └── SimpleChatInterface.tsx  # Main chat component
└── lib/
    ├── database.ts        # User data management
    ├── sessionManager.ts  # Session handling
    └── inputValidation.ts # Security validation
```

### Adding Features

1. **New chat features** - Modify `SimpleChatInterface.tsx`
2. **API endpoints** - Add routes in `src/app/api/`
3. **Database changes** - Update `database.ts` and `sessionManager.ts`
4. **Styling** - Update CSS-in-JS styles in components

### Production Deployment

1. **Database** - Replace in-memory storage with PostgreSQL/MongoDB
2. **Environment** - Set production environment variables
3. **Deploy** - Deploy to Vercel, Railway, or your preferred platform

## Security

- **Input validation** - All user inputs are sanitized
- **Rate limiting** - API endpoints are rate-limited
- **Session validation** - Secure session management
- **No sensitive data** - No personal information stored

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub.