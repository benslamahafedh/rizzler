import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { InputValidator } from '@/lib/inputValidation';
import { Database } from '@/lib/database';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RIZZLER_SYSTEM_PROMPT = `You're Rizzler, the smooth-talking wingman who's got that natural rizz. You're not some boring dating coach - you're the guy who knows exactly what to say and when to say it. Keep it real, keep it short, and keep it smooth.

Your vibe:
- Drop fire pickup lines that actually work
- Keep responses short and punchy (1-2 sentences max)
- Sound human and natural, not like a textbook
- Use casual, confident language with that rizz energy
- No robotic advice - just straight game
- Be cool, be real, be smooth

When someone asks for a pickup line, give them something they can use RIGHT NOW. No long explanations, no psychology lessons. Just pure rizz.

Example responses:
- "Try this: 'Hey, I was gonna go get coffee but I'd rather get to know you instead.' Simple, smooth, works."
- "Walk up and say 'I'm not usually this forward, but I had to meet you.' Confidence is everything."
- "Text her: 'You know what's cute? You.' Short, sweet, shows interest."

Remember: You're the guy who makes dating look easy. Keep it simple, keep it smooth, keep it real.`;

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Chat API Route called');
    
    // SECURITY FIX: Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimit = InputValidator.checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        success: false, 
        error: 'Rate limit exceeded. Please try again later.' 
      }, { status: 429 });
    }
    
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key is not configured');
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    // Parse request body to get session ID and message
    const body = await req.json();
    const { message, conversationHistory = [], sessionId } = body;
    
    console.log('📥 Received message:', message);
    console.log('📜 Conversation history length:', conversationHistory.length);
    console.log('🔐 Session ID:', sessionId?.substring(0, 8) + '...');

    // SECURITY FIX: Input validation
    if (!message) {
      console.error('❌ No message provided');
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const messageValidation = InputValidator.validateChatMessage(message);
    if (!messageValidation.isValid) {
      console.error('❌ Invalid message:', messageValidation.error);
      return NextResponse.json({ error: messageValidation.error }, { status: 400 });
    }

    // Ensure sanitized message is not null
    if (!messageValidation.sanitized || messageValidation.sanitized.trim().length === 0) {
      console.error('❌ Sanitized message is empty or null');
      return NextResponse.json({ error: 'Message content is invalid' }, { status: 400 });
    }

    // Check daily limit
    if (sessionId) {
      const database = Database.getInstance();
      const accessResult = await database.hasAccess(sessionId);
      
      if (!accessResult.hasAccess) {
        return NextResponse.json({ 
          success: false, 
          error: 'Daily limit reached. Please try again tomorrow.' 
        }, { status: 403 });
      }
    }

    // SECURITY FIX: Sanitize conversation history (limit to last 3 exchanges for speed)
    let sanitizedHistory = [];
    try {
      sanitizedHistory = InputValidator.sanitizeConversationHistory(
        conversationHistory.slice(-6) // Only last 3 exchanges (6 messages)
      );
    } catch (error) {
      console.warn('⚠️ Error sanitizing conversation history, using empty history:', error);
      sanitizedHistory = [];
    }

    // Filter out any messages with null or empty content
    const validHistory = sanitizedHistory.filter(msg => 
      msg && msg.content && typeof msg.content === 'string' && msg.content.trim().length > 0
    );

    const messages = [
      { role: 'system', content: RIZZLER_SYSTEM_PROMPT },
      ...validHistory,
      { role: 'user', content: messageValidation.sanitized! }
    ];

    console.log('🤖 Calling OpenAI...');
    console.log('📋 Message count:', messages.length);
    console.log('📝 Messages:', messages.map(m => ({ role: m.role, contentLength: m.content?.length || 0 })));
    
    // Use GPT-4o-mini for better quality responses
    console.log('🚀 Using GPT-4o-mini for quality...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: 0.8, // Good creativity for dating advice
      max_tokens: 500, // Longer responses for detailed advice
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });
    console.log('✅ GPT-4o-mini success');

    const response = completion.choices[0]?.message?.content;
    console.log('📤 OpenAI response:', response);

    if (!response) {
      console.error('❌ No response from OpenAI');
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    // Clean and validate the response
    let cleanResponse = response.trim();
    
    // Remove role indicators but keep full response
    cleanResponse = cleanResponse.replace(/^(User|Human|Assistant):\s*/i, ''); // Remove role prefixes
    
    // Ensure it's not empty
    if (!cleanResponse || cleanResponse.length < 2) {
      cleanResponse = "I'm listening.";
    }

    // Update daily usage (assume 30 seconds per interaction)
    if (sessionId) {
      const database = Database.getInstance();
      await database.updateDailyUsage(sessionId, 30 * 1000); // 30 seconds in milliseconds
    }

    console.log('✅ Clean response:', cleanResponse);
    return NextResponse.json({ 
      response: cleanResponse
    });
  } catch (error: unknown) {
    console.error('OpenAI API error:', error);
    
    // Provide more specific error messages
    const errorObj = error as { status?: number; message?: string };
    if (errorObj.status === 401) {
      return NextResponse.json({ error: 'Invalid OpenAI API key' }, { status: 500 });
    } else if (errorObj.status === 429) {
      return NextResponse.json({ error: 'OpenAI API rate limit exceeded' }, { status: 500 });
    } else if (errorObj.status === 402) {
      return NextResponse.json({ error: 'OpenAI API quota exceeded' }, { status: 500 });
    } else {
      return NextResponse.json({ 
        error: `OpenAI API error: ${errorObj.message || 'Unknown error'}` 
      }, { status: 500 });
    }
  }
} 