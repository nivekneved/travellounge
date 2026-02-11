const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Hero.jsx');
let content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split(/\r?\n/);

// Remove duplicate export lines (keep only one at the end)
const filtered = [];
let exportFound = false;

for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();

    if (line === 'export default Hero;') {
        if (!exportFound) {
            filtered.unshift(lines[i]);
            exportFound = true;
        }
        // Skip duplicate exports
    } else {
        filtered.unshift(lines[i]);
    }
}

content = filtered.join('\n');
fs.writeFileSync(filePath, content, 'utf-8');
console.log('✓ Removed duplicate export statements');
