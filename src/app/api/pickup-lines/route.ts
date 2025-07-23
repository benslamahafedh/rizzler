import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { InputValidator } from '@/lib/inputValidation';
import { requireAccess, AccessControlResult } from '@/lib/accessControl';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PICKUP_LINES_PROMPT = `You are Rizzler, the master of pickup lines. Generate creative, smooth, and confident pickup lines based on the user's request.

Categories you specialize in:
- Clever/Witty: Smart wordplay and intelligent humor
- Smooth/Charming: Suave and sophisticated approaches
- Direct/Confident: Bold and straightforward lines
- Funny/Playful: Light-hearted and humorous approaches
- Situational: Context-specific lines for different scenarios
- Professional: Appropriate for workplace or formal settings

Guidelines:
- Keep lines respectful and tasteful
- Focus on confidence and charisma
- Avoid anything offensive or inappropriate
- Make them memorable and conversation-starting
- Provide 3-5 lines per request
- No emojis - maintain professional tone
- Include brief usage tips when helpful

Format your response as numbered lines with optional context notes.

Examples:
1. "Are you a magician? Because whenever I look at you, everyone else disappears."
2. "I must be a snowflake, because I've fallen for you."
3. "Do you have a map? I just got lost in your eyes."

Remember: You're helping build genuine confidence and connection, not just delivering lines.`;

export const POST = requireAccess(async (req: NextRequest, accessResult: AccessControlResult) => {
  try {
    console.log('📝 Pickup Lines API Route called');
    
    // SECURITY FIX: Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimit = InputValidator.checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        success: false, 
        error: 'Rate limit exceeded. Please try again later.' 
      }, { status: 429 });
    }
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key is not configured');
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { category, context, sessionId } = body;
    
    // Validate session ID from body matches access control
    if (sessionId !== accessResult.sessionId) {
      console.error('❌ Session ID mismatch in pickup lines API');
      return NextResponse.json({ error: 'Session ID mismatch' }, { status: 403 });
    }

    console.log('🔐 Pickup lines access granted for session:', accessResult.sessionId?.substring(0, 8) + '...');

    // Validate input
    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const categoryValidation = InputValidator.validateChatMessage(category);
    if (!categoryValidation.isValid) {
      return NextResponse.json({ error: categoryValidation.error }, { status: 400 });
    }

    // Build the request message
    let requestMessage = `Generate ${categoryValidation.sanitized} pickup lines`;
    if (context) {
      const contextValidation = InputValidator.validateChatMessage(context);
      if (contextValidation.isValid) {
        requestMessage += ` for ${contextValidation.sanitized}`;
      }
    }

    const messages = [
      { role: 'system', content: PICKUP_LINES_PROMPT },
      { role: 'user', content: requestMessage }
    ];

    console.log('🤖 Calling OpenAI for pickup lines...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: 0.9, // Higher creativity for pickup lines
      max_tokens: 400,
      presence_penalty: 0.2,
      frequency_penalty: 0.1,
    });

    const response = completion.choices[0]?.message?.content;
    console.log('📤 Pickup lines response:', response);

    if (!response) {
      console.error('❌ No response from OpenAI');
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pickupLines: response.trim(),
      category: categoryValidation.sanitized,
      accessInfo: {
        reason: accessResult.reason,
        trialExpiresAt: accessResult.trialExpiresAt,
        accessExpiresAt: accessResult.accessExpiresAt
      }
    });

  } catch (error: unknown) {
    console.error('Pickup Lines API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}); 