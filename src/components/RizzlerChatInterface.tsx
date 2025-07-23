'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface RizzlerChatInterfaceProps {
  sessionId: string;
}

export default function RizzlerChatInterface({
  sessionId
}: RizzlerChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (hasStarted && messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: "Welcome to Rizzler! I'm your elite dating coach specializing in attraction psychology and conversation mastery. Whether you need killer pickup lines, magnetic bio optimization, or advanced social dynamics - I'll transform your dating game from basic to legendary. What challenge should we tackle first?",
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);
    }
  }, [hasStarted, messages.length]);

  const handleStartChat = () => {
    setHasStarted(true);
    inputRef.current?.focus();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-10),
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your internet connection and try again. If the issue persists, you may need to activate premium access.",
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

  const getQuickActions = () => [
    "Generate killer pickup lines",
    "Optimize my dating profile", 
    "Master conversation flow",
    "Advanced flirting tactics",
    "Build unshakeable confidence",
    "Texting game mastery"
  ];

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    inputRef.current?.focus();
  };

  const formatTime = (timestamp: number) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes === 0) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return messageTime.toLocaleDateString();
  };

  if (!hasStarted) {
    return (
      <div style={styles.welcomeContainer}>
        <style>{componentStyles}</style>
        {/* Background Effects */}
        <div style={styles.backgroundEffects}>
          <div style={styles.bgEffect1}></div>
          <div style={styles.bgEffect2}></div>
        </div>
        
        <div style={styles.welcomeContent}>
          <div style={styles.welcomeInner}>
            {/* Premium Logo */}
            <div style={styles.logoContainer}>
              <div style={styles.logoWrapper}>
                <div style={styles.logoShadow1}></div>
                <div style={styles.logoShadow2}></div>
                <div style={styles.logoMain}>
                  <div style={styles.logoText}>R</div>
                  <div style={styles.logoGradient}></div>
                </div>
              </div>
            </div>

            {/* Premium Title */}
            <h1 style={styles.title}>RIZZLER</h1>
            
            <div style={styles.subtitleContainer}>
              <div style={styles.subtitleDot}></div>
              <p style={styles.subtitle}>Elite Dating Coach</p>
              <div style={styles.subtitleDot}></div>
            </div>
            
            <p style={styles.description}>
              Transform your dating game with expert psychology, proven techniques, and legendary confidence building.
            </p>

            <button onClick={handleStartChat} style={styles.startButton}>
              <div style={styles.buttonGradient}></div>
              <span style={styles.buttonContent}>
                <span>Start Elite Coaching</span>
                <svg style={styles.buttonIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.chatContainer}>
      <style>{componentStyles}</style>
      
      {/* Subtle Background Effects */}
      <div style={styles.chatBackgroundEffects}>
        <div style={styles.chatBgEffect1}></div>
        <div style={styles.chatBgEffect2}></div>
      </div>

      {/* Premium Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerInfo}>
            <div style={styles.headerLeft}>
              <div style={styles.headerLogo}>
                <span style={styles.headerLogoText}>R</span>
              </div>
              <div>
                <h2 style={styles.headerTitle}>Rizzler</h2>
                <p style={styles.headerSubtitle}>Elite Dating Coach</p>
              </div>
            </div>
            <div style={styles.headerRight}>
              <div style={styles.onlineStatus}>
                <div style={styles.onlineDot}></div>
                <span style={styles.onlineText}>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div style={styles.messagesContainer}>
        <div style={styles.messagesWrapper}>
          <div style={styles.messagesScroll} className="rizzler-scrollbar">
            <div style={styles.messagesContent}>
              {messages.map((message, index) => (
                <div key={index} style={message.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant}>
                  <div style={message.role === 'user' ? styles.messageContainerUser : styles.messageContainerAssistant}>
                    {/* Enhanced Avatar */}
                    <div style={message.role === 'user' ? styles.avatarUser : styles.avatarAssistant}>
                      {message.role === 'user' ? (
                        <svg style={styles.avatarIcon} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span style={styles.avatarText}>R</span>
                      )}
                    </div>

                    {/* Enhanced Message Container */}
                    <div style={styles.messageWrapper}>
                      <div style={message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant}>
                        <p style={styles.messageText}>{message.content}</p>
                      </div>
                      
                      {/* Enhanced Timestamp */}
                      <div style={message.role === 'user' ? styles.timestampUser : styles.timestampAssistant}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Enhanced Loading Indicator */}
              {isLoading && (
                <div style={styles.messageRowAssistant}>
                  <div style={styles.messageContainerAssistant}>
                    <div style={styles.avatarAssistant}>
                      <span style={styles.avatarText}>R</span>
                    </div>
                    <div style={styles.messageWrapper}>
                      <div style={styles.messageBubbleAssistant}>
                        <div style={styles.loadingContainer}>
                          <div style={styles.loadingDots}>
                            <div style={styles.loadingDot1}></div>
                            <div style={styles.loadingDot2}></div>
                            <div style={styles.loadingDot3}></div>
                          </div>
                          <span style={styles.loadingText}>Rizzler is thinking...</span>
                        </div>
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

      {/* Enhanced Quick Actions */}
      {messages.length <= 1 && (
        <div style={styles.quickActionsContainer}>
          <div style={styles.quickActionsWrapper}>
            <p style={styles.quickActionsTitle}>
              <svg style={styles.quickActionsIcon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <span>Quick Start Challenges</span>
            </p>
            <div style={styles.quickActionsGrid}>
              {getQuickActions().map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  style={styles.quickActionButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.6)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(55, 65, 81, 0.5)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span>{action}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Premium Input Area */}
      <div style={styles.inputContainer}>
        <div style={styles.inputWrapper}>
          <div style={styles.inputRow}>
            <div style={styles.inputFieldContainer}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your challenge or question..."
                style={styles.inputField}
                disabled={isLoading}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(55, 65, 81, 0.5)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <div style={styles.inputGradient}></div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              style={styles.sendButton}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
              }}
            >
              {isLoading ? (
                <div style={styles.spinner}></div>
              ) : (
                <svg style={styles.sendIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Complete CSS-in-JS styles to avoid any conflicts
const styles = {
  // Welcome Screen Styles
  welcomeContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #450a0a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative' as const,
    overflow: 'hidden',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  backgroundEffects: {
    position: 'absolute' as const,
    inset: '0',
    pointerEvents: 'none' as const,
  },
  bgEffect1: {
    position: 'absolute' as const,
    top: '25%',
    left: '25%',
    width: '384px',
    height: '384px',
    background: 'radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  bgEffect2: {
    position: 'absolute' as const,
    bottom: '25%',
    right: '25%',
    width: '384px',
    height: '384px',
    background: 'radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  welcomeContent: {
    width: '100%',
    maxWidth: '448px',
    margin: '0 auto',
    position: 'relative' as const,
    zIndex: 10,
  },
  welcomeInner: {
    textAlign: 'center' as const,
  },
  logoContainer: {
    position: 'relative' as const,
    marginBottom: '32px',
  },
  logoWrapper: {
    width: '112px',
    height: '112px',
    margin: '0 auto',
    position: 'relative' as const,
  },
  logoShadow1: {
    position: 'absolute' as const,
    inset: '0',
    background: 'linear-gradient(45deg, #ef4444, #dc2626, #b91c1c)',
    borderRadius: '24px',
    transform: 'rotate(3deg)',
    opacity: 0.2,
    filter: 'blur(4px)',
  },
  logoShadow2: {
    position: 'absolute' as const,
    inset: '0',
    background: 'linear-gradient(45deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
    borderRadius: '24px',
    transform: 'rotate(6deg)',
    filter: 'blur(16px)',
  },
  logoMain: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.2)',
  },
  logoText: {
    fontSize: '36px',
    fontWeight: '900',
    color: 'white',
    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
  },
  logoGradient: {
    position: 'absolute' as const,
    inset: '0',
    background: 'linear-gradient(to top, transparent, rgba(255, 255, 255, 0.1))',
    borderRadius: '24px',
  },
  title: {
    fontSize: '48px',
    fontWeight: '900',
    marginBottom: '12px',
    background: 'linear-gradient(135deg, #ffffff, #fecaca, #fca5a5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
    margin: '0 0 12px 0',
  },
  subtitleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  subtitleDot: {
    width: '4px',
    height: '4px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  subtitle: {
    color: '#f87171',
    fontSize: '18px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    margin: '0',
  },
  description: {
    color: '#d1d5db',
    lineHeight: '1.6',
    marginBottom: '40px',
    padding: '0 24px',
    fontSize: '16px',
    margin: '0 24px 40px 24px',
  },
  startButton: {
    position: 'relative' as const,
    width: '100%',
    padding: '20px 32px',
    background: 'linear-gradient(135deg, #dc2626, #ef4444, #dc2626)',
    color: 'white',
    fontWeight: '700',
    borderRadius: '16px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
  buttonGradient: {
    position: 'absolute' as const,
    inset: '0',
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0), rgba(255, 255, 255, 0.1), rgba(239, 68, 68, 0))',
    borderRadius: '16px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  buttonContent: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    zIndex: 10,
  },
  buttonIcon: {
    width: '20px',
    height: '20px',
    transition: 'transform 0.3s ease',
  },

  // Chat Interface Styles
  chatContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c0a09, #1c1917, #0c0a09)',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  chatBackgroundEffects: {
    position: 'absolute' as const,
    inset: '0',
    overflow: 'hidden',
    pointerEvents: 'none' as const,
  },
  chatBgEffect1: {
    position: 'absolute' as const,
    top: '0',
    left: '25%',
    width: '384px',
    height: '384px',
    background: 'radial-gradient(circle, rgba(239, 68, 68, 0.03) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  chatBgEffect2: {
    position: 'absolute' as const,
    bottom: '0',
    right: '25%',
    width: '384px',
    height: '384px',
    background: 'radial-gradient(circle, rgba(220, 38, 38, 0.03) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  header: {
    position: 'relative' as const,
    zIndex: 10,
    background: 'rgba(12, 10, 9, 0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(31, 41, 55, 0.5)',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    width: '100%',
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '16px 24px',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerLogo: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(239, 68, 68, 0.2)',
  },
  headerLogoText: {
    color: 'white',
    fontWeight: '900',
    fontSize: '18px',
  },
  headerTitle: {
    color: 'white',
    fontSize: '20px',
    fontWeight: '700',
    margin: '0',
  },
  headerSubtitle: {
    color: '#f87171',
    fontSize: '14px',
    fontWeight: '500',
    margin: '0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  onlineStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(31, 41, 55, 0.5)',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid rgba(55, 65, 81, 0.5)',
  },
  onlineDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#4ade80',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
    boxShadow: '0 0 6px rgba(74, 222, 128, 0.5)',
  },
  onlineText: {
    color: '#d1d5db',
    fontSize: '14px',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative' as const,
    zIndex: 10,
  },
  messagesWrapper: {
    width: '100%',
    maxWidth: '1024px',
    padding: '32px 24px',
  },
  messagesScroll: {
    height: '100%',
    maxHeight: 'calc(100vh - 220px)',
    overflowY: 'auto' as const,
  },
  messagesContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '32px',
  },
  messageRowUser: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-start',
  },
  messageContainerUser: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    maxWidth: '768px',
    flexDirection: 'row-reverse' as const,
  },
  messageContainerAssistant: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    maxWidth: '768px',
  },
  avatarUser: {
    width: '44px',
    height: '44px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  avatarAssistant: {
    width: '44px',
    height: '44px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  avatarIcon: {
    width: '20px',
    height: '20px',
    color: 'white',
  },
  avatarText: {
    color: 'white',
    fontWeight: '900',
    fontSize: '14px',
  },
  messageWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  messageBubbleUser: {
    padding: '16px 24px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    maxWidth: '512px',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    borderBottomRightRadius: '4px',
    color: 'white',
  },
  messageBubbleAssistant: {
    padding: '16px 24px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    maxWidth: '512px',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(55, 65, 81, 0.5)',
    background: 'rgba(31, 41, 55, 0.7)',
    borderBottomLeftRadius: '4px',
    color: '#f3f4f6',
  },
  messageText: {
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap' as const,
    fontWeight: '500',
    margin: '0',
  },
  timestampUser: {
    fontSize: '12px',
    color: 'rgba(107, 114, 128, 1)',
    paddingRight: '8px',
    textAlign: 'right' as const,
    fontWeight: '500',
  },
  timestampAssistant: {
    fontSize: '12px',
    color: 'rgba(107, 114, 128, 1)',
    paddingLeft: '8px',
    textAlign: 'left' as const,
    fontWeight: '500',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  loadingDots: {
    display: 'flex',
    gap: '4px',
  },
  loadingDot1: {
    width: '8px',
    height: '8px',
    backgroundColor: '#f87171',
    borderRadius: '50%',
    animation: 'bounce 1s infinite',
  },
  loadingDot2: {
    width: '8px',
    height: '8px',
    backgroundColor: '#f87171',
    borderRadius: '50%',
    animation: 'bounce 1s infinite 0.1s',
  },
  loadingDot3: {
    width: '8px',
    height: '8px',
    backgroundColor: '#f87171',
    borderRadius: '50%',
    animation: 'bounce 1s infinite 0.2s',
  },
  loadingText: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500',
  },
  quickActionsContainer: {
    borderTop: '1px solid rgba(31, 41, 55, 0.5)',
    background: 'rgba(12, 10, 9, 0.5)',
    backdropFilter: 'blur(20px)',
    position: 'relative' as const,
    zIndex: 10,
  },
  quickActionsWrapper: {
    width: '100%',
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '24px',
  },
  quickActionsTitle: {
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 0 20px 0',
  },
  quickActionsIcon: {
    width: '16px',
    height: '16px',
    color: '#f87171',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  quickActionButton: {
    padding: '16px',
    background: 'rgba(31, 41, 55, 0.4)',
    backdropFilter: 'blur(4px)',
    color: '#e5e7eb',
    borderRadius: '12px',
    border: '1px solid rgba(55, 65, 81, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  inputContainer: {
    borderTop: '1px solid rgba(31, 41, 55, 0.5)',
    background: 'rgba(12, 10, 9, 0.8)',
    backdropFilter: 'blur(20px)',
    position: 'relative' as const,
    zIndex: 10,
  },
  inputWrapper: {
    width: '100%',
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '20px 24px',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  inputFieldContainer: {
    flex: '1',
    position: 'relative' as const,
  },
  inputField: {
    width: '100%',
    padding: '16px 24px',
    background: 'rgba(31, 41, 55, 0.5)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(55, 65, 81, 0.5)',
    borderRadius: '16px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '500',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    fontFamily: 'inherit',
  },
  inputGradient: {
    position: 'absolute' as const,
    inset: '0',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0), rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0))',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none' as const,
  },
  sendButton: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    borderRadius: '16px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  sendIcon: {
    width: '20px',
    height: '20px',
    transition: 'transform 0.2s ease',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid white',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// CSS animations as a string to be injected
const componentStyles = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .rizzler-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .rizzler-scrollbar::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.3);
    border-radius: 3px;
  }
  
  .rizzler-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(239, 68, 68, 0.3);
    border-radius: 3px;
  }
  
  .rizzler-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(239, 68, 68, 0.5);
  }
  
  /* Input placeholder styles */
  .rizzler-scrollbar input::placeholder {
    color: rgba(156, 163, 175, 1);
  }
  
  /* Button disabled state */
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;