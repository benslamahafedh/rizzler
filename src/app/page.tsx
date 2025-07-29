'use client';

import { useState, useEffect } from 'react';
import SimpleChatInterface from '@/components/SimpleChatInterface';

export default function Home() {
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize simple session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Try to get existing session from localStorage
        const existingSessionId = localStorage.getItem('rizzler_session_id');
        
        const response = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: existingSessionId })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setSessionId(data.sessionId);
          localStorage.setItem('rizzler_session_id', data.sessionId);
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
        // Generate a simple fallback session ID
        const fallbackSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        setSessionId(fallbackSessionId);
        localStorage.setItem('rizzler_session_id', fallbackSessionId);
      }
    };
    
    initializeSession();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden select-none">
      <div className="relative min-h-screen gradient-red-crimson">
        {/* Main Chat Interface */}
        <div className="h-screen">
          <SimpleChatInterface sessionId={sessionId} />
        </div>
      </div>
    </main>
  );
} 