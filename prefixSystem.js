const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'prefixes.db'));

// Create prefix table
db.exec(`
    CREATE TABLE IF NOT EXISTS server_prefixes (
        guild_id TEXT PRIMARY KEY,
        prefix TEXT DEFAULT '$',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

class PrefixSystem {
    static getPrefix(guildId) {
        if (!guildId) return '$'; // Default for DMs
        
        let result = db.prepare('SELECT prefix FROM server_prefixes WHERE guild_id = ?').get(guildId);
        if (!result) {
            // Set default prefix for new servers
            db.prepare('INSERT INTO server_prefixes (guild_id, prefix) VALUES (?, ?)').run(guildId, '$');
            return '$';
        }
        return result.prefix;
    }

    static setPrefix(guildId, newPrefix) {
        if (!guildId) return false;
        
        // Validate prefix (1-3 characters, no spaces)
        if (!newPrefix || newPrefix.length > 3 || newPrefix.includes(' ')) {
            return false;
        }

        db.prepare('INSERT OR REPLACE INTO server_prefixes (guild_id, prefix) VALUES (?, ?)').run(guildId, newPrefix);
        return true;
    }

    static getAllPrefixes() {
        return db.prepare('SELECT * FROM server_prefixes').all();
    }
}

module.exports = PrefixSystem;
