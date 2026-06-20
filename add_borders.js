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
  if (file.endsWith('add_borders.js') || file.endsWith('find_borders.js')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  let changed = false;
  
  lines = lines.map((line) => {
    if ((line.includes('<button') || line.includes('<a ')) && line.includes('class="') && line.includes('px-') && !line.includes('border-4')) {
      // It's a button or link with padding but no border
      changed = true;
      return line.replace('class="', 'class="border-4 border-brand-black ');
    }
    return line;
  });
  
  if (changed) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log(`Updated borders in: ${file}`);
  }
});
console.log('Done injecting borders.');
