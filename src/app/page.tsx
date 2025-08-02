import SimpleChatInterface from '../components/SimpleChatInterface';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export default async function Home() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('rizzler_session_id')?.value;

  if (!sessionId) {
    sessionId = crypto.randomBytes(32).toString('hex');
  }

  return (
    <div className="relative min-h-screen gradient-blue-teal">
      <SimpleChatInterface sessionId={sessionId} />
    </div>
  );
} 