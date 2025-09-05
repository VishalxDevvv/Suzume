const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'global_economy.db'));

// Create global economy table (no guild_id, just user_id)
db.exec(`
    CREATE TABLE IF NOT EXISTS global_economy (
        user_id TEXT PRIMARY KEY,
        balance INTEGER DEFAULT 1000,
        daily_last TEXT,
        total_won INTEGER DEFAULT 0,
        total_lost INTEGER DEFAULT 0,
        flip_count INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        last_xp_time INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Add missing columns for existing users
try {
    db.exec(`ALTER TABLE global_economy ADD COLUMN xp INTEGER DEFAULT 0`);
} catch (e) { /* Column already exists */ }
try {
    db.exec(`ALTER TABLE global_economy ADD COLUMN level INTEGER DEFAULT 1`);
} catch (e) { /* Column already exists */ }
try {
    db.exec(`ALTER TABLE global_economy ADD COLUMN last_xp_time INTEGER DEFAULT 0`);
} catch (e) { /* Column already exists */ }

class Economy {
    static getUser(userId) {
        let user = db.prepare('SELECT * FROM global_economy WHERE user_id = ?').get(userId);
        if (!user) {
            db.prepare('INSERT INTO global_economy (user_id) VALUES (?)').run(userId);
            user = db.prepare('SELECT * FROM global_economy WHERE user_id = ?').get(userId);
        }
        return user;
    }

    static updateBalance(userId, amount) {
        const user = this.getUser(userId);
        const newBalance = Math.max(0, user.balance + amount);
        db.prepare('UPDATE global_economy SET balance = ? WHERE user_id = ?').run(newBalance, userId);
        return newBalance;
    }

    static addWin(userId, amount) {
        db.prepare('UPDATE global_economy SET total_won = total_won + ?, flip_count = flip_count + 1 WHERE user_id = ?').run(amount, userId);
    }

    static addLoss(userId, amount) {
        db.prepare('UPDATE global_economy SET total_lost = total_lost + ?, flip_count = flip_count + 1 WHERE user_id = ?').run(amount, userId);
    }

    static getLeaderboard(limit = 10) {
        return db.prepare('SELECT * FROM global_economy ORDER BY balance DESC LIMIT ?').all(limit);
    }

    static addXP(userId, amount) {
        const user = this.getUser(userId);
        const newXP = user.xp + amount;
        const newLevel = this.calculateLevel(newXP);
        
        db.prepare('UPDATE global_economy SET xp = ?, level = ?, last_xp_time = ? WHERE user_id = ?')
          .run(newXP, newLevel, Date.now(), userId);
        
        return { levelUp: newLevel > user.level, oldLevel: user.level, newLevel };
    }

    static calculateLevel(xp) {
        let level = 1;
        while (this.getXPForLevel(level) <= xp) {
            level++;
        }
        return level - 1;
    }

    static getXPForLevel(level) {
        // Progressive XP curve: starts small, grows exponentially
        return Math.floor(100 * Math.pow(level, 1.8) + 50 * level);
    }

    static getXPProgress(user) {
        const currentLevelXP = this.getXPForLevel(user.level);
        const nextLevelXP = this.getXPForLevel(user.level + 1);
        const progress = user.xp - currentLevelXP;
        const needed = nextLevelXP - currentLevelXP;
        return { progress, needed, percentage: Math.floor((progress / needed) * 100) };
    }

    static setCustomBackground(userId, bgUrl) {
        db.prepare('UPDATE global_economy SET custom_bg = ? WHERE user_id = ?').run(bgUrl, userId);
    }

    static getCustomBackground(userId) {
        const user = this.getUser(userId);
        return user.custom_bg;
    }

    static claimDaily(userId) {
        const user = this.getUser(userId);
        const today = new Date().toDateString();
        
        if (user.daily_last === today) {
            return { success: false, message: 'Already claimed today!' };
        }

        const reward = Math.floor(Math.random() * 500) + 500; // 500-1000 coins
        this.updateBalance(userId, reward);
        db.prepare('UPDATE global_economy SET daily_last = ? WHERE user_id = ?').run(today, userId);
        
        return { success: true, amount: reward };
    }

    static getGlobalStats() {
        const stats = db.prepare(`
            SELECT 
                COUNT(*) as total_users,
                SUM(balance) as total_money,
                SUM(flip_count) as total_flips,
                SUM(total_won) as total_won,
                SUM(total_lost) as total_lost
            FROM global_economy
        `).get();
        
        return stats;
    }
}

module.exports = Economy;
