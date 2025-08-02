

// Simple in-memory database for session management
export class Database {
  private static instance: Database;
  private sessions: Map<string, { timeUsed: number; lastUsed: string }> = new Map();

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async hasAccess(sessionId: string): Promise<{ hasAccess: boolean; reason: string; user?: unknown; trialExpiresAt?: Date; accessExpiresAt?: Date }> {
    const session = this.sessions.get(sessionId);
    const now = new Date();
    const today = now.toDateString();

    if (!session) {
      // New session
      this.sessions.set(sessionId, { timeUsed: 0, lastUsed: now.toISOString() });
      return { 
        hasAccess: true, 
        reason: 'New session created',
        user: { sessionId, timeUsed: 0, lastUsed: now.toISOString() }
      };
    }

    const lastUsedDate = new Date(session.lastUsed);
    const lastUsedDay = lastUsedDate.toDateString();

    if (lastUsedDay !== today) {
      // New day, reset
      this.sessions.set(sessionId, { timeUsed: 0, lastUsed: now.toISOString() });
      return { 
        hasAccess: true, 
        reason: 'Daily limit reset',
        user: { sessionId, timeUsed: 0, lastUsed: now.toISOString() }
      };
    }

    const timeLeft = Math.max(0, 300 - session.timeUsed);
    const hasAccess = session.timeUsed < 300;

    return { 
      hasAccess, 
      reason: hasAccess ? 'Access granted' : 'Daily limit reached',
      user: { sessionId, timeUsed: session.timeUsed, lastUsed: session.lastUsed },
      accessExpiresAt: new Date(now.getTime() + timeLeft * 1000)
    };
  }

  async updateDailyUsage(sessionId: string, timeUsedMs: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    const now = new Date();

    if (session) {
      session.timeUsed += timeUsedMs / 1000; // Convert to seconds
      session.lastUsed = now.toISOString();
      this.sessions.set(sessionId, session);
    } else {
      this.sessions.set(sessionId, { 
        timeUsed: timeUsedMs / 1000, 
        lastUsed: now.toISOString() 
      });
    }
  }

  // Clean up old sessions (older than 24 hours)
  cleanupOldSessions(): void {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const [sessionId, session] of this.sessions.entries()) {
      const lastUsed = new Date(session.lastUsed);
      if (lastUsed < oneDayAgo) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // Reset all sessions (for admin use)
  async resetDatabase(): Promise<void> {
    this.sessions.clear();
  }

  // Get user by session ID
  async getUserBySessionId(sessionId: string): Promise<unknown | null> {
    const session = this.sessions.get(sessionId);
    if (session) {
      return {
        sessionId,
        timeUsed: session.timeUsed,
        lastUsed: session.lastUsed
      };
    }
    return null;
  }

  // Create anonymous user
  async createAnonymousUser(sessionId: string, dailyLimitMinutes: number): Promise<unknown> {
    const now = new Date();
    this.sessions.set(sessionId, { 
      timeUsed: 0, 
      lastUsed: now.toISOString() 
    });
    
    return {
      sessionId,
      timeUsed: 0,
      lastUsed: now.toISOString(),
      dailyLimitMinutes
    };
  }

  // Get all users (for admin)
  async getAllUsers(): Promise<unknown[]> {
    const users = [];
    for (const [sessionId, session] of this.sessions.entries()) {
      users.push({
        sessionId,
        timeUsed: session.timeUsed,
        lastUsed: session.lastUsed
      });
    }
    return users;
  }
}

// Clean up old sessions every hour
setInterval(() => {
  Database.getInstance().cleanupOldSessions();
}, 60 * 60 * 1000); 