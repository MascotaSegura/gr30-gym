

let staffData = [];

let membersData = [];

let planesData = [];


const screenTitles = {
  dashboard: 'Dashboard.',
  staff:     'Staff.',
  miembros:  'Directorio.',
  pagos:     'Pagos.',
  planes:    'Planes.',
};

function setScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const targetScreen = document.getElementById('screen-' + name);
  if (targetScreen) targetScreen.classList.add('active');
  
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = screenTitles[name] || name;

  document.querySelectorAll('.nav-btn').forEach(btn => {
    const isActive = btn.dataset.screen === name;
    btn.classList.toggle('bg-brand-black', isActive);
    btn.classList.toggle('text-brand-white', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  if (window.innerWidth < 768) {
    document.getElementById('sidebar-nav').classList.add('hidden');
    document.getElementById('sidebar-nav').classList.remove('flex');
    document.getElementById('mobileMenuBtn').setAttribute('aria-expanded', 'false');
  }
  
  renderAll();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => setScreen(btn.dataset.screen));
});

document.getElementById('mobileMenuBtn').addEventListener('click', function() {
  const nav = document.getElementById('sidebar-nav');
  const icon = document.getElementById('adminMenuIcon');
  const isHidden = nav.classList.contains('hidden');
  if (isHidden) {
    nav.classList.remove('hidden');
    nav.classList.add('flex');
    icon.className = "ph-bold ph-x text-3xl";
    this.setAttribute('aria-expanded', 'true');
  } else {
    nav.classList.add('hidden');
    nav.classList.remove('flex');
    icon.className = "ph-bold ph-list text-3xl";
    this.setAttribute('aria-expanded', 'false');
  }
});

setScreen('dashboard');

async function fetchData() {
  const { data: staff } = await window.supabaseClient.from('staff').select('*');
  const { data: planes } = await window.supabaseClient.from('planes').select('*');
  const { data: miembros } = await window.supabaseClient.from('miembros').select('*');
  const { data: pagos } = await window.supabaseClient.from('pagos').select('*');
  
  if (staff) staffData = staff;
  if (planes) planesData = planes;
  
  if (miembros) {
    membersData = miembros.map(m => {
      const historial = pagos ? pagos.filter(p => p.miembro_id === m.id).sort((a,b) => new Date(b.fecha) - new Date(a.fecha)) : [];
      let fechaVenc = '-';
      if (historial.length > 0) {
        const lastDate = new Date(historial[0].fecha);
        lastDate.setMonth(lastDate.getMonth() + 1);
        fechaVenc = lastDate.toISOString().split('T')[0];
      }
      return { ...m, historialPagos: historial, fechaVencimiento: fechaVenc };
    });
  }
  
  renderAll();
}

fetchData();



function statusBadge(estadoPago) {
  if (estadoPago === 'al_dia') return '<span class="bg-brand-green text-brand-black font-display font-bold uppercase tracking-widest text-xs px-2 py-1 inline-block border-4 border-brand-green">Al Día</span>';
  if (estadoPago === 'atrasado') return '<span class="bg-brand-black text-brand-white font-display font-bold uppercase tracking-widest text-xs px-2 py-1 inline-flex items-center gap-1 w-max border-4 border-brand-black"><i class="ph-bold ph-warning text-sm"></i> Atrasado</span>';
  return '<span class="bg-brand-white text-brand-black font-display font-bold uppercase tracking-widest text-xs px-2 py-1 inline-block border-4 border-brand-black">Pendiente</span>';
}

function renderAll() {
  renderDashboardStats();
  renderTables();
  renderPlanes();
  renderPagos();
  updateAlerts();
}

function renderDashboardStats() {
  const statMiembros = document.getElementById('stat-miembros');
  const statStaff = document.getElementById('stat-staff');
  const statIngresos = document.getElementById('stat-ingresos');
  
  if (statMiembros) statMiembros.textContent = membersData.filter(m => m.activo !== false).length;
  if (statStaff) statStaff.textContent = staffData.length;
  if (statIngresos) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let ingresos = 0;
    membersData.forEach(m => {
      if (m.historialPagos) {
        m.historialPagos.forEach(p => {
          const d = new Date(p.fecha);
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            ingresos += parseInt(p.monto) || 0;
          }
        });
      }
    });
    statIngresos.textContent = '$' + (ingresos > 999 ? (ingresos/1000).toFixed(1) + 'k' : ingresos);
  }
}

// Búsqueda en tiempo real
document.getElementById('search-miembros').addEventListener('input', renderTables);
document.getElementById('search-pagos').addEventListener('input', renderPagos);

