'use client';

import { useEffect } from 'react';

export default function SessionEnded() {
  useEffect(() => {
    // Since the app is now completely free, redirect back to main page
    window.location.href = '/';
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
          <span className="text-white font-black text-xl">R</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Rizzler</h1>
        <p className="text-gray-300 mb-4">Redirecting you back to chat...</p>
        <div className="w-8 h-8 mx-auto border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </main>
  );
} 