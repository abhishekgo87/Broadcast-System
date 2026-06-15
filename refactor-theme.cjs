const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace flashy gradients with solid professional blue
    content = content.replace(/bg-gradient-to-[a-z]+\s+from-[a-z]+-\d+\s+(via-[a-z]+-\d+\s+)?to-[a-z]+-\d+/g, 'bg-blue-600');
    
    // Replace text gradients with white text
    content = content.replace(/bg-gradient-to-[a-z]+\s+from-[a-z]+-\d+\s+via-[a-z]+-\d+\s+to-[a-z]+-\d+\s+bg-clip-text\s+text-transparent/g, 'text-gray-100');
    
    // Replace background blobs
    content = content.replace(/<div className="fixed.*?bg-\[radial-gradient.*?\/>/g, '');
    
    // Replace specific pink/cyan classes
    content = content.replace(/pink-500/g, 'blue-500');
    content = content.replace(/rose-500/g, 'blue-600');
    content = content.replace(/cyan-500/g, 'blue-500');
    content = content.replace(/emerald-500/g, 'green-600');
    content = content.replace(/indigo-500/g, 'gray-700');
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Theme refactored successfully.');