function renderTables() {
  const btnClasses = "font-display font-bold uppercase tracking-widest px-6 py-3 text-xs border-4 border-brand-black bg-brand-black text-brand-white hover:bg-brand-green hover:border-brand-green hover:text-brand-black focus:bg-brand-green focus:border-brand-green focus:text-brand-black active:bg-brand-green active:border-brand-green active:text-brand-black transition-colors focus:outline-none";
  const btnDangerClasses = "font-display font-bold uppercase tracking-widest px-6 py-3 text-xs bg-brand-white text-brand-black border-4 border-brand-black hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white active:bg-brand-black active:text-brand-white transition-colors focus:outline-none";
  const rowClasses = "border-b-4 border-brand-black hover:bg-brand-green focus-within:bg-brand-green transition-colors group";

  const stb = document.getElementById('staff-table-body');
  if (stb) {
    stb.innerHTML = staffData.slice(0,4).map(s => `
      <tr class="${rowClasses}">
        <td class="p-6 flex items-center gap-4  ">
          <div class="w-10 h-10 bg-brand-white text-brand-black   flex items-center justify-center font-display font-bold text-sm select-none flex-shrink-0 overflow-hidden">
            ${s.imagen ? `<img src="${s.imagen}" class="w-full h-full object-cover">` : s.avatar}
          </div>
          <span class="font-bold uppercase">${s.nombre}</span>
        </td>
        <td class="p-6  "><span class="bg-brand-black text-brand-white inline-block px-2 py-1 text-xs font-bold uppercase tracking-widest">${s.especialidad}</span></td>
        <td class="p-6 text-right whitespace-nowrap">
          <button onclick="openModal('staff-edit',${s.id})" class="${btnClasses} mr-2">Editar</button>
        </td>
      </tr>`).join('');
  }

  const sfb = document.getElementById('staff-full-table-body');
  if (sfb) {
    sfb.innerHTML = staffData.map(s => `
      <tr class="${rowClasses}">
        <td class="p-6 flex items-center gap-4  ">
          <div class="w-10 h-10 bg-brand-white text-brand-black   flex items-center justify-center font-display font-bold text-sm select-none flex-shrink-0 overflow-hidden">
            ${s.imagen ? `<img src="${s.imagen}" class="w-full h-full object-cover">` : s.avatar}
          </div>
          <span class="font-bold uppercase">${s.nombre}</span>
        </td>
        <td class="p-6  "><span class="bg-brand-black text-brand-white inline-block px-2 py-1 text-xs font-bold uppercase tracking-widest">${s.especialidad}</span></td>
        <td class="p-6  ">${s.turno}</td>
        <td class="p-6 text-right whitespace-nowrap">
          <button onclick="openModal('staff-edit',${s.id})" class="${btnClasses} mr-2">Editar</button>
          <button onclick="deleteStaff(${s.id})" class="${btnDangerClasses}">Eliminar</button>
        </td>
      </tr>`).join('');
  }

  // Miembros (Full) y Miembros (Preview)
  let mTerm = '';
  const searchInput = document.getElementById('search-miembros');
  if (searchInput) mTerm = searchInput.value.toLowerCase().trim();
  
  let mHtml = '';
  let prevHtml = '';
  let filteredMembers = membersData.filter(m => {
    const n = m.nombre ? m.nombre.toLowerCase() : '';
    const t = m.telefono ? m.telefono : '';
    return n.includes(mTerm) || t.includes(mTerm);
  });

  filteredMembers.forEach((m, i) => {
    const sBadge = statusBadge(m.estado_pago);
    const row = `
      <tr class="${rowClasses}">
        <td class="p-6  ">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-brand-black text-brand-white flex-shrink-0 flex items-center justify-center font-display font-bold text-sm select-none">${getInitials(m.nombre)}</div>
            <div>
              <span class="font-bold uppercase block leading-tight">${m.nombre}</span>
              <span class="text-xs tracking-widest opacity-60">${m.telefono}</span>
            </div>
          </div>
        </td>
        <td class="p-6 font-bold tracking-widest uppercase text-sm">${m.plan}</td>
        <td class="p-6  ">${sBadge}</td>
        <td class="p-6 text-right whitespace-nowrap">
          <button onclick="openHistorial(${m.id})" class="${btnClasses} mr-2">Historial</button>
          <button onclick="openModal('member-edit',${m.id})" class="${btnClasses} mr-2">Editar</button>
          <button onclick="deleteMember(${m.id})" class="${btnDangerClasses}"><i class="ph-bold ph-trash"></i></button>
        </td>
      </tr>
    `;
    mHtml += row;
    if (i < 4 && !mTerm) {
      prevHtml += `
        <tr class="${rowClasses}">
          <td class="p-6 font-bold uppercase">${m.nombre}</td>
          <td class="p-6 font-bold tracking-widest uppercase text-sm">${m.plan}</td>
          <td class="p-6  ">${sBadge}</td>
        </tr>
      `;
    }
  });

  const mfb = document.getElementById('members-full-table-body');
  if (mfb) mfb.innerHTML = mHtml;
  
  const mpb = document.getElementById('members-preview-body');
  if (mpb) mpb.innerHTML = prevHtml;
}

