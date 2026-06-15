const XLSX = require('xlsx');
const path = require('path');

const data = [
  { Name: 'Test User 1', Number: '9999999991' },
  { Name: 'Test User 2', Number: '9999999992' }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Contacts");

// Desktop par save kar rahe hain
const outPath = path.join(process.env.USERPROFILE || 'C:\\Users\\anque', 'Desktop', 'sample_contacts.xlsx');
XLSX.writeFile(wb, outPath);

console.log("✅ Sample Excel file created at:", outPath);
