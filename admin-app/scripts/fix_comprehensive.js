// Comprehensive fix for ProductManager.jsx closure issue
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/ProductManager.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Split by both \r\n and \n to handle mixed lineendings  
const lines = content.split(/\r?\n/);

// Show current state
console.log('Current lines 810-818:');
for (let i = 809; i < 818; i++) {
    console.log(`Line ${i + 1}: "${lines[i]}"`);
}

// Fix: The structure should be:
// 676: <div className="flex-1 overflow-y-auto...">  (body container)
// 677:   <div className="flex gap-4...">            (room tabs)
// 690:   </div>
// 692:   {selectedRoom && (
// 693:     <div className="space-y-8...">           (calendar container)
// ... calendar content ...
// 812:     </div>                                  (close 694)
// 813:   )}                                        (close 692 selectedRoom conditional)
// 814: </div>                                      (close 676 body container)
// 815: </div>                                      (close 620 modal content)
// 816: </div>                                      (close 618 modal overlay)
// 817: )}                                          (close 617 showInventoryModal)

lines[812] = '                                    </div>';  // close div at 694
lines[813] = '                                )}';          // close selectedRoom conditional at 692
lines[814] = '                        </div>';              // close div at 676 (body)
lines[815] = '                    </div>';                  // close div at 620 (modal content)
lines[816] = '                </div>';                      // close div at 618 (modal overlay)
lines[817] = '            )}';                              // close showInventoryModal at 617

content = lines.join('\n');
fs.writeFileSync(filePath, content, 'utf-8');

console.log('\n✓ Fixed lines 813-818 with proper closure structure');
console.log('\nNew lines 810-818:');
for (let i = 809; i < 818; i++) {
    console.log(`Line ${i + 1}: "${lines[i]}"`);
}
