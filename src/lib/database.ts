

// In-memory database (in production, use PostgreSQL, MongoDB, etc.)
interface AnonymousUser {
  sessionId: string;
  createdAt: Date;
  dailyLimitUsed: number; // Time used today in milliseconds
  lastUsedDate: string; // Date string for daily reset
}

// Global in-memory store (replace with real database in production)
declare global {
  var anonymousUsers: Map<string, AnonymousUser> | undefined;
}

// Only initialize on server-side
if (typeof window === 'undefined' && !global.anonymousUsers) {
  global.anonymousUsers = new Map();
}

export class Database {
  private static instance: Database;
  private users: Map<string, AnonymousUser>;

  private constructor() {
    this.users = global.anonymousUsers!;
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Create new anonymous user with daily limit
  async createAnonymousUser(sessionId: string, dailyLimitMinutes: number = 5): Promise<AnonymousUser> {
    const now = new Date();
    const today = now.toDateString();
    
    const user: AnonymousUser = {
      sessionId,
      createdAt: now,
      dailyLimitUsed: 0,
      lastUsedDate: today
    };

    this.users.set(sessionId, user);
    return user;
  }

  // Get user by session ID
  async getUserBySessionId(sessionId: string): Promise<AnonymousUser | null> {
    return this.users.get(sessionId) || null;
  }

  // Check if user has access (daily limit check)
  async hasAccess(sessionId: string): Promise<{ hasAccess: boolean; reason: string; user?: AnonymousUser }> {
    const user = this.users.get(sessionId);
    if (!user) {
      return { hasAccess: false, reason: 'User not found' };
    }

    const today = new Date().toDateString();
    const dailyLimit = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Reset daily limit if it's a new day
    if (user.lastUsedDate !== today) {
      user.dailyLimitUsed = 0;
      user.lastUsedDate = today;
      this.users.set(sessionId, user);
    }

    // Check if user has exceeded daily limit
    if (user.dailyLimitUsed >= dailyLimit) {
      return { 
        hasAccess: false, 
        reason: 'Daily limit reached', 
        user 
      };
    }

    return { 
      hasAccess: true, 
      reason: 'Daily limit active', 
      user 
    };
  }

  // Update user's daily usage
  async updateDailyUsage(sessionId: string, timeUsed: number): Promise<boolean> {
    const user = this.users.get(sessionId);
    if (!user) return false;

    const today = new Date().toDateString();
    const dailyLimit = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Reset daily limit if it's a new day
    if (user.lastUsedDate !== today) {
      user.dailyLimitUsed = 0;
      user.lastUsedDate = today;
    }

    // Update usage
    user.dailyLimitUsed = Math.min(user.dailyLimitUsed + timeUsed, dailyLimit);
    this.users.set(sessionId, user);
    
    return true;
  }

  // Get remaining time for user
  async getRemainingTime(sessionId: string): Promise<number> {
    const user = this.users.get(sessionId);
    if (!user) return 0;

    const today = new Date().toDateString();
    const dailyLimit = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Reset daily limit if it's a new day
    if (user.lastUsedDate !== today) {
      return dailyLimit;
    }

    return Math.max(0, dailyLimit - user.dailyLimitUsed);
  }

  // Get all users (for admin purposes)
  async getAllUsers(): Promise<AnonymousUser[]> {
    return Array.from(this.users.values());
  }

  // Clean up old sessions (optional maintenance)
  async cleanupOldSessions(): Promise<number> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [sessionId, user] of this.users.entries()) {
      if (user.createdAt < oneWeekAgo) {
        this.users.delete(sessionId);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // Reset database (for testing/debugging)
  async resetDatabase(): Promise<void> {
    this.users.clear();
    console.log('🗑️ Database reset complete');
  }
} 