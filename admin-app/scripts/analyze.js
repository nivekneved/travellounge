// Quick JS script to analyze JSX nesting in ProductManager.jsx
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/ProductManager.jsx');
const code = fs.readFileSync(filePath, 'utf-8');
const lines = code.split('\n');

let divBalance = 0;
let issues = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Count opening and closing divs
    const openDivs = (line.match(/<div/g) || []).length;
    const closeDivs = (line.match(/<\/div>/g) || []).length;

    divBalance += openDivs - closeDivs;

    // Track lines near problem area (810-820)
    if (lineNum >= 808 && lineNum <= 820) {
        issues.push(`Line ${lineNum}: balance=${divBalance}, open=${openDivs}, close=${closeDivs} | ${line.trim().substring(0, 60)}`);
    }
}

console.log('=== JSX Structure Analysis ===');
issues.forEach(issue => console.log(issue));
console.log(`\nFinal div balance: ${divBalance}`);
