const fs = require('fs');

const primaryBtnClass = "w-full sm:w-auto text-center border-4 border-brand-black bg-brand-black text-brand-white font-display font-bold uppercase tracking-widest px-8 py-4 text-sm hover:bg-brand-green hover:border-brand-green hover:text-brand-black focus:bg-brand-green focus:border-brand-green focus:text-brand-black focus:outline-none active:bg-brand-green active:border-brand-green active:text-brand-black transition-colors";
const secondaryBtnClass = "w-full sm:w-auto text-center border-4 border-brand-black bg-brand-white text-brand-black font-display font-bold uppercase tracking-widest px-8 py-4 text-sm hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white focus:outline-none active:bg-brand-black active:text-brand-white transition-colors";

function fixSysModal(html) {
  // Replace the modal button bases
  html = html.replace(/const btnBase = ".*?";/, `const btnBase = "font-display font-bold uppercase tracking-widest px-8 py-4 border-4 border-brand-black focus:outline-none transition-colors w-full sm:w-auto text-center text-sm";`);
  // If there are specific ones with btnCancel / btnOk they will use the updated btnBase.
  // We make sure btnCancel and btnOk are completely consistent.
  html = html.replace(/btnCancel\.className = btnBase \+ ".*?";/g, `btnCancel.className = btnBase + " bg-brand-white text-brand-black hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white active:bg-brand-black active:text-brand-white";`);
  html = html.replace(/btnOk\.className = btnBase \+ ".*?";/g, `btnOk.className = btnBase + " bg-brand-black text-brand-white hover:bg-brand-green hover:border-brand-green hover:text-brand-black focus:bg-brand-green focus:border-brand-green focus:text-brand-black active:bg-brand-green active:border-brand-green active:text-brand-black";`);
  return html;
}

// 1. login.html
let loginHtml = fs.readFileSync('c:/Users/DELL/Documents/GR30/login.html', 'utf8');
// Fix face capture screen layout
loginHtml = loginHtml.replace(/<div id="screen-face-capture" class="screen hidden fixed inset-0 z-\[100\] bg-brand-black flex-col">/, 
  `<div id="screen-face-capture" class="screen hidden fixed top-0 left-0 w-full h-[100dvh] z-[9999] bg-brand-black flex-col">`);
// Fix main form buttons
loginHtml = loginHtml.replace(/<button type="submit" class=".*?Iniciar Sesión<\/button>/, `<button type="submit" class="${primaryBtnClass} mt-2">Iniciar Sesión</button>`);
loginHtml = loginHtml.replace(/<button type="submit" class=".*?Continuar<\/button>/, `<button type="submit" class="${primaryBtnClass} mt-2">Continuar</button>`);
loginHtml = loginHtml.replace(/<button type="button" onclick="startFaceVer\(\)" class=".*?">Activar Cámara<\/button>/, `<button type="button" onclick="startFaceVer()" class="${primaryBtnClass}">Activar Cámara</button>`);
loginHtml = loginHtml.replace(/<button type="submit" class=".*?Finalizar Registro<\/button>/, `<button type="submit" class="${primaryBtnClass} mt-2">Finalizar Registro</button>`);
// Fix text links to text-sm
loginHtml = loginHtml.replace(/text-xs hover:underline/g, 'text-sm hover:underline');
loginHtml = fixSysModal(loginHtml);
fs.writeFileSync('c:/Users/DELL/Documents/GR30/login.html', loginHtml);

// 2. admin.html
let adminHtml = fs.readFileSync('c:/Users/DELL/Documents/GR30/admin.html', 'utf8');
// Fix "Nuevo Miembro" etc buttons
adminHtml = adminHtml.replace(/<button onclick="openModal\('staff-form'\)" class=".*?">/g, `<button onclick="openModal('staff-form')" class="${primaryBtnClass} flex items-center justify-center gap-2 flex-shrink-0">`);
adminHtml = adminHtml.replace(/<button onclick="setScreen\('miembros'\)" class=".*?">/g, `<button onclick="setScreen('miembros')" class="${secondaryBtnClass}">`);
adminHtml = adminHtml.replace(/<button onclick="openModal\('member-form'\)" class=".*?">/g, `<button onclick="openModal('member-form')" class="${primaryBtnClass} flex items-center justify-center gap-2 flex-shrink-0">`);
adminHtml = adminHtml.replace(/<button onclick="openModal\('plan-form', null\)" class=".*?">/g, `<button onclick="openModal('plan-form', null)" class="${primaryBtnClass} flex items-center justify-center gap-2 flex-shrink-0">`);
// Sidebar nav buttons
adminHtml = adminHtml.replace(/class="nav-btn w-full text-left px-6 py-4 font-display font-bold text-sm tracking-widest uppercase transition-colors focus:outline-none text-brand-black hover:bg-brand-green hover:text-brand-black focus:bg-brand-green focus:text-brand-black active:bg-brand-green active:text-brand-black flex items-center gap-3"/g,
  `class="nav-btn w-full text-left px-6 py-4 border-4 border-transparent hover:border-brand-black font-display font-bold text-sm tracking-widest uppercase transition-colors focus:outline-none text-brand-black hover:bg-brand-green hover:text-brand-black focus:bg-brand-green focus:text-brand-black active:bg-brand-green active:text-brand-black flex items-center gap-3"`);
fs.writeFileSync('c:/Users/DELL/Documents/GR30/admin.html', adminHtml);

// 3. admin.js
let adminJs = fs.readFileSync('c:/Users/DELL/Documents/GR30/assets/js/admin.js', 'utf8');
adminJs = adminJs.replace(/const btnClasses = ".*?";/, `const btnClasses = "font-display font-bold uppercase tracking-widest px-6 py-3 text-xs border-4 border-brand-black bg-brand-black text-brand-white hover:bg-brand-green hover:border-brand-green hover:text-brand-black focus:bg-brand-green focus:border-brand-green focus:text-brand-black active:bg-brand-green active:border-brand-green active:text-brand-black transition-colors focus:outline-none";`);
adminJs = adminJs.replace(/const btnDangerClasses = ".*?";/, `const btnDangerClasses = "font-display font-bold uppercase tracking-widest px-6 py-3 text-xs bg-brand-white text-brand-black border-4 border-brand-black hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white active:bg-brand-black active:text-brand-white transition-colors focus:outline-none";`);
adminJs = adminJs.replace(/const saveBtnCls = ".*?";/, `const saveBtnCls = "font-display font-bold uppercase tracking-widest px-8 py-4 border-4 border-brand-black bg-brand-black text-brand-white hover:bg-brand-green hover:border-brand-green hover:text-brand-black focus:bg-brand-green focus:border-brand-green focus:text-brand-black active:bg-brand-green active:border-brand-green active:text-brand-black transition-colors focus:outline-none w-full sm:w-auto text-center text-sm";`);
adminJs = adminJs.replace(/const cancelBtnCls = ".*?";/, `const cancelBtnCls = "font-display font-bold uppercase tracking-widest px-8 py-4 border-4 border-brand-black bg-brand-white text-brand-black hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white active:bg-brand-black active:text-brand-white transition-colors focus:outline-none w-full sm:w-auto text-center text-sm";`);
adminJs = adminJs.replace(/const deleteBtnCls = ".*?";/, `const deleteBtnCls = "font-display font-bold uppercase tracking-widest px-8 py-4 border-4 border-brand-black bg-brand-white text-brand-black hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white active:bg-brand-black active:text-brand-white transition-colors focus:outline-none w-full sm:w-auto text-center text-sm";`);

adminJs = adminJs.replace(/class="font-display font-bold uppercase tracking-widest px-4 py-2 text-xs bg-brand-white text-brand-black hover:bg-brand-green hover:text-brand-black focus:bg-brand-green transition-colors"/g,
  `class="\${btnClasses}"`);
adminJs = adminJs.replace(/class="font-display font-bold uppercase tracking-widest px-4 py-2 text-xs bg-brand-black text-brand-white hover:bg-brand-white hover:text-brand-black focus:bg-brand-white focus:text-brand-black active:bg-brand-white active:text-brand-black transition-colors focus:outline-none"/g,
  `class="\${btnDangerClasses}"`);
adminJs = fixSysModal(adminJs);
fs.writeFileSync('c:/Users/DELL/Documents/GR30/assets/js/admin.js', adminJs);

// 4. index.html
let indexHtml = fs.readFileSync('c:/Users/DELL/Documents/GR30/index.html', 'utf8');
indexHtml = indexHtml.replace(/<button type="submit" class="w-full bg-brand-black text-brand-white\s+font-display font-bold uppercase tracking-widest py-5 text-sm md:text-base hover:bg-brand-green hover:text-brand-black\s+focus:bg-brand-green focus:text-brand-black\s+focus:outline-none active:bg-brand-green active:text-brand-black\s+transition-colors">/, 
  `<button type="submit" class="${primaryBtnClass}">`);
indexHtml = indexHtml.replace(/<a href="#contacto" class="inline-flex bg-brand-green text-brand-black px-8 py-4 font-display font-bold uppercase tracking-widest text-sm hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white focus:outline-none active:bg-brand-black active:text-brand-white transition-colors w-max">/,
  `<a href="#contacto" class="${primaryBtnClass} !bg-brand-green !text-brand-black hover:!bg-brand-black hover:!text-brand-white hover:!border-brand-black focus:!bg-brand-black focus:!text-brand-white active:!bg-brand-black active:!text-brand-white w-max">`);
// Fix btnCls inside loadData (which is inline in index.html)
indexHtml = indexHtml.replace(/const btnCls = "w-full px-8 py-4 text-center bg-brand-black text-brand-white .*?";/,
  `const btnCls = "${primaryBtnClass}";`);
indexHtml = fixSysModal(indexHtml);
fs.writeFileSync('c:/Users/DELL/Documents/GR30/index.html', indexHtml);

console.log('UI/UX fixed!');
