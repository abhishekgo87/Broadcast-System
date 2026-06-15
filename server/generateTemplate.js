const XLSX = require('xlsx');
const path = require('path');

const data = [
  { Name: 'Enter name  here ', Number: 'Enter Number here ' },

];

const ws1 = XLSX.utils.json_to_sheet(data);

const instructions = [
  { Info: "1. The application always reads the first sheet." },
  { Info: "2. The sheet must contain 'Name' and 'Number' columns." },
  { Info: "3. The country code (+91) will be automatically added if not provided." }
];
const ws2 = XLSX.utils.json_to_sheet(instructions);

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws1, "Contacts");
XLSX.utils.book_append_sheet(wb, ws2, "Instructions");

const outPath = path.join(__dirname, '..', 'public', 'sms_contacts_template.xlsx');
XLSX.writeFile(wb, outPath);
console.log("Template generated with 2 sheets at", outPath);