function renderPlanes() {
  const container = document.getElementById('planes-container');
  if (!container) return;

  container.innerHTML = planesData.map(p => {
    const bgCls = p.destacado ? 'bg-brand-green text-brand-black border-4 border-brand-green' : 'bg-brand-white text-brand-black border-4 border-brand-black';
    let priceHTML = p.destacado 
      ? `<p class="text-5xl sm:text-6xl font-display font-bold mb-6 text-brand-black group-hover:text-brand-green group-focus:text-brand-green group-active:text-brand-green tracking-tighter break-all">${p.precio}<span class="text-xl sm:text-2xl text-current tracking-normal">mxn</span></p>`
      : `<p class="text-5xl sm:text-6xl font-display font-bold mb-6 bg-brand-green text-brand-black inline-block px-3 py-1 tracking-tighter -ml-3 break-all">${p.precio}<span class="text-xl sm:text-2xl text-current tracking-normal">mxn</span></p>`;
      
    let bulletCls = p.destacado 
      ? 'text-brand-black group-hover:text-brand-green group-focus:text-brand-green group-active:text-brand-green font-bold'
      : 'text-brand-black group-hover:text-brand-white group-focus:text-brand-white group-active:text-brand-white font-bold';

    return `
      <div tabindex="0" class="${bgCls} p-8 sm:p-12 flex flex-col justify-between group hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white active:bg-brand-black active:text-brand-white transition-colors cursor-pointer">
        <div>
          <h3 class="text-3xl font-display font-bold uppercase mb-2">${p.nombre}</h3>
          ${priceHTML}
          <ul class="space-y-6 font-medium mb-8 text-lg">
            ${p.beneficios.map(b => `<li class="flex gap-4 items-start"><i class="ph-bold ph-check text-xl mt-1 ${bulletCls}"></i> ${b}</li>`).join('')}
          </ul>
        </div>
        <button onclick="openModal('plan-form', ${p.id})" class="w-full py-5 text-center bg-brand-black text-brand-white group-hover:bg-brand-white group-hover:text-brand-black group-focus:bg-brand-white group-focus:text-brand-black group-active:bg-brand-white group-active:text-brand-black hover:!bg-brand-green hover:!text-brand-black focus:!bg-brand-green focus:!text-brand-black focus:outline-none active:!bg-brand-green active:!text-brand-black transition-colors font-display font-bold uppercase tracking-widest text-sm md:text-base">Editar Plan</button>
      </div>
    `;
  }).join('');
}


let currentModalType = null;
let currentModalId   = null;

function openModal(type, idOrName) {
  currentModalType = type;
  currentModalId   = idOrName;
  const overlay = document.getElementById('modal-overlay');
  const title   = document.getElementById('modal-title');
  const body    = document.getElementById('modal-body');

  if (type === 'staff-form') {
    title.textContent = 'Añadir Staff.';
    body.innerHTML = staffFormHTML();
  } else if (type === 'staff-edit') {
    const s = staffData.find(x => x.id === idOrName);
    title.textContent = 'Editar Staff.';
    body.innerHTML = staffFormHTML(s);
  } else if (type === 'member-form') {
    title.textContent = 'Añadir Miembro.';
    body.innerHTML = memberFormHTML();
  } else if (type === 'member-edit') {
    const m = membersData.find(x => x.id === idOrName);
    title.textContent = 'Editar Miembro.';
    body.innerHTML = memberFormHTML(m);
  } else if (type === 'plan-form') {
    const p = planesData.find(x => x.id === idOrName);
    title.textContent = p ? 'Editar Plan — ' + p.nombre + '.' : 'Añadir Plan.';
    body.innerHTML = planFormHTML(p);
  }

  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
  
  setTimeout(() => {
    const first = body.querySelector('input, select, textarea');
    if (first) first.focus();
  }, 50);
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  overlay.classList.remove('flex');
  currentModalType = null;
  currentModalId   = null;
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});


