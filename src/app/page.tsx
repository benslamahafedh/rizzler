'use client';

import { useState, useEffect } from 'react';
import RizzlerChatInterface from '@/components/RizzlerChatInterface';

export default function Home() {
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize simple session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Initialize server components first
        try {
          await fetch('/api/server-init');
        } catch (initError) {
          console.log('Server init failed (might already be initialized):', initError);
        }
        
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

  // Prevent mobile touch interference
  useEffect(() => {
    const preventSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };

    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    const preventPullToRefresh = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      const startY = touch.clientY;
      
      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        const currentY = touch.clientY;
        const diff = currentY - startY;
        
        if (diff > 0 && window.scrollY === 0) {
          e.preventDefault();
        }
      };
      
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      
      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchEnd);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventSelection);
    document.addEventListener('contextmenu', preventSelection);
    document.addEventListener('touchend', preventZoom);
    document.addEventListener('touchstart', preventPullToRefresh);

    return () => {
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventSelection);
      document.removeEventListener('contextmenu', preventSelection);
      document.removeEventListener('touchend', preventZoom);
      document.removeEventListener('touchstart', preventPullToRefresh);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden select-none">
      <div className="relative min-h-screen gradient-red-crimson">
        {/* Main Chat Interface */}
        <div className="h-screen">
          <RizzlerChatInterface sessionId={sessionId} />
        </div>
      </div>
    </main>
  );
} 