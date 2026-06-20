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
  // skip this script
  if (file.endsWith('remove_transitions.js')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  // Regex to remove tailwind transition classes and cleanup extra spaces
  const regex = /\b(transition-colors|transition-all|transition-opacity|transition-none|transition-transform|transition)\b/g;
  if (regex.test(content)) {
    content = content.replace(regex, '');
    // clean up double spaces
    content = content.replace(/  +/g, ' ');
    // clean up trailing spaces in class strings (rudimentary)
    content = content.replace(/ \s+"/g, '"');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
console.log('Done removing transitions.');