const inputCls = 'w-full bg-brand-white text-brand-black border-4 border-brand-black px-4 py-4 sm:px-6 sm:py-5 text-lg sm:text-xl font-display font-bold tracking-wide focus:outline-none focus:bg-brand-green placeholder:text-brand-black/50 placeholder:uppercase transition-all';
const selectCls = 'w-full bg-brand-white text-brand-black border-4 border-brand-black px-4 py-4 sm:px-6 sm:py-5 pr-12 sm:pr-14 text-lg sm:text-xl font-display font-bold tracking-wide focus:outline-none focus:bg-brand-green cursor-pointer transition-all appearance-none';
const labelCls = 'block font-display font-bold uppercase tracking-widest text-xs sm:text-sm text-brand-black mb-2';
const saveBtnCls = 'w-full sm:w-auto px-8 py-4 font-display font-bold uppercase tracking-widest text-sm border-4 border-brand-black bg-brand-black text-brand-white hover:bg-brand-green hover:border-brand-green hover:text-brand-black focus:bg-brand-green focus:border-brand-green focus:text-brand-black active:bg-brand-green active:border-brand-green active:text-brand-black transition-colors focus:outline-none';
const cancelBtnCls = 'w-full sm:w-auto px-8 py-4 font-display font-bold uppercase tracking-widest text-sm border-4 border-brand-black bg-brand-white text-brand-black hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white active:bg-brand-black active:text-brand-white transition-colors focus:outline-none';
const deleteBtnCls = 'w-full sm:w-auto px-8 py-4 font-display font-bold uppercase tracking-widest text-sm border-4 border-brand-black bg-brand-black text-brand-white hover:bg-brand-white hover:border-brand-black hover:text-brand-black focus:bg-brand-white focus:border-brand-black focus:text-brand-black active:bg-brand-white active:border-brand-black active:text-brand-black transition-colors focus:outline-none';

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function staffFormHTML(s) {
  return `
    <form onsubmit="saveStaff(event)" class="flex flex-col gap-8 text-brand-black">
      <div>
        <label class="${labelCls}">Foto de Perfil</label>
        <div class="flex items-center gap-6">
          <div class="w-16 h-16 bg-brand-green text-brand-black flex items-center justify-center font-display font-bold text-2xl uppercase focus:outline-none focus:bg-brand-black focus:text-brand-white transition-colors" tabindex="0" id="staff-photo-preview">
            ${s && s.imagen ? `<img src="${s.imagen}" class="w-full h-full object-cover">` : (s ? getInitials(s.nombre) : '+')}
          </div>
          <div class="flex-1">
            <input type="file" id="sf-foto" accept="image/*" class="sr-only peer">
            <label for="sf-foto" class="w-full block text-center cursor-pointer border-4 border-brand-black bg-brand-white text-brand-black font-display font-bold uppercase tracking-widest text-xs sm:text-sm px-4 py-4 hover:bg-brand-black hover:text-brand-white peer-focus:bg-brand-black peer-focus:text-brand-white active:bg-brand-black active:text-brand-white transition-colors focus:outline-none">
              Subir Nueva Foto
            </label>
          </div>
        </div>
      </div>
      <div>
        <label class="${labelCls}" for="sf-nombre">Nombre Completo</label>
        <input id="sf-nombre" type="text" placeholder="EJ. JUAN PÉREZ" value="${s ? s.nombre : ''}" class="${inputCls}" required>
      </div>
      <div>
        <label class="${labelCls}" for="sf-esp">Especialidad</label>
        <input id="sf-esp" type="text" placeholder="EJ. FUERZA PURA" value="${s ? s.especialidad : ''}" class="${inputCls}" required>
      </div>
      <div>
        <label class="${labelCls}" for="sf-turno">Turno</label>
        <div class="relative">
          <select id="sf-turno" class="${selectCls}" required>
            <option value="" disabled ${!s ? 'selected' : ''}>SELECCIONAR TURNO</option>
            <option value="Mañana"  ${s && s.turno==='Mañana'  ? 'selected':''}>MAÑANA</option>
            <option value="Tarde"   ${s && s.turno==='Tarde'   ? 'selected':''}>TARDE</option>
            <option value="Noche"   ${s && s.turno==='Noche'   ? 'selected':''}>NOCHE</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-brand-black">
            <i class="ph-bold ph-caret-down text-xl"></i>
          </div>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row gap-4 mt-4">
        <button type="button" onclick="closeModal()" class="${cancelBtnCls}">Cancelar</button>
        <button type="submit" class="${saveBtnCls}">Guardar</button>
      </div>
    </form>`;
}

function memberFormHTML(m) {
  return `
    <form onsubmit="saveMember(event)" class="flex flex-col gap-8 text-brand-black">
      <div>
        <label class="${labelCls}" for="mf-nombre">Nombre Completo</label>
        <input id="mf-nombre" type="text" placeholder="EJ. ANA GÓMEZ" value="${m ? m.nombre : ''}" class="${inputCls}" required>
      </div>
      <div>
        <label class="${labelCls}" for="mf-tel">Teléfono</label>
        <input id="mf-tel" type="tel" placeholder="555-0000" value="${m ? m.telefono : ''}" class="${inputCls}" required>
      </div>
      <div>
        <label class="${labelCls}" for="mf-plan">Plan</label>
        <div class="relative">
          <select id="mf-plan" class="${selectCls}" required>
            <option value="" disabled ${!m ? 'selected' : ''}>SELECCIONAR PLAN</option>
            <option value="Visita Diaria" ${m && m.plan==='Visita Diaria' ? 'selected':''}>VISITA DIARIA</option>
            <option value="Mensual"       ${m && m.plan==='Mensual'       ? 'selected':''}>MENSUAL</option>
            <option value="Anual"         ${m && m.plan==='Anual'         ? 'selected':''}>ANUAL</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-brand-black">
            <i class="ph-bold ph-caret-down text-xl"></i>
          </div>
        </div>
      </div>
      <div>
        <label class="${labelCls}" for="mf-estado">Estado</label>
        <div class="relative">
          <select id="mf-estado" class="${selectCls}" required>
            <option value="1" ${(!m || (m && m.activo !== false)) ? 'selected':''}>ACTIVO</option>
            <option value="0" ${(m && m.activo === false) ? 'selected':''}>EXPIRADO</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-brand-black">
            <i class="ph-bold ph-caret-down text-xl"></i>
          </div>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row gap-4 mt-4">
        <button type="button" onclick="closeModal()" class="${cancelBtnCls}">Cancelar</button>
        <button type="submit" class="${saveBtnCls}">Guardar</button>
      </div>
    </form>`;
}

function planFormHTML(p) {
  const isNew = !p;
  const nombre = p ? p.nombre : '';
  const precio = p ? p.precio : '';
  const destacado = p ? p.destacado : false;
  const beneficios = p ? p.beneficios.join(', ') : '';

  return `
    <form onsubmit="savePlan(event)" class="flex flex-col gap-8 text-brand-black">
      <div>
        <label class="${labelCls}" for="pf-nombre">Nombre del Plan</label>
        <input id="pf-nombre" type="text" value="${nombre}" class="${inputCls}" required>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="${labelCls}" for="pf-precio">Precio</label>
          <input id="pf-precio" type="text" value="${precio}" class="${inputCls}" required>
        </div>
        <div>
          <label class="${labelCls}" for="pf-periodo">Periodo</label>
          <div class="relative">
            <select id="pf-periodo" class="${selectCls}" required>
              <option value="Unico" ${p && p.periodo === 'Unico' ? 'selected' : ''}>Pago Único / Visita</option>
              <option value="Mes" ${p && p.periodo === 'Mes' ? 'selected' : ''}>Mensual</option>
              <option value="Año" ${p && p.periodo === 'Año' ? 'selected' : ''}>Anual</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-brand-black">
              <i class="ph-bold ph-caret-down text-xl"></i>
            </div>
          </div>
        </div>
      </div>
      <div>
        <label class="${labelCls}" for="pf-desc">Descripción / Beneficios</label>
        <textarea id="pf-desc" rows="4" placeholder="BENEFICIOS SEPARADOS POR COMA" class="${inputCls} resize-none">${beneficios}</textarea>
      </div>
      <div>
        <label class="flex items-center gap-4 cursor-pointer font-display font-bold uppercase tracking-widest text-xs sm:text-sm text-brand-black group focus-within:text-brand-green transition-colors">
          <div class="relative w-8 h-8 border-4 border-brand-black bg-brand-white group-hover:bg-brand-green group-focus-within:bg-brand-green transition-colors flex-shrink-0 flex items-center justify-center">
            <input type="checkbox" id="pf-destacado" class="peer sr-only" ${destacado ? 'checked' : ''}>
            <div class="w-4 h-4 hidden peer-checked:block pointer-events-none bg-brand-black"></div>
          </div>
          Destacar Plan (Color Verde)
        </label>
      </div>
      <div class="flex flex-col sm:flex-row gap-4 mt-4">
        ${!isNew ? `<button type="button" onclick="deletePlan(${p.id})" class="${deleteBtnCls}">Eliminar</button>` : ''}
        <button type="button" onclick="closeModal()" class="${cancelBtnCls}">Cancelar</button>
        <button type="submit" class="${saveBtnCls}">Guardar Cambios</button>
      </div>
    </form>`;
}


function saveStaff(e) {
  e.preventDefault();
  const nombre      = document.getElementById('sf-nombre').value.trim();
  const especialidad= document.getElementById('sf-esp').value.trim();
  const turno       = document.getElementById('sf-turno').value;
  const avatar      = getInitials(nombre);

  if (currentModalType === 'staff-edit') {
    const s = staffData.find(x => x.id === currentModalId);
    if (s) { s.nombre = nombre; s.especialidad = especialidad; s.turno = turno; s.avatar = avatar; }
    showToast('STAFF ACTUALIZADO');
  } else {
    staffData.push({ id: Date.now(), avatar, imagen: null, nombre, especialidad, turno });
    showToast('STAFF AÑADIDO CON ÉXITO');
  }
  closeModal();
  renderAll();
}

function deleteStaff(id) {
  sysModal('confirm', 'ELIMINAR STAFF', '¿ESTÁS SEGURO DE ELIMINAR ESTE STAFF?').then(confirmed => {
    if (!confirmed) return;
    const idx = staffData.findIndex(x => x.id === id);
    if (idx !== -1) staffData.splice(idx, 1);
    showToast('STAFF ELIMINADO');
    renderAll();
  });
}

