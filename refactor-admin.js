const fs = require('fs');

const adminHtmlPath = 'c:/Users/DELL/Documents/GR30/admin.html';
let html = fs.readFileSync(adminHtmlPath, 'utf8');

// Extraer el contenido del script
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>', scriptStart);
let scriptContent = html.substring(scriptStart + 8, scriptEnd);

// Add supabase CDN and externalize script
html = html.substring(0, scriptStart) + 
       '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n' +
       '<script src="assets/js/supabase.js" type="module"></script>\n' +
       '<script src="assets/js/admin.js" type="module"></script>\n' + 
       html.substring(scriptEnd + 9);

fs.writeFileSync(adminHtmlPath, html);
fs.writeFileSync('c:/Users/DELL/Documents/GR30/assets/js/admin.js', scriptContent);

console.log("Extracted admin.js");
