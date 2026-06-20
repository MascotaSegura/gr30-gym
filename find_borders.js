const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.html') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(__dirname);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;
  
  // A regex to find buttons or links with padding like px-6 py-3 or similar
  // and add border-4 border-brand-black if not present
  
  // This is too risky to automate blindly, let's just log them first.
  let lines = content.split('\n');
  lines.forEach((line, i) => {
    if ((line.includes('<button') || line.includes('<a ')) && line.includes('class="') && line.includes('px-') && !line.includes('border-4')) {
      console.log(`Missing border-4 in ${file}:${i+1} -> ${line.trim()}`);
    }
  });
});