function saveMember(e) {
  e.preventDefault();
  const nombre   = document.getElementById('mf-nombre').value.trim();
  const telefono = document.getElementById('mf-tel').value.trim();
  const plan     = document.getElementById('mf-plan').value;
  const activo   = document.getElementById('mf-estado').value === '1';

  if (currentModalType === 'member-edit') {
    const m = membersData.find(x => x.id === currentModalId);
    if (m) { m.nombre = nombre; m.telefono = telefono; m.plan = plan; m.activo = activo; }
    showToast('MIEMBRO ACTUALIZADO');
  } else {
    membersData.push({ id: Date.now(), nombre, telefono, plan, activo });
    showToast('MIEMBRO AÑADIDO CON ÉXITO');
  }
  closeModal();
  renderAll();
}

function deleteMember(id) {
  sysModal('confirm', 'ELIMINAR MIEMBRO', '¿ESTÁS SEGURO DE ELIMINAR ESTE MIEMBRO?').then(confirmed => {
    if (!confirmed) return;
    const idx = membersData.findIndex(x => x.id === id);
    if (idx !== -1) membersData.splice(idx, 1);
    showToast('MIEMBRO ELIMINADO');
    renderAll();
  });
}

function savePlan(e) {
  e.preventDefault();
  const nombre = document.getElementById('pf-nombre').value.trim();
  const precio = document.getElementById('pf-precio').value.trim();
  const periodo = document.getElementById('pf-periodo').value;
  const desc = document.getElementById('pf-desc').value.trim();
  const destacado = document.getElementById('pf-destacado').checked;
  const beneficios = desc ? desc.split(',').map(x => x.trim()).filter(x => x) : [];

  if (currentModalType === 'plan-form') {
    if (currentModalId) {
      const p = planesData.find(x => x.id === currentModalId);
      if (p) {
        p.nombre = nombre; p.precio = precio; p.periodo = periodo;
        p.destacado = destacado; p.beneficios = beneficios;
      }
      showToast('PLAN ACTUALIZADO CON ÉXITO');
    } else {
      planesData.push({ id: Date.now(), nombre, precio, periodo, destacado, beneficios });
      showToast('PLAN AÑADIDO CON ÉXITO');
    }
  }
  closeModal();
  renderAll();
}

function deletePlan(id) {
  sysModal('confirm', 'ELIMINAR PLAN', '¿ESTÁS SEGURO DE ELIMINAR ESTE PLAN?').then(confirmed => {
    if (!confirmed) return;
    const idx = planesData.findIndex(x => x.id === id);
    if (idx !== -1) planesData.splice(idx, 1);
    showToast('PLAN ELIMINADO CON ÉXITO');
    closeModal();
    renderAll();
  });
}


function renderPagos() {
  const btnClasses = "font-display font-bold uppercase tracking-widest px-4 py-2 text-xs bg-brand-white text-brand-black border-4 border-brand-black hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white active:bg-brand-black active:text-brand-white transition-colors focus:outline-none";
  const rowClasses = "border-b-4 border-brand-black hover:bg-brand-green focus-within:bg-brand-green transition-colors group";
  
  const term = document.getElementById('search-pagos').value.toLowerCase().trim();
  const filtered = membersData.filter(m => {
    const n = m.nombre ? m.nombre.toLowerCase() : '';
    const t = m.telefono ? m.telefono : '';
    return n.includes(term) || t.includes(term);
  });

  const ptb = document.getElementById('pagos-table-body');
  if (ptb) {
    ptb.innerHTML = filtered.map(m => `
      <tr class="${rowClasses}">
        <td class="p-6">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-brand-black text-brand-white flex-shrink-0 flex items-center justify-center font-display font-bold text-sm select-none">${getInitials(m.nombre || '')}</div>
            <div>
              <span class="font-bold uppercase block leading-tight">${m.nombre}</span>
              <span class="text-xs tracking-widest opacity-60">${m.telefono}</span>
            </div>
          </div>
        </td>
        <td class="p-6">${statusBadge(m.estado_pago)}</td>
        <td class="p-6 font-bold tracking-widest uppercase text-sm">${m.fechaVencimiento || '-'}</td>
        <td class="p-6 text-right whitespace-nowrap">
          <button onclick="openPagoForm(${m.id})" class="${btnClasses} mr-2">Registrar Pago</button>
          <button onclick="openHistorial(${m.id})" class="${btnClasses}">Historial</button>
        </td>
      </tr>
    `).join('');
  }
}

