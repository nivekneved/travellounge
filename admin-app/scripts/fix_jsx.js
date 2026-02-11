const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/ProductManager.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace lines 813-817 with correct structure
const lines = content.split('\n');

// Target lines 813-817 (0-indexed: 812-816)
lines[812] = '                                )}';
lines[813] = '                            </div>';
lines[814] = '                        </div>';
lines[815] = '                    </div>';
lines[816] = '                )}';

content = lines.join('\n');
fs.writeFileSync(filePath, content, 'utf-8');
console.log('✓ Fixed JSX closure structure at lines 813-817');
