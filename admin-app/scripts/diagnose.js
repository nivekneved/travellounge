// Final comprehensive fix for ProductManager.jsx
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/ProductManager.jsx');
let content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// The issue is that the selectedRoom conditional isn't properly closed
// Line 692: {selectedRoom all && (
// Need to find and fix the closing )}

// Looking at the error, line 815 is where the parser gets confused
// The structure should be:
// 692: {selectedRoom && (
// ... content ...
// 813: )}  ← close selectedRoom conditional  
// 814: </div> ← close line 676 flex-1 div
// 815: </div> ← close line 620 modal content div
// 816: </div> ← close line 618 modal overlay div
// 817: )} ← close line 617 showInventoryModal conditional

// Based on error showing column 30, there's likely a mismatch between
// the selectedRoom closing and the div structure

console.log('Line 692:', lines[691]);
console.log('Line 813:', lines[812]);
console.log('Line 814:', lines[813]);
console.log('Line 815:', lines[814]);
console.log('Line 816:', lines[815]);
console.log('Line 817:', lines[816]);