function updateAlerts() {
  const alertasContainer = document.getElementById('alertas-container');
  const alertasWrapper = document.getElementById('alertas-pagos');
  if (!alertasContainer || !alertasWrapper) return;

  const atrasados = membersData.filter(m => m.estado_pago === 'atrasado');
  if (atrasados.length > 0) {
    alertasWrapper.classList.remove('hidden');
    alertasWrapper.classList.add('flex');
    alertasContainer.innerHTML = atrasados.map(m => `
      <div class="bg-brand-black text-brand-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span class="font-display font-bold uppercase tracking-widest block">${m.nombre}</span>
          <span class="text-xs opacity-80">Vencido desde: ${m.fechaVencimiento}</span>
        </div>
        <button onclick="openPagoForm(${m.id})" class="${btnClasses}">Cobrar Ahora</button>
      </div>
    `).join('');
  } else {
    alertasWrapper.classList.add('hidden');
    alertasWrapper.classList.remove('flex');
  }
}

function openPagoForm(id) {
  currentModalType = 'pago-form';
  currentModalId = id;
  const m = membersData.find(x => x.id === id);
  const planInfo = planesData.find(p => p.nombre === m.plan) || { precio: '$0' };

  const html = `
    <h3 class="text-2xl font-display font-bold uppercase tracking-tighter mb-6 text-brand-black">Registrar Pago</h3>
    <div class="mb-6">
      <p class="font-bold text-lg uppercase">${m.nombre}</p>
      <p class="text-sm opacity-60">Plan: ${m.plan}</p>
      <p class="text-3xl font-display font-bold mt-2 bg-brand-black text-brand-white inline-block px-3 py-1">${planInfo.precio}</p>
    </div>
    <form onsubmit="processPago(event)" class="flex flex-col gap-6">
      <div>
        <label class="${labelCls}" for="pago-metodo">Método de Pago</label>
        <div class="relative">
          <select id="pago-metodo" class="${selectCls}">
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-brand-black">
            <i class="ph-bold ph-caret-down text-xl"></i>
          </div>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row gap-4 mt-4">
        <button type="submit" class="${saveBtnCls}">Registrar Pago</button>
        <button type="button" onclick="closeModal()" class="${cancelBtnCls}">Cancelar</button>
      </div>
    </form>
  `;
  document.getElementById('modal-title').textContent = 'PAGOS.';
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-overlay').classList.add('flex');
}

function processPago(e) {
  e.preventDefault();
  const m = membersData.find(x => x.id === currentModalId);
  const metodo = document.getElementById('pago-metodo').value;
  const planInfo = planesData.find(p => p.nombre === m.plan) || { precio: '$0' };
  
  const monto = parseInt(planInfo.precio.replace(/\D/g,'')) || 0;
  const hoy = new Date().toISOString().split('T')[0];
  
  m.historialPagos.unshift({
    id: Date.now(),
    fecha: hoy,
    monto: monto,
    metodo: metodo
  });
  
  m.estado_pago = 'al_dia';
  // Actualizar fecha vencimiento dinámicamente
  m.fechaVencimiento = (function() {
    const d = new Date(hoy);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  })();

  showToast('PAGO REGISTRADO CON ÉXITO');
  closeModal();
  renderAll();
}

function openHistorial(id) {
  const m = membersData.find(x => x.id === id);
  let tablaHtml = '';
  
  if (m.historialPagos.length === 0) {
    tablaHtml = '<p class="font-bold uppercase tracking-widest text-sm text-brand-black">No hay pagos registrados.</p>';
  } else {
    tablaHtml = `
      <div class="overflow-x-auto border-4 border-brand-black">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-brand-black text-brand-white">
              <th class="p-4 font-display font-bold text-sm uppercase tracking-widest">Fecha</th>
              <th class="p-4 font-display font-bold text-sm uppercase tracking-widest">Monto</th>
              <th class="p-4 font-display font-bold text-sm uppercase tracking-widest">Método</th>
              <th class="p-4 font-display font-bold text-sm uppercase tracking-widest text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="font-medium text-brand-black">
            ${m.historialPagos.map(p => `
              <tr class="border-b-4 border-brand-black">
                <td class="p-4">${p.fecha}</td>
                <td class="p-4">$${p.monto}</td>
                <td class="p-4">${p.metodo}</td>
                <td class="p-4 text-right">
                  <button onclick="revertPago(${m.id}, ${p.id})" class="${btnDangerClasses}">Revertir</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  const html = `
    <h3 class="text-2xl font-display font-bold uppercase tracking-tighter mb-2 text-brand-black">Historial</h3>
    <p class="font-bold text-lg uppercase mb-6">${m.nombre}</p>
    ${tablaHtml}
    <div class="mt-8 flex justify-end">
      <button type="button" onclick="closeModal()" class="${cancelBtnCls}">Cerrar</button>
    </div>
  `;
  document.getElementById('modal-title').textContent = 'HISTORIAL.';
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-overlay').classList.add('flex');
}

function revertPago(memberId, pagoId) {
  sysModal('confirm', 'REVERTIR PAGO', '¿ESTÁS SEGURO DE REVERTIR ESTE PAGO? ESTA ACCIÓN NO SE PUEDE DESHACER.').then(confirmed => {
    if (!confirmed) return;
    const m = membersData.find(x => x.id === memberId);
    m.historialPagos = m.historialPagos.filter(p => p.id !== pagoId);
    m.estado_pago = 'atrasado';
    showToast('PAGO REVERTIDO');
    openHistorial(memberId);
    renderAll();
  });
}

let toastTimeout;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('translate-y-24', 'opacity-0');
  t.classList.add('translate-y-0', 'opacity-100');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    t.classList.add('translate-y-24', 'opacity-0');
    t.classList.remove('translate-y-0', 'opacity-100');
  }, 2800);
}

