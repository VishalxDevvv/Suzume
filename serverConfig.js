const Database = require('better-sqlite3');
const path = require('path');

class ServerConfig {
    constructor() {
        this.db = new Database(path.join(__dirname, 'server_config.db'));
        this.init();
    }

    init() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS server_settings (
                guild_id TEXT PRIMARY KEY,
                welcome_channel TEXT,
                goodbye_channel TEXT,
                level_channel TEXT,
                welcome_message TEXT DEFAULT 'Welcome {user} to {server}!',
                goodbye_message TEXT DEFAULT 'Goodbye {user}!',
                level_enabled INTEGER DEFAULT 1,
                level_message TEXT DEFAULT '{user} reached level {level}!'
            )
        `);
    }

    getSettings(guildId) {
        const stmt = this.db.prepare('SELECT * FROM server_settings WHERE guild_id = ?');
        return stmt.get(guildId) || {};
    }

    setSetting(guildId, key, value) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO server_settings (guild_id, ${key}) 
            VALUES (?, ?)
        `);
        stmt.run(guildId, value);
    }

    setWelcomeChannel(guildId, channelId) {
        this.setSetting(guildId, 'welcome_channel', channelId);
    }

    setGoodbyeChannel(guildId, channelId) {
        this.setSetting(guildId, 'goodbye_channel', channelId);
    }

    setLevelChannel(guildId, channelId) {
        this.setSetting(guildId, 'level_channel', channelId);
    }

    setWelcomeMessage(guildId, message) {
        this.setSetting(guildId, 'welcome_message', message);
    }

    setGoodbyeMessage(guildId, message) {
        this.setSetting(guildId, 'goodbye_message', message);
    }

    setLevelMessage(guildId, message) {
        this.setSetting(guildId, 'level_message', message);
    }

    toggleLevels(guildId, enabled) {
        this.setSetting(guildId, 'level_enabled', enabled ? 1 : 0);
    }
}

module.exports = new ServerConfig();
