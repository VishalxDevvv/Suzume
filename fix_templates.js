const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix common template literal issues
        content = content.replace(/`\${ROYAL_EMOJIS\./g, '`${ROYAL_EMOJIS.');
        content = content.replace(/}\`/g, '}');
        content = content.replace(/{ name: `\${ROYAL_EMOJIS\./g, '{ name: `${ROYAL_EMOJIS.');
        content = content.replace(/}` /g, '} ');
        content = content.replace(/}`,/g, '}`,');
        
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
    } catch (error) {
        console.error(`Error fixing ${filePath}:`, error.message);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.js')) {
            fixFile(filePath);
        }
    }
}

walkDir('./commands');
console.log('Template literal fixes complete!');