window.sysModal = function(type, title, message) {
  return new Promise((resolve) => {
    let overlay = document.getElementById('sys-modal-overlay');
    if (!overlay) {
      document.body.insertAdjacentHTML('beforeend', `
        <div id="sys-modal-overlay" role="dialog" aria-modal="true" class="fixed inset-0 bg-brand-black/90 hidden items-center justify-center p-4 sm:p-6 z-[200]">
          <div class="bg-brand-white w-full max-w-md border-4 border-brand-black flex flex-col overflow-hidden">
            <div id="sys-modal-header" class="px-6 py-4 flex items-center gap-4 border-b-4 border-brand-black">
              <i id="sys-modal-icon" class="ph-bold text-3xl"></i>
              <h3 id="sys-modal-title" class="font-display font-bold uppercase tracking-widest text-lg sm:text-xl leading-none mt-1"></h3>
            </div>
            <div class="p-6 sm:p-8">
              <p id="sys-modal-msg" class="font-medium text-lg leading-relaxed text-brand-black"></p>
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
    } else if (type === 'success') {
      icon.classList.add('ph-check-circle');
      header.classList.add('bg-brand-green', 'text-brand-black');
    } else if (type === 'info') {
      icon.classList.add('ph-info');
      header.classList.add('bg-brand-black', 'text-brand-white');
    } else if (type === 'confirm') {
      icon.classList.add('ph-question');
      header.classList.add('bg-brand-black', 'text-brand-white');
    }
    
    titleEl.textContent = title;
    msgEl.innerHTML = message;
    footer.innerHTML = '';
    
    const btnBase = "font-display font-bold uppercase tracking-widest px-8 py-4 border-4 border-brand-black focus:outline-none transition-colors w-full sm:w-auto text-center text-sm";
    
    function closeAndResolve(val) {
      overlay.classList.remove('flex');
      overlay.classList.add('hidden');
      resolve(val);
    }

    if (type === 'confirm') {
      const btnCancel = document.createElement('button');
      btnCancel.className = btnBase + " bg-brand-white text-brand-black hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white active:bg-brand-black active:text-brand-white";
      btnCancel.textContent = "Cancelar";
      btnCancel.onclick = () => closeAndResolve(false);
      
      const btnOk = document.createElement('button');
      btnOk.className = btnBase + " bg-brand-black text-brand-white hover:bg-brand-green hover:border-brand-green hover:text-brand-black focus:bg-brand-green focus:border-brand-green focus:text-brand-black active:bg-brand-green active:border-brand-green active:text-brand-black";
      btnOk.textContent = "Confirmar";
      btnOk.onclick = () => closeAndResolve(true);
      
      footer.appendChild(btnCancel);
      footer.appendChild(btnOk);
    } else {
      const btnOk = document.createElement('button');
      btnOk.className = btnBase + " bg-brand-black text-brand-white hover:bg-brand-green hover:border-brand-green hover:text-brand-black focus:bg-brand-green focus:border-brand-green focus:text-brand-black active:bg-brand-green active:border-brand-green active:text-brand-black";
      btnOk.textContent = "Entendido";
      btnOk.onclick = () => closeAndResolve(true);
      footer.appendChild(btnOk);
    }
    
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
  });
};


window.setScreen = setScreen;
window.openModal = openModal;
window.closeModal = closeModal;
window.saveStaff = saveStaff;
window.deleteStaff = deleteStaff;
window.saveMember = saveMember;
window.deleteMember = deleteMember;
window.savePlan = savePlan;
window.deletePlan = deletePlan;
window.openPagoForm = openPagoForm;
window.processPago = processPago;
window.openHistorial = openHistorial;
window.revertPago = revertPago;


// KIOSK REALTIME LISTENER
if (window.supabaseClient) {
  const channel = window.supabaseClient.channel('public:accesos');
  channel.on('broadcast', { event: 'acceso' }, (payload) => {
    const data = payload.payload;
    let msg = `[KIOSCO] ${data.nombre || 'Alguien'} - Acceso ${data.estado}`;
    if (data.estado === 'desconocido') msg = '[KIOSCO] ROSTRO DESCONOCIDO DETECTADO';
    showToast(msg);
    
    // Optional: read aloud on admin side too, or just show the toast.
  }).subscribe();
}
