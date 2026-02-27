/* eslint-disable no-console, no-useless-escape */
const fs = require('fs');
const file = 'c:/Users/deven/Desktop/Travel Lounge 2026/Dumbo/admin-app/src/pages/ProductManager.jsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/\{\!showModal && \(/g, '{!showModal && !showInventoryModal && (');

const targetModal = `<div className=\"fixed inset-0 z-[100] flex justify-end\">
 <div className=\"absolute inset-0 bg-primary/20 backdrop-blur-xl\" onClick={() => setShowInventoryModal(false)} />
 <div className=\"relative bg-white w-full h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500\">`;

const replaceModal = `<div className=\"space-y-8 animate-fade-in pb-20 w-full\">
 <div className=\"bg-white w-full min-h-[600px] flex flex-col rounded-3xl overflow-hidden shadow-sm border border-gray-100\">`;

c = c.replace(targetModal.replace(/\n/g, '\r\n'), replaceModal.replace(/\n/g, '\r\n'));

const targetEnd = ` }
 </div >
 );
};

export default ProductManager;`;

const replaceEnd = ` }
 </div>
 </div>
 );
};

export default ProductManager;`;

c = c.replace(targetEnd.replace(/\n/g, '\r\n'), replaceEnd.replace(/\n/g, '\r\n'));

fs.writeFileSync(file, c, 'utf8');
console.log('Update done.');
