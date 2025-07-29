import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { InputValidator } from '@/lib/inputValidation';
import { requireAccess, AccessControlResult } from '@/lib/accessControl';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TINDER_BIO_PROMPT = `You are Rizzler, the expert in creating magnetic Tinder bios that get matches. Create compelling, authentic bios that showcase personality and attract the right people.

Bio Optimization Principles:
- Lead with your most interesting/unique trait
- Include conversation starters or hooks
- Show personality without trying too hard
- Balance confidence with approachability
- Keep it concise but memorable
- Add subtle humor when appropriate
- Include interests/hobbies that spark connection
- Avoid clichés and overused phrases

Bio Types:
- Adventurous: Travel, outdoors, spontaneous
- Professional: Career-focused, ambitious, polished
- Creative: Artistic, unique, expressive
- Humorous: Witty, playful, entertaining
- Intellectual: Thoughtful, deep, conversation-focused
- Athletic: Fitness, sports, active lifestyle
- Casual: Laid-back, easy-going, fun

Guidelines:
- Length: 2-4 sentences or bullet points
- No emojis - maintain clean professional look
- Focus on what makes them unique
- Include 1-2 conversation hooks
- Avoid negativity or what you don't want
- Make it authentic to their personality
- Include a subtle call-to-action

Format: Provide 2-3 bio variations with brief explanations.`;

export const POST = requireAccess(async (req: NextRequest, accessResult: AccessControlResult) => {
  try {
    console.log('💼 Tinder Bio API Route called');
    
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
    const { personality, interests, age, profession, style, sessionId } = body;
    
    // Validate session ID from body matches access control
    if (sessionId !== accessResult.sessionId) {
      console.error('❌ Session ID mismatch in Tinder bio API');
      return NextResponse.json({ error: 'Session ID mismatch' }, { status: 403 });
    }

    console.log('🔐 Tinder bio access granted for session:', accessResult.sessionId?.substring(0, 8) + '...');

    // Build the request message
    let requestMessage = 'Create optimized Tinder bios';
    
    const details = [];
    if (personality) {
      const personalityValidation = InputValidator.validateChatMessage(personality);
      if (personalityValidation.isValid) {
        details.push(`personality: ${personalityValidation.sanitized}`);
      }
    }
    
    if (interests) {
      const interestsValidation = InputValidator.validateChatMessage(interests);
      if (interestsValidation.isValid) {
        details.push(`interests: ${interestsValidation.sanitized}`);
      }
    }
    
    if (profession) {
      const professionValidation = InputValidator.validateChatMessage(profession);
      if (professionValidation.isValid) {
        details.push(`profession: ${professionValidation.sanitized}`);
      }
    }
    
    if (age) {
      const ageValidation = InputValidator.validateChatMessage(age.toString());
      if (ageValidation.isValid) {
        details.push(`age: ${ageValidation.sanitized}`);
      }
    }
    
    if (style) {
      const styleValidation = InputValidator.validateChatMessage(style);
      if (styleValidation.isValid) {
        details.push(`style: ${styleValidation.sanitized}`);
      }
    }

    if (details.length > 0) {
      requestMessage += ` for someone with ${details.join(', ')}`;
    }

    const messages = [
      { role: 'system', content: TINDER_BIO_PROMPT },
      { role: 'user', content: requestMessage }
    ];

    console.log('🤖 Calling OpenAI for Tinder bio...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: 0.8, // Good creativity but not too random
      max_tokens: 500,
      presence_penalty: 0.1,
      frequency_penalty: 0.2, // Avoid repetitive phrases
    });

    const response = completion.choices[0]?.message?.content;
    console.log('📤 Tinder bio response:', response);

    if (!response) {
      console.error('❌ No response from OpenAI');
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bios: response.trim(),
      accessInfo: {
        reason: accessResult.reason
      }
    });

  } catch (error: unknown) {
    console.error('Tinder Bio API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}); 