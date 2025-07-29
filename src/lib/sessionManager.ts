import { Database } from './database';
import crypto from 'crypto';

interface SessionData {
  sessionId: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  userAgent: string;
  ipAddress: string;
}

// SECURITY FIX: Server-side session storage with expiration
declare global {
  var activeSessions: Map<string, SessionData> | undefined;
}

// Only initialize on server-side
if (typeof window === 'undefined' && !global.activeSessions) {
  global.activeSessions = new Map();
}

export class SessionManager {
  private static instance: SessionManager;
  private database: Database;
  private sessions: Map<string, SessionData>;
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly DAILY_LIMIT = 5 * 60 * 1000; // 5 minutes per day

  private constructor() {
    this.database = Database.getInstance();
    this.sessions = global.activeSessions!;
    
    // Only start cleanup on server-side
    if (typeof window === 'undefined') {
      // Clean up expired sessions periodically
      setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000); // Every 5 minutes
    }
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Validate session with security checks
  async validateSession(sessionId: string, userAgent?: string, ipAddress?: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const now = new Date();
    if (now > session.expiresAt) {
      this.sessions.delete(sessionId);
      return false;
    }

    // Update last activity
    session.lastActivity = now;
    this.sessions.set(sessionId, session);

    return true;
  }

  // Get or create session with proper validation
  async getOrCreateSession(existingSessionId?: string, userAgent?: string, ipAddress?: string): Promise<{
    sessionId: string;
    isNew: boolean;
    user: unknown;
  }> {
    // SECURITY FIX: Validate existing session if provided
    if (existingSessionId) {
      const isValid = await this.validateSession(existingSessionId, userAgent, ipAddress);
      if (isValid) {
        const user = await this.database.getUserBySessionId(existingSessionId);
        if (user) {
          return {
            sessionId: existingSessionId,
            isNew: false,
            user
          };
        }
      }
    }

    // Create new session
    const sessionId = this.generateSecureSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_DURATION);

    // SECURITY FIX: Store session data server-side
    const sessionData: SessionData = {
      sessionId,
      createdAt: now,
      lastActivity: now,
      expiresAt,
      userAgent: userAgent || 'unknown',
      ipAddress: ipAddress || 'unknown'
    };

    this.sessions.set(sessionId, sessionData);

    // Create user in database
    const user = await this.database.createAnonymousUser(sessionId, 5); // 5 minutes daily limit

    return {
      sessionId,
      isNew: true,
      user
    };
  }

  // Check access with session validation
  async checkAccess(sessionId: string, userAgent?: string, ipAddress?: string): Promise<{
    hasAccess: boolean;
    reason: string;
    user?: unknown;
    trialExpiresAt?: Date;
    accessExpiresAt?: Date;
  }> {
    // SECURITY FIX: Validate session first
    const isValidSession = await this.validateSession(sessionId, userAgent, ipAddress);
    if (!isValidSession) {
      return {
        hasAccess: false,
        reason: 'Invalid or expired session'
      };
    }

    // Check database access
    const accessResult = await this.database.hasAccess(sessionId);
    return accessResult;
  }

  // Get payment address for session (removed - no payments)
  async getPaymentAddress(sessionId: string, userAgent?: string, ipAddress?: string): Promise<{
    walletAddress: string;
    referenceId: string;
    amount: number;
    expiresAt: Date;
  } | null> {
    // Payment functionality removed
    return null;
  }

  // Mark payment received (removed - no payments)
  async markPaymentReceived(sessionId: string, txId: string, amount: number, userAgent?: string, ipAddress?: string): Promise<boolean> {
    // Payment functionality removed
    return false;
  }

  // Get user by wallet address (removed - no payments)
  async getUserByWalletAddress(walletAddress: string): Promise<unknown | null> {
    // Payment functionality removed
    return null;
  }

  // Clean up expired sessions
  private cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // Generate secure session ID
  private generateSecureSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Check if user can start session (daily limit check)
  canStartSession(): boolean {
    const today = new Date().toDateString();
    const lastUsed = localStorage.getItem('rizzler_last_used');
    const timeUsed = parseInt(localStorage.getItem('rizzler_time_used') || '0');
    
    if (lastUsed === today && timeUsed >= this.DAILY_LIMIT) {
      return false;
    }
    
    return true;
  }

  // Start session
  startSession(): boolean {
    return true; // Always succeed for now
  }

  // Get remaining free time
  getRemainingFreeTime(): number {
    const today = new Date().toDateString();
    const lastUsed = localStorage.getItem('rizzler_last_used');
    const timeUsed = parseInt(localStorage.getItem('rizzler_time_used') || '0');
    
    if (lastUsed !== today) {
      return this.DAILY_LIMIT;
    }
    
    return Math.max(0, this.DAILY_LIMIT - timeUsed);
  }

  // Get all users (for admin purposes)
  async getAllUsers(): Promise<unknown[]> {
    return await this.database.getAllUsers();
  }

  // Get user by session ID
  async getUserBySessionId(sessionId: string): Promise<unknown | null> {
    return await this.database.getUserBySessionId(sessionId);
  }
} 