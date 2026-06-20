window.sysModal = function(type, title, message) {
 return new Promise((resolve) => {
 let overlay = document.getElementById('sys-modal-overlay');
 if (!overlay) {
 document.body.insertAdjacentHTML('beforeend', `
 <div id="sys-modal-overlay" role="dialog" aria-modal="true" class="fixed inset-0 hidden items-start justify-center p-4 sm:p-6 overflow-y-auto pt-12 sm:pt-[10vh] bg-black/90 z-[999999]">
 <div class="bg-brand-white w-full border-4 border-brand-black flex flex-col mb-12 relative max-w-lg">
 <div id="sys-modal-header" class="px-6 py-4 flex items-center gap-4 border-b-4 border-brand-black relative">
 <i id="sys-modal-icon" class="ph-bold text-3xl"></i>
 <h3 id="sys-modal-title" class="font-display font-bold uppercase tracking-widest text-lg sm:text-xl leading-none mt-1 pr-12"></h3>
 <button id="sys-modal-close-btn" data-sys-audio-ignore="true" aria-label="Cerrar" class="absolute top-4 right-4 text-current hover:text-brand-green focus:text-brand-green active:text-brand-green focus:outline-none text-2xl bg-transparent p-1 z-10"><i class="ph-bold ph-x"></i></button>
 </div>
 <div class="p-6 sm:p-8 overflow-y-auto max-h-[60vh]">
 <div id="sys-modal-msg" class="font-medium text-lg leading-relaxed text-brand-black"></div>
 </div>
 <div id="sys-modal-footer" class="p-6 border-t-4 border-brand-black flex flex-col sm:flex-row justify-end gap-4 bg-brand-white"></div>
 </div>
 </div>
 `);
 overlay = document.getElementById('sys-modal-overlay');
 }
 
 const header = document.getElementById('sys-modal-header');
 const icon = document.getElementById('sys-modal-icon');
 const titleEl = document.getElementById('sys-modal-title');
 const msgEl = document.getElementById('sys-modal-msg');
 const footer = document.getElementById('sys-modal-footer');
 
 icon.className = "ph-bold text-3xl";
 header.className = "px-6 py-4 flex items-center gap-4 border-b-4 border-brand-black";
 
 if (type === 'error') {
 icon.classList.add('ph-warning');
 header.classList.add('bg-brand-black', 'text-brand-white');
 if (window.sysAudio) window.sysAudio('error');
 } else if (type === 'success') {
 icon.classList.add('ph-check-circle');
 header.classList.add('bg-brand-green', 'text-brand-black');
 if (window.sysAudio) window.sysAudio('success');
 } else if (type === 'info') {
 icon.classList.add('ph-info');
 header.classList.add('bg-brand-black', 'text-brand-white');
 if (window.sysAudio) window.sysAudio('notification');
 } else if (type === 'confirm') {
 icon.classList.add('ph-question');
 header.classList.add('bg-brand-black', 'text-brand-white');
 if (window.sysAudio) window.sysAudio('modalOpen');
 }
 
 titleEl.textContent = title;
 msgEl.innerHTML = message;
 footer.innerHTML = '';
 
 const btnBase = "font-display font-bold uppercase tracking-widest px-8 py-4 border-4 border-brand-black focus:outline-none w-full sm:w-auto text-center text-sm";
 
 function closeAndResolve(val) {
 overlay.classList.remove('flex');
 overlay.classList.add('hidden');
 document.body.style.overflow = '';
 if (window.sysAudio) window.sysAudio('modalClose');
 resolve(val);
 }

 const closeBtn = document.getElementById('sys-modal-close-btn');
 if (closeBtn) closeBtn.onclick = () => closeAndResolve(false);

 document.body.style.overflow = 'hidden';

 if (type === 'confirm') {
 const btnCancel = document.createElement('button');
 btnCancel.className = btnBase + " bg-brand-white text-brand-black hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white active:bg-brand-black active:text-brand-white";
 btnCancel.setAttribute('data-sys-audio-ignore', 'true');
 btnCancel.textContent = "Cancelar";
 btnCancel.onclick = () => closeAndResolve(false);
 
 const btnOk = document.createElement('button');
 btnOk.className = btnBase + " bg-brand-black text-brand-white hover:bg-brand-green hover:border-brand-black hover:text-brand-black focus:bg-brand-green focus:border-brand-black focus:text-brand-black active:bg-brand-green active:border-brand-black active:text-brand-black";
 btnOk.setAttribute('data-sys-audio-ignore', 'true');
 btnOk.textContent = "Confirmar";
 btnOk.onclick = () => closeAndResolve(true);
 
 footer.appendChild(btnCancel);
 footer.appendChild(btnOk);
 } else {
 const btnOk = document.createElement('button');
 btnOk.className = btnBase + " bg-brand-black text-brand-white hover:bg-brand-green hover:border-brand-black hover:text-brand-black focus:bg-brand-green focus:border-brand-black focus:text-brand-black active:bg-brand-green active:border-brand-black active:text-brand-black";
 btnOk.setAttribute('data-sys-audio-ignore', 'true');
 btnOk.textContent = "Entendido";
 btnOk.onclick = () => closeAndResolve(true);
 footer.appendChild(btnOk);
 }
 
 overlay.classList.remove('hidden');
 overlay.classList.add('flex');
 });
};
