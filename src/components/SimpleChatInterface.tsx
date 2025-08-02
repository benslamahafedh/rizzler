'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface SimpleChatInterfaceProps {
  sessionId: string;
}

export default function SimpleChatInterface({
  sessionId
}: SimpleChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (sessionStarted) {
      const checkDailyLimit = () => {
        const lastUsed = localStorage.getItem('rizzler_last_used');
        const timeUsed = parseInt(localStorage.getItem('rizzler_time_used') || '0');
        
        if (lastUsed) {
          const lastUsedDate = new Date(lastUsed);
          const today = new Date();
          
          if (lastUsedDate.toDateString() === today.toDateString()) {
            if (timeUsed >= 300) {
              setDailyLimitReached(true);
              return;
            }
            setTimeLeft(300 - timeUsed);
          } else {
            localStorage.setItem('rizzler_last_used', today.toISOString());
            localStorage.setItem('rizzler_time_used', '0');
            setTimeLeft(300);
            setDailyLimitReached(false);
          }
        } else {
          localStorage.setItem('rizzler_last_used', new Date().toISOString());
          localStorage.setItem('rizzler_time_used', '0');
        }
      };

      checkDailyLimit();
    }
  }, [sessionStarted]);

  useEffect(() => {
    if (sessionStarted && timeLeft > 0 && !dailyLimitReached) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setDailyLimitReached(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [sessionStarted, timeLeft, dailyLimitReached]);

  const handleStartChat = () => {
    setSessionStarted(true);
    const welcomeMessage: Message = {
      role: 'assistant',
      content: "Yo! I'm Rizzler, your wingman for life! 🚀 Ready to level up your game? You've got 5 minutes of pure rizz training. What's your move?",
      timestamp: Date.now()
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || dailyLimitReached || timeLeft <= 0) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          conversationHistory: messages.slice(-10),
          sessionId
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      const timeUsed = parseInt(localStorage.getItem('rizzler_time_used') || '0');
      localStorage.setItem('rizzler_time_used', (timeUsed + 30).toString());
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble right now. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const compressImage = (dataUrl: string, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = dataUrl;
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      
      try {
        const compressedImage = await compressImage(result);
        setUploadedImage(compressedImage);
        handleSendImage(compressedImage);
      } catch (error) {
        console.error('Image compression failed:', error);
        setUploadedImage(result);
        handleSendImage(result);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendImage = async (imageData: string) => {
    if (isLoading || dailyLimitReached || timeLeft <= 0) return;

    const userMessage: Message = {
      role: 'user',
      content: `[Uploaded conversation screenshot]`,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `I've uploaded a conversation screenshot. Please analyze the text messages in this image and suggest the perfect next message I should send. Look at the conversation flow, tone, and context. Give me something I can copy and paste immediately: ${imageData}`,
          conversationHistory: messages.slice(-10),
          sessionId
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      const timeUsed = parseInt(localStorage.getItem('rizzler_time_used') || '0');
      localStorage.setItem('rizzler_time_used', (timeUsed + 30).toString());
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble analyzing the screenshot right now. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setUploadedImage(null);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const getQuickActions = () => [
    "🔥 Drop a fire pickup line",
    "📸 Upload conversation screenshot",
    "🎯 Master conversation flow",
    "😏 Advanced flirting tactics",
    "📱 Texting game mastery"
  ];

  const handleQuickAction = (action: string) => {
    if (dailyLimitReached || timeLeft <= 0) return;
    
    if (action === "📸 Upload conversation screenshot") {
      triggerImageUpload();
      return;
    }

    const actionMessages = {
      "🔥 Drop a fire pickup line": "Give me a fire pickup line I can use right now",
      "🎯 Master conversation flow": "How do I keep conversations flowing naturally?",
      "😏 Advanced flirting tactics": "Teach me some advanced flirting techniques",
      "📱 Texting game mastery": "How do I master texting game?"
    };

    const message = actionMessages[action as keyof typeof actionMessages];
    if (message) {
      setInput(message);
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1m ago';
    return `${minutes}m ago`;
  };

  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const styles = {
    welcomeContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      animation: 'gradientShift 8s ease-in-out infinite',
      position: 'relative' as const,
      overflow: 'hidden' as const
    },
    logoMain: {
      width: '120px',
      height: '120px',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      border: '2px solid rgba(59, 130, 246, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)',
      animation: 'floating 3s ease-in-out infinite, glowPulse 2s ease-in-out infinite',
      transition: '0.3s',
      position: 'relative' as const,
      marginBottom: '32px'
    },
    logoImage: {
      width: '100%',
      height: '100%',
      borderRadius: '24px',
      objectFit: 'cover' as const
    },
    sparkle1: {
      position: 'absolute' as const,
      top: '-10px',
      left: '-10px',
      fontSize: '20px',
      animation: 'sparkle 2s ease-in-out infinite',
      zIndex: 1
    },
    sparkle2: {
      position: 'absolute' as const,
      top: '-5px',
      right: '-15px',
      fontSize: '16px',
      animation: 'sparkle 2s ease-in-out infinite 0.5s',
      zIndex: 1
    },
    sparkle3: {
      position: 'absolute' as const,
      bottom: '-10px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '18px',
      animation: 'sparkle 2s ease-in-out infinite 1s',
      zIndex: 1
    },
    title: {
      fontSize: '48px',
      fontWeight: 900,
      color: '#ffffff',
      margin: '0 0 16px 0',
      textAlign: 'center' as const,
      background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text' as const,
      WebkitTextFillColor: 'transparent',
      animation: 'gradientShift 4s ease-in-out infinite, bounceIn 0.8s ease-out',
      textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
    },
    subtitleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px'
    },
    subtitle: {
      fontSize: '18px',
      color: '#94a3b8',
      margin: 0,
      fontWeight: 600
    },
    subtitleDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      animation: 'sparkle 1.5s ease-in-out infinite'
    },
    description: {
      fontSize: '16px',
      color: '#cbd5e1',
      textAlign: 'center' as const,
      maxWidth: '600px',
      margin: '0 0 32px 0',
      lineHeight: 1.6
    },
    startButton: {
      padding: '16px 32px',
      fontSize: '18px',
      fontWeight: 700,
      color: '#ffffff',
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      border: 'none',
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)',
      animation: 'gradientShift 4s ease-in-out infinite, fadeInUp 0.8s ease-out 0.2s both',
      position: 'relative' as const,
      overflow: 'hidden' as const
    },
    buttonContent: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '4px'
    },
    timeLimit: {
      fontSize: '12px',
      opacity: 0.8,
      fontWeight: 500
    },
    limitReached: {
      padding: '16px 24px',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '12px',
      textAlign: 'center' as const
    },
    limitText: {
      color: '#fca5a5',
      margin: 0,
      fontSize: '14px'
    },
    chatContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      animation: 'gradientShift 8s ease-in-out infinite'
    },
    header: {
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
      padding: '16px 0',
      position: 'sticky' as const,
      top: 0,
      zIndex: 10
    },
    headerContent: {
      maxWidth: '768px',
      margin: '0 auto',
      padding: '0 20px'
    },
    headerInfo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    headerLogo: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      animation: 'floating 3s ease-in-out infinite, heartbeat 2s ease-in-out infinite'
    },
    headerLogoImage: {
      width: '100%',
      height: '100%',
      borderRadius: '12px',
      objectFit: 'cover' as const
    },
    headerTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#ffffff',
      margin: 0
    },
    headerSubtitle: {
      fontSize: '14px',
      color: '#94a3b8',
      margin: 0
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center'
    },
    timeStatus: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '8px',
      padding: '6px 12px',
      animation: 'pulse 2s ease-in-out infinite'
    },
    timeStatusText: {
      fontSize: '14px',
      color: '#3b82f6',
      fontWeight: 600
    },
    limitStatus: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '8px',
      padding: '6px 12px'
    },
    limitStatusText: {
      fontSize: '14px',
      color: '#ef4444',
      fontWeight: 600
    },
    messagesContainer: {
      flex: 1,
      overflow: 'hidden',
      position: 'relative' as const
    },
    messagesWrapper: {
      height: '100%',
      overflow: 'hidden'
    },
    messagesScroll: {
      height: '100%',
      overflowY: 'auto' as const,
      padding: '20px'
    },
    messagesContent: {
      maxWidth: '768px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '24px'
    },
    messageRowUser: {
      display: 'flex',
      justifyContent: 'flex-end'
    },
    messageRowAssistant: {
      display: 'flex',
      justifyContent: 'flex-start'
    },
    messageContainerUser: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '12px',
      maxWidth: '70%',
      animation: 'slideInRight 0.4s ease-out'
    },
    messageContainerAssistant: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      maxWidth: '768px',
      padding: '10px',
      animation: 'slideInLeft 0.4s ease-out'
    },
    avatarUser: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      flexShrink: 0,
      animation: 'bounceIn 0.6s ease-out'
    },
    avatarAssistant: {
      width: '44px',
      height: '44px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      animation: 'floating 3s ease-in-out infinite',
      transition: '0.3s'
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: '16px',
      objectFit: 'cover' as const
    },
    avatarIcon: {
      width: '20px',
      height: '20px',
      color: '#ffffff'
    },
    messageBubbleUser: {
      padding: '12px 16px',
      borderRadius: '16px 16px 4px 16px',
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      color: '#ffffff',
      maxWidth: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      backdropFilter: 'blur(4px)',
      transition: '0.3s',
      animation: 'bounceIn 0.6s ease-out',
      position: 'relative' as const,
      overflow: 'hidden' as const
    },
    messageBubbleAssistant: {
      padding: '16px 24px',
      borderRadius: '16px 16px 16px 4px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      maxWidth: '512px',
      backdropFilter: 'blur(4px)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      background: 'rgba(31, 41, 55, 0.7)',
      color: '#f3f4f6',
      transition: '0.3s',
      animation: 'bounceIn 0.6s ease-out'
    },
    messageText: {
      fontSize: '14px',
      lineHeight: 1.6,
      whiteSpace: 'pre-wrap' as const,
      fontWeight: 500,
      margin: 0
    },
    messageTime: {
      fontSize: '12px',
      color: '#9ca3af',
      paddingLeft: '8px',
      textAlign: 'left' as const,
      fontWeight: 500,
      animation: 'fadeIn 0.8s ease-out'
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      maxWidth: '768px',
      padding: '10px'
    },
    loadingDot: {
      width: '44px',
      height: '44px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      animation: 'floating 3s ease-in-out infinite'
    },
    loadingBubble: {
      padding: '16px 24px',
      borderRadius: '16px 16px 16px 4px',
      background: 'rgba(31, 41, 55, 0.7)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      animation: 'pulse 1.5s ease-in-out infinite'
    },
    loadingText: {
      color: '#94a3b8',
      fontSize: '14px',
      fontWeight: 500
    },
    inputContainer: {
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      borderTop: '1px solid rgba(59, 130, 246, 0.2)',
      padding: '20px',
      position: 'sticky' as const,
      bottom: 0
    },
    inputWrapper: {
      maxWidth: '768px',
      margin: '0 auto',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-end'
    },
    inputField: {
      flex: 1,
      padding: '12px 16px',
      fontSize: '14px',
      color: '#ffffff',
      background: 'rgba(31, 41, 55, 0.7)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '12px',
      resize: 'none' as const,
      outline: 'none',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(4px)',
      minHeight: '44px',
      maxHeight: '120px'
    },
    sendButton: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      animation: 'glowPulse 2s ease-in-out infinite'
    },
    uploadButton: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
      animation: 'glowPulse 2s ease-in-out infinite'
    },
    uploadIcon: {
      width: '20px',
      height: '20px',
      color: '#ffffff'
    },
    quickActionsContainer: {
      marginTop: '16px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '8px',
      justifyContent: 'center'
    },
    quickActionButton: {
      padding: '8px 16px',
      fontSize: '12px',
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '20px',
      color: '#3b82f6',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: 500,
      animation: 'fadeInUp 0.6s ease-out'
    }
  };

  const componentStyles = `
    @keyframes floating {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes glowPulse {
      0%, 100% { box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
      50% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.5); }
    }
    
    @keyframes shimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    
    @keyframes bounceIn {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes slideInLeft {
      0% { transform: translateX(-30px); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideInRight {
      0% { transform: translateX(30px); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeInUp {
      0% { transform: translateY(30px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    @keyframes sparkle {
      0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
      50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
    }
    
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    @keyframes typing {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes slideInFromBottom {
      0% { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes rotateIn {
      0% { transform: rotate(-180deg) scale(0.3); opacity: 0; }
      100% { transform: rotate(0deg) scale(1); opacity: 1; }
    }
    
    .rizzler-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    
    .rizzler-scrollbar::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.3);
      border-radius: 3px;
    }
    
    .rizzler-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 3px;
    }
    
    .rizzler-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #2563eb, #1e40af);
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    }
    
    input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .quick-action-button:hover {
      background: rgba(59, 130, 246, 0.2);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    .message-bubble:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    
    .avatar:hover {
      transform: scale(1.05);
    }
    
    .logo:hover {
      transform: scale(1.05) rotate(5deg);
    }
    
    .send-button:hover, .upload-button:hover {
      transform: scale(1.05);
    }
    
    .typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    
    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #3b82f6;
      animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    .typing-dot:nth-child(3) { animation-delay: 0s; }
    
    .heartbeat {
      animation: heartbeat 2s ease-in-out infinite;
    }
    
    .slide-in-bottom {
      animation: slideInFromBottom 0.6s ease-out;
    }
    
    .rotate-in {
      animation: rotateIn 0.6s ease-out;
    }
    
    .message-bubble-user {
      position: relative;
      overflow: hidden;
    }
    
    .message-bubble-user::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      animation: shimmer 2s infinite;
    }
    
    .quick-action-stagger {
      animation: slideInFromBottom 0.6s ease-out;
    }
    
    .typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    
    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #3b82f6;
      animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    .typing-dot:nth-child(3) { animation-delay: 0s; }
  `;

  if (!sessionStarted) {
    return (
      <div style={styles.welcomeContainer}>
        <style>{componentStyles}</style>
        
        <div style={styles.logoMain}>
          <img 
            src="/rizzler-avatar.png" 
            alt="Rizzler" 
            style={styles.logoImage}
          />
          <div style={styles.sparkle1}>✨</div>
          <div style={styles.sparkle2}>💫</div>
          <div style={styles.sparkle3}>⭐</div>
        </div>

        <h1 style={styles.title}>RIZZLER</h1>
        
        <div style={styles.subtitleContainer}>
          <div style={styles.subtitleDot}></div>
          <p style={styles.subtitle}>Elite Dating Coach</p>
          <div style={styles.subtitleDot}></div>
        </div>
        
        <p style={styles.description}>
          Level up your dating game with pure rizz energy! Expert psychology, proven techniques, and legendary confidence building. Let's make you unstoppable! 💪
        </p>

        {dailyLimitReached ? (
          <div style={styles.limitReached}>
            <p style={styles.limitText}>Daily limit reached. Come back tomorrow for more coaching!</p>
          </div>
        ) : (
          <button onClick={handleStartChat} style={styles.startButton}>
            <span style={styles.buttonContent}>
              <span>🚀 Start Elite Coaching</span>
              <span style={styles.timeLimit}>5 min daily limit</span>
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={styles.chatContainer}>
      <style>{componentStyles}</style>
      
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerInfo}>
            <div style={styles.headerLeft}>
              <div style={styles.headerLogo}>
                <img 
                  src="/rizzler-avatar.png" 
                  alt="Rizzler" 
                  style={styles.headerLogoImage}
                />
              </div>
              <div>
                <h2 style={styles.headerTitle}>Rizzler</h2>
                <p style={styles.headerSubtitle}>Elite Dating Coach</p>
              </div>
            </div>
            <div style={styles.headerRight}>
              {dailyLimitReached ? (
                <div style={styles.limitStatus}>
                  <span style={styles.limitStatusText}>Daily limit reached</span>
                </div>
              ) : (
                <div style={styles.timeStatus}>
                  <span style={styles.timeStatusText}>{formatTimeLeft(timeLeft)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.messagesContainer}>
        <div style={styles.messagesWrapper}>
          <div style={styles.messagesScroll} className="rizzler-scrollbar">
            <div style={styles.messagesContent}>
              {messages.map((message, index) => (
                <div key={index} style={message.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant}>
                  <div style={message.role === 'user' ? styles.messageContainerUser : styles.messageContainerAssistant}>
                    <div style={message.role === 'user' ? styles.avatarUser : styles.avatarAssistant}>
                      {message.role === 'user' ? (
                        <svg style={styles.avatarIcon} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <img 
                          src="/rizzler-avatar.png" 
                          alt="Rizzler" 
                          style={styles.avatarImage}
                        />
                      )}
                    </div>
                    
                    <div 
                      style={message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant}
                      className={message.role === 'user' ? 'message-bubble-user' : 'message-bubble-assistant'}
                    >
                      <p style={styles.messageText}>{message.content}</p>
                    </div>
                  </div>
                  
                  <div style={styles.messageTime}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div style={styles.messageRowAssistant}>
                  <div style={styles.loadingContainer}>
                    <div style={styles.loadingDot}>
                      <img 
                        src="/rizzler-avatar.png" 
                        alt="Rizzler" 
                        style={styles.avatarImage}
                      />
                    </div>
                    <div style={styles.loadingBubble}>
                      <span style={styles.loadingText}>Rizzler is cooking up some fire... 🔥</span>
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.inputContainer}>
        <div style={styles.inputWrapper}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Rizzler anything..."
            style={styles.inputField}
            disabled={isLoading || dailyLimitReached || timeLeft <= 0}
            rows={1}
          />
          
          <button
            onClick={triggerImageUpload}
            style={styles.uploadButton}
            disabled={isLoading || dailyLimitReached || timeLeft <= 0}
            title="Upload conversation screenshot"
          >
            <svg style={styles.uploadIcon} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button
            onClick={handleSendMessage}
            style={styles.sendButton}
            disabled={!input.trim() || isLoading || dailyLimitReached || timeLeft <= 0}
          >
            <svg style={styles.uploadIcon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>

        {messages.length === 1 && (
          <div style={styles.quickActionsContainer}>
            {getQuickActions().map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                style={{
                  ...styles.quickActionButton,
                  animationDelay: `${index * 0.1}s`,
                  animation: 'slideInFromBottom 0.6s ease-out'
                }}
                disabled={dailyLimitReached || timeLeft <= 0}
                className="quick-action-button"
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
} 