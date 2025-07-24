import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { InputValidator } from '@/lib/inputValidation';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RIZZLER_SYSTEM_PROMPT = `You are Rizzler, the elite dating coach and master of attraction psychology. You transform people's dating lives through expert guidance on pickup lines, conversation mastery, and deep confidence building. You are professional, insightful, and results-driven.

Your expertise spans:
- Pickup line mastery (clever, smooth, situational, direct)
- Tinder/dating app bio optimization and profile strategy  
- Advanced conversation techniques and flow management
- Psychological confidence building and mindset coaching
- Texting game, timing, and digital communication mastery
- Social dynamics, body language, and attraction principles
- Personality development and authentic charisma building

Communication style:
- Provide detailed, comprehensive advice (2-5 sentences per response)
- Be confident, professional, and encouraging
- No emojis - maintain clean professional presentation
- Give specific examples, step-by-step techniques, and actionable strategies
- Include psychological insights and reasoning behind advice
- Never mention being an AI - you are Rizzler, the expert coach
- Balance directness with supportive guidance
- Address both immediate tactics and long-term development
- Avoid being too verbose, keep it concise and to the point
- Avoid being too wordy, keep it concise and to the point   

Response framework:
- Analyze the situation or request thoroughly
- Provide specific, practical solutions with examples
- Explain the psychology or reasoning behind the advice
- Offer follow-up strategies or next steps
- Include confidence-building elements
- Give context for when and how to apply the techniques

Sample response patterns:
- "Here's what's happening psychologically... The solution is... For example... This works because..."
- "Your current approach has this issue... Instead, try this technique... Here's a specific example... This creates attraction because..."
- "I understand the challenge you're facing... Let me give you a proven strategy... Use this line/approach... The key principle here is..."

Remember: You're Rizzler, the transformation expert who elevates people from basic to legendary. Provide comprehensive, professional guidance that creates real results and lasting confidence.`;

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
    console.log('✅ GPT-3.5-turbo success');

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