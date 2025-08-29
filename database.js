const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, 'levels.db'), (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database');
                this.initTables();
            }
        });
    }

    initTables() {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                guild_id TEXT NOT NULL,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                total_messages INTEGER DEFAULT 0,
                last_message_time INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, guild_id)
            )
        `;

        const createLevelRolesTable = `
            CREATE TABLE IF NOT EXISTS level_roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                level INTEGER NOT NULL,
                role_id TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(guild_id, level)
            )
        `;

        const createGuildSettingsTable = `
            CREATE TABLE IF NOT EXISTS guild_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT UNIQUE NOT NULL,
                welcome_channel_id TEXT,
                goodbye_channel_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.run(createUsersTable, (err) => {
            if (err) console.error('Error creating users table:', err.message);
            else console.log('Users table ready');
        });

        this.db.run(createLevelRolesTable, (err) => {
            if (err) console.error('Error creating level_roles table:', err.message);
            else console.log('Level roles table ready');
        });

        this.db.run(createGuildSettingsTable, (err) => {
            if (err) console.error('Error creating guild_settings table:', err.message);
            else console.log('Guild settings table ready');
        });
    }

    // Get user data
    getUser(userId, guildId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE user_id = ? AND guild_id = ?';
            this.db.get(query, [userId, guildId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Create or update user
    upsertUser(userId, guildId, xpGain = 0) {
        return new Promise((resolve, reject) => {
            const now = Date.now();
            const query = `
                INSERT INTO users (user_id, guild_id, xp, total_messages, last_message_time, updated_at)
                VALUES (?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, guild_id) DO UPDATE SET
                    xp = xp + ?,
                    total_messages = total_messages + 1,
                    last_message_time = ?,
                    updated_at = CURRENT_TIMESTAMP
            `;
            
            this.db.run(query, [userId, guildId, xpGain, now, xpGain, now], function(err) {
                if (err) {
                    // If ON CONFLICT doesn't work, try INSERT OR REPLACE
                    const fallbackQuery = `
                        INSERT OR REPLACE INTO users (user_id, guild_id, xp, level, total_messages, last_message_time, updated_at)
                        VALUES (?, ?, 
                            COALESCE((SELECT xp FROM users WHERE user_id = ? AND guild_id = ?), 0) + ?,
                            COALESCE((SELECT level FROM users WHERE user_id = ? AND guild_id = ?), 1),
                            COALESCE((SELECT total_messages FROM users WHERE user_id = ? AND guild_id = ?), 0) + 1,
                            ?, 
                            CURRENT_TIMESTAMP)
                    `;
                    
                    this.db.run(fallbackQuery, [userId, guildId, userId, guildId, xpGain, userId, guildId, userId, guildId, now], function(fallbackErr) {
                        if (fallbackErr) reject(fallbackErr);
                        else resolve(this.changes);
                    });
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    // Update user level
    updateUserLevel(userId, guildId, newLevel) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE users SET level = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND guild_id = ?';
            this.db.run(query, [newLevel, userId, guildId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    // Get leaderboard
    getLeaderboard(guildId, limit = 10) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT user_id, xp, level, total_messages 
                FROM users 
                WHERE guild_id = ? 
                ORDER BY xp DESC 
                LIMIT ?
            `;
            this.db.all(query, [guildId, limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get user rank
    getUserRank(userId, guildId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT COUNT(*) + 1 as rank
                FROM users u1
                WHERE u1.guild_id = ? AND u1.xp > (
                    SELECT u2.xp FROM users u2 
                    WHERE u2.user_id = ? AND u2.guild_id = ?
                )
            `;
            this.db.get(query, [guildId, userId, guildId], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.rank : null);
            });
        });
    }

    // Level role management
    addLevelRole(guildId, level, roleId) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT OR REPLACE INTO level_roles (guild_id, level, role_id)
                VALUES (?, ?, ?)
            `;
            this.db.run(query, [guildId, level, roleId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    // Get level roles for guild
    getLevelRoles(guildId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM level_roles WHERE guild_id = ? ORDER BY level ASC';
            this.db.all(query, [guildId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Remove level role
    removeLevelRole(guildId, level) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM level_roles WHERE guild_id = ? AND level = ?';
            this.db.run(query, [guildId, level], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    // Welcome/Goodbye channel management
    setWelcomeChannel(guildId, channelId) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT OR REPLACE INTO guild_settings (guild_id, welcome_channel_id, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            `;
            this.db.run(query, [guildId, channelId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    setGoodbyeChannel(guildId, channelId) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT OR REPLACE INTO guild_settings (guild_id, goodbye_channel_id, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            `;
            this.db.run(query, [guildId, channelId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }

    getGuildSettings(guildId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM guild_settings WHERE guild_id = ?';
            this.db.get(query, [guildId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Close database connection
    close() {
        this.db.close((err) => {
            if (err) console.error('Error closing database:', err.message);
            else console.log('Database connection closed');
        });
    }
}

module.exports = Database;
