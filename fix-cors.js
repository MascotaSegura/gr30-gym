const fs = require('fs');

// 1. Create supabase-global.js
fs.writeFileSync('c:/Users/DELL/Documents/GR30/assets/js/supabase.js', `
const SUPABASE_URL = 'https://ibslnogitgwtyeyxfscw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_G43BK4zraE7IZ-HrQoL0oA_NVo2QLoL';
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
`);

// 2. Fix admin.js
let adminJs = fs.readFileSync('c:/Users/DELL/Documents/GR30/assets/js/admin.js', 'utf8');
adminJs = adminJs.replace(/import \{ supabase \} from '\.\/supabase\.js';\n*/g, '');
adminJs = adminJs.replace(/supabase\.from/g, 'window.supabaseClient.from');
fs.writeFileSync('c:/Users/DELL/Documents/GR30/assets/js/admin.js', adminJs);

// 3. Fix admin.html
let adminHtml = fs.readFileSync('c:/Users/DELL/Documents/GR30/admin.html', 'utf8');
adminHtml = adminHtml.replace(/<script src="assets\/js\/supabase\.js" type="module"><\/script>/, '<script src="assets/js/supabase.js"></script>');
adminHtml = adminHtml.replace(/<script src="assets\/js\/admin\.js" type="module"><\/script>/, '<script src="assets/js/admin.js"></script>');
fs.writeFileSync('c:/Users/DELL/Documents/GR30/admin.html', adminHtml);

// 4. Fix index.html
let indexHtml = fs.readFileSync('c:/Users/DELL/Documents/GR30/index.html', 'utf8');
indexHtml = indexHtml.replace(/<script type="module">[\s]*import \{ supabase \} from '\.\/assets\/js\/supabase\.js';/, '<script src="assets/js/supabase.js"></script>\n  <script>');
indexHtml = indexHtml.replace(/supabase\.from/g, 'window.supabaseClient.from');
fs.writeFileSync('c:/Users/DELL/Documents/GR30/index.html', indexHtml);

// 5. Fix login.html
let loginHtml = fs.readFileSync('c:/Users/DELL/Documents/GR30/login.html', 'utf8');
loginHtml = loginHtml.replace(/import \{ supabase \} from '\.\/assets\/js\/supabase\.js';\n*/g, '');
// Since login.html still needs type="module" for MediaPipe:
loginHtml = loginHtml.replace(/<script type="module">/, '<script src="assets/js/supabase.js"></script>\n  <script type="module">');
loginHtml = loginHtml.replace(/supabase\.from/g, 'window.supabaseClient.from');
fs.writeFileSync('c:/Users/DELL/Documents/GR30/login.html', loginHtml);

console.log("CORS issues fixed!");
