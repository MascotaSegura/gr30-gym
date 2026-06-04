

let staffData = [];
let membersData = [];
let planesData = [];
let accesosData = [];
try { accesosData = JSON.parse(localStorage.getItem('gr30_accesos')) || []; } catch(e) { accesosData = []; }

const screenTitles = {
  dashboard: 'Dashboard.',
  staff:     'Staff.',
  miembros:  'Directorio.',
  accesos:   'Accesos.',
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

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

async function fetchData() {
  try {
    const [staffRes, planesRes, miembrosRes, pagosRes] = await Promise.all([
      window.supabaseClient.from('staff').select('*'),
      window.supabaseClient.from('planes').select('*'),
      window.supabaseClient.from('miembros').select('*'),
      window.supabaseClient.from('pagos').select('*')
    ]);
    
    if (staffRes.data) staffData = staffRes.data;
    if (planesRes.data) planesData = planesRes.data;
    
    const pagos = pagosRes.data || [];
    const miembros = miembrosRes.data;
    
    if (miembros) {
      membersData = miembros.map(m => {
        const historial = pagos ? pagos.filter(p => p.miembro_id === m.id).sort((a,b) => new Date(b.fecha) - new Date(a.fecha)) : [];
        let fechaVenc = '-';
        let estado_pago = 'pendiente';
        
        if (historial.length > 0) {
          const planInfo = planesData.find(p => p.nombre === m.plan) || { periodo: 'Mes' };
          const lastDate = new Date(historial[0].fecha);
          
          if (planInfo.periodo === 'Mes') {
            lastDate.setMonth(lastDate.getMonth() + 1);
          } else if (planInfo.periodo === 'Año') {
            lastDate.setFullYear(lastDate.getFullYear() + 1);
          }
          
          fechaVenc = lastDate.toISOString().split('T')[0];
          
          // Calcular estado de pago
          const hoy = new Date().toISOString().split('T')[0];
          if (fechaVenc < hoy) {
            estado_pago = 'atrasado';
          } else {
            estado_pago = 'al_dia';
          }
        }
        return { ...m, historialPagos: historial, fechaVencimiento: fechaVenc, estado_pago };
      });
    }
    
    // Conectar Kiosco (Supabase Realtime)
    const channel = window.supabaseClient.channel('public:accesos');
    channel.on('broadcast', { event: 'acceso' }, (payload) => {
      const log = payload.payload;
      accesosData.unshift(log);
      if (accesosData.length > 50) accesosData.pop(); // Mantener buffer limpio
      localStorage.setItem('gr30_accesos', JSON.stringify(accesosData));
      renderAccesos();
      
      showKioskAlert(log);
    }).subscribe();

    const enrollChannel = window.supabaseClient.channel('kiosco-enroll');
    enrollChannel.on('broadcast', { event: 'enroll_success' }, (payload) => {
      const id = payload.payload.memberId;
      if (window.sysModal) window.sysModal('success', 'ÉXITO', 'El Kiosco ha enrolado el rostro correctamente.');
      const m = membersData.find(x => x.id === id);
      if (m) {
        m.biometria = ['enrolado']; // Para que pase la validación length > 0
        renderAll();
        if (currentModalType === 'member-edit' && currentModalId === id) {
          openModal('member-edit', id);
        }
      }
    })
    .on('broadcast', { event: 'enroll_error' }, (payload) => {
      if (window.sysModal) window.sysModal('error', 'ERROR EN KIOSCO', payload.payload.msg || 'Fallo en la captura biométrica.');
    })
    .subscribe();
    
    renderAll();
  } catch (err) {
    if(window.sysModal) {
      window.sysModal('error', 'ERROR DE CONEXIÓN', 'No se pudo contactar al servidor o la base de datos. Verifica tu conexión a internet.');
    } else {
      alert("ERROR DE CONEXIÓN. Verifica tu conexión a internet.");
    }
  }
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
  renderAccesos();
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
            ${s.imagen ? `<img src="${s.imagen}" alt="${s.nombre}" class="w-full h-full object-cover">` : s.avatar}
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
            ${s.imagen ? `<img src="${s.imagen}" alt="${s.nombre}" class="w-full h-full object-cover">` : s.avatar}
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
    const bgCls = p.destacado ? 'bg-brand-green text-brand-black border-4 border-brand-green' : 'bg-brand-white text-brand-black border-4 border-brand-black hover:border-brand-black focus:border-brand-black active:border-brand-black';
    let priceHTML = p.destacado 
      ? `<p class="text-5xl sm:text-6xl font-display font-bold mb-6 text-brand-black group-hover:text-brand-green group-focus:text-brand-green group-active:text-brand-green tracking-tighter">${p.precio}<span class="text-xl sm:text-2xl text-current tracking-normal">mxn</span></p>`
      : `<p class="text-5xl sm:text-6xl font-display font-bold mb-6 bg-brand-green text-brand-black inline-block px-3 py-1 tracking-tighter -ml-3">${p.precio}<span class="text-xl sm:text-2xl text-current tracking-normal">mxn</span></p>`;
      
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

  document.body.style.overflow = 'hidden';

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
  overlay.classList.remove('flex');
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
  document.getElementById('modal-body').innerHTML = '';
  currentModalType = null;
  currentModalId = null;
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
  if (!name || typeof name !== 'string') return '??';
  return name.trim().split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function staffFormHTML(s) {
  return `
    <form onsubmit="saveStaff(event)" class="flex flex-col gap-8 text-brand-black">
      <div>
        <label class="${labelCls}">Foto de Perfil</label>
        <div class="flex items-center gap-6">
          <div class="w-16 h-16 bg-brand-green text-brand-black flex items-center justify-center font-display font-bold text-2xl uppercase focus:outline-none focus:bg-brand-black focus:text-brand-white transition-colors" tabindex="0" id="staff-photo-preview">
            ${s && s.imagen ? `<img src="${s.imagen}" alt="${s.nombre}" class="w-full h-full object-cover">` : (s ? getInitials(s.nombre) : '+')}
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
        <label class="${labelCls}">Contraseña / PIN de Acceso</label>
        ${m ? `
          <div class="border-4 border-brand-black p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-brand-white">
            <span class="font-display font-bold text-sm tracking-widest text-brand-black/60 uppercase">CONTRASEÑA CONFIGURADA</span>
            <button type="button" onclick="resetMemberPIN(${m.id})" class="w-full sm:w-auto text-center font-display font-bold uppercase tracking-widest text-xs px-4 py-3 bg-brand-black text-brand-white hover:bg-brand-green hover:text-brand-black transition-colors focus:outline-none">Restablecer PIN</button>
          </div>
        ` : `
          <div class="border-4 border-brand-black p-4 bg-brand-green">
            <p class="font-display font-bold text-xs sm:text-sm tracking-widest text-brand-black uppercase">Se generará un PIN automático al guardar.</p>
          </div>
        `}
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
      <div>
        <label class="${labelCls}">Biometría Facial</label>
        <div class="border-4 border-brand-black p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 flex-shrink-0 border-4 border-brand-black flex items-center justify-center bg-brand-black text-brand-white">
              <i class="ph-bold ph-user-focus text-xl"></i>
            </div>
            <div>
              <p class="font-display font-bold uppercase tracking-widest text-brand-black text-sm">Estado del Rostro</p>
              ${m && m.biometria && Array.isArray(m.biometria) && m.biometria.length > 0 
                ? '<p class="font-bold text-xs text-brand-green bg-brand-black inline-block px-2 py-1 uppercase tracking-widest mt-1"><i class="ph-bold ph-check"></i> ENROLADO</p>' 
                : '<p class="font-bold text-xs opacity-60 mt-1 uppercase tracking-widest">NO ENROLADO</p>'}
            </div>
          </div>
          <button type="button" onclick="requestRemoteEnrollment(${m ? m.id : 'null'})" class="w-full sm:w-auto text-center border-4 border-brand-black bg-brand-white text-brand-black font-display font-bold uppercase tracking-widest px-6 py-3 text-xs hover:bg-brand-green focus:bg-brand-green active:bg-brand-green transition-colors flex items-center justify-center gap-2">
            <i class="ph-bold ph-camera"></i> ${m && m.biometria && m.biometria.length > 0 ? 'Recapturar Rostro' : 'Capturar Biometría'}
          </button>
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


async function saveStaff(e) {
  e.preventDefault();
  const nombre      = document.getElementById('sf-nombre').value.trim();
  const especialidad= document.getElementById('sf-esp').value.trim();
  const turno       = document.getElementById('sf-turno').value;
  const avatar      = getInitials(nombre);

  const originalText = e.submitter.textContent;
  e.submitter.textContent = "Guardando...";
  e.submitter.disabled = true;

  try {
    if (currentModalType === 'staff-edit') {
      const payload = { nombre, especialidad, turno, avatar };
      const { error } = await window.supabaseClient.from('staff').update(payload).eq('id', currentModalId);
      if (error) throw error;
      const s = staffData.find(x => x.id === currentModalId);
      if (s) { s.nombre = nombre; s.especialidad = especialidad; s.turno = turno; s.avatar = avatar; }
      showToast('STAFF ACTUALIZADO');
    } else {
      const payload = { avatar, nombre, especialidad, turno };
      const { data, error } = await window.supabaseClient.from('staff').insert([payload]).select();
      if (error) throw error;
      if (data && data.length > 0) staffData.push(data[0]);
      showToast('STAFF AÑADIDO CON ÉXITO');
    }
    closeModal();
    renderAll();
  } catch (err) {
    if(window.sysModal) window.sysModal('error', 'ERROR', 'Fallo al guardar en la base de datos.');
  } finally {
    e.submitter.textContent = originalText;
    e.submitter.disabled = false;
  }
}

function deleteStaff(id) {
  sysModal('confirm', 'ELIMINAR STAFF', '¿ESTÁS SEGURO DE ELIMINAR ESTE STAFF?').then(async confirmed => {
    if (!confirmed) return;
    try {
      const { error } = await window.supabaseClient.from('staff').delete().eq('id', id);
      if (error) throw error;
      const idx = staffData.findIndex(x => x.id === id);
      if (idx !== -1) staffData.splice(idx, 1);
      showToast('STAFF ELIMINADO');
      renderAll();
    } catch (err) {
      if(window.sysModal) window.sysModal('error', 'ERROR', 'Fallo al eliminar en la base de datos.');
    }
  });
}

window.resetMemberPIN = async function(id) {
  const generatedPIN = Math.floor(1000 + Math.random() * 9000).toString();
  try {
    const { error } = await window.supabaseClient.from('miembros').update({ password: generatedPIN }).eq('id', id);
    if (error) throw error;
    const m = membersData.find(x => x.id === id);
    if (m) m.password = generatedPIN;
    sysModal('success', 'PIN RESTABLECIDO', `El nuevo PIN de activación para el usuario es:<br><br><div class="text-center mt-4"><span class="text-4xl font-display font-bold tracking-tighter bg-brand-green text-brand-black px-6 py-3 border-4 border-brand-black inline-block">${generatedPIN}</span></div><br>El cliente deberá crear una nueva contraseña al ingresar.`);
  } catch (err) {
    sysModal('error', 'ERROR', 'Fallo al restablecer el PIN.');
  }
};

async function saveMember(e) {
  e.preventDefault();
  const nombre   = document.getElementById('mf-nombre').value.trim();
  const telefono = document.getElementById('mf-tel').value.trim();
  const plan     = document.getElementById('mf-plan').value;
  const activo   = document.getElementById('mf-estado').value === '1';

  const originalText = e.submitter.textContent;
  e.submitter.textContent = "Guardando...";
  e.submitter.disabled = true;

  try {
    if (currentModalType === 'member-edit') {
      const payload = { nombre, telefono, plan, activo };
      const { error } = await window.supabaseClient.from('miembros').update(payload).eq('id', currentModalId);
      if (error) throw error;
      const m = membersData.find(x => x.id === currentModalId);
      if (m) { m.nombre = nombre; m.telefono = telefono; m.plan = plan; m.activo = activo; }
      showToast('MIEMBRO ACTUALIZADO');
      if (window.broadcastDBUpdate) window.broadcastDBUpdate();
    } else {
      const generatedPIN = Math.floor(1000 + Math.random() * 9000).toString();
      const payload = { nombre, telefono, plan, activo, password: generatedPIN };
      const { data, error } = await window.supabaseClient.from('miembros').insert([payload]).select();
      if (error) throw error;
      if (data && data.length > 0) {
        data[0].historialPagos = [];
        membersData.push(data[0]);
      }
      showToast('MIEMBRO AÑADIDO');
      sysModal('success', 'NUEVO MIEMBRO REGISTRADO', `El PIN de activación para ${nombre} es:<br><br><div class="text-center mt-4"><span class="text-4xl font-display font-bold tracking-tighter bg-brand-green text-brand-black px-6 py-3 border-4 border-brand-black inline-block">${generatedPIN}</span></div><br>Indícale al cliente que inicie sesión con este PIN para crear su contraseña.`);
      if (window.broadcastDBUpdate) window.broadcastDBUpdate();
    }
    closeModal();
    renderAll();
  } catch (err) {
    if(window.sysModal) window.sysModal('error', 'ERROR', 'Fallo al guardar en la base de datos.');
  } finally {
    e.submitter.textContent = originalText;
    e.submitter.disabled = false;
  }
}

function deleteMember(id) {
  sysModal('confirm', 'ELIMINAR MIEMBRO', '¿ESTÁS SEGURO DE ELIMINAR ESTE MIEMBRO?').then(async confirmed => {
    if (!confirmed) return;
    try {
      const { error } = await window.supabaseClient.from('miembros').delete().eq('id', id);
      if (error) throw error;
      const idx = membersData.findIndex(x => x.id === id);
      if (idx !== -1) membersData.splice(idx, 1);
      showToast('MIEMBRO ELIMINADO');
      if (window.broadcastDBUpdate) window.broadcastDBUpdate();
      renderAll();
    } catch (err) {
      if(window.sysModal) window.sysModal('error', 'ERROR', 'Fallo al eliminar en la base de datos.');
    }
  });
}

async function savePlan(e) {
  e.preventDefault();
  const nombre = document.getElementById('pf-nombre').value.trim();
  const precio = document.getElementById('pf-precio').value.trim();
  const periodo = document.getElementById('pf-periodo').value;
  const desc = document.getElementById('pf-desc').value.trim();
  const destacado = document.getElementById('pf-destacado').checked;
  const beneficios = desc ? desc.split(',').map(x => x.trim()).filter(x => x) : [];

  const originalText = e.submitter.textContent;
  e.submitter.textContent = "Guardando...";
  e.submitter.disabled = true;

  try {
    if (currentModalType === 'plan-form') {
      if (currentModalId) {
        const payload = { nombre, precio, periodo, destacado, beneficios };
        const { error } = await window.supabaseClient.from('planes').update(payload).eq('id', currentModalId);
        if (error) throw error;
        const p = planesData.find(x => x.id === currentModalId);
        if (p) {
          p.nombre = nombre; p.precio = precio; p.periodo = periodo;
          p.destacado = destacado; p.beneficios = beneficios;
        }
        showToast('PLAN ACTUALIZADO CON ÉXITO');
      } else {
        const payload = { nombre, precio, periodo, destacado, beneficios };
        const { data, error } = await window.supabaseClient.from('planes').insert([payload]).select();
        if (error) throw error;
        if (data && data.length > 0) planesData.push(data[0]);
        showToast('PLAN AÑADIDO CON ÉXITO');
      }
    }
    closeModal();
    renderAll();
  } catch (err) {
    if(window.sysModal) window.sysModal('error', 'ERROR', 'Fallo al guardar plan en base de datos.');
  } finally {
    e.submitter.textContent = originalText;
    e.submitter.disabled = false;
  }
}

function deletePlan(id) {
  sysModal('confirm', 'ELIMINAR PLAN', '¿ESTÁS SEGURO DE ELIMINAR ESTE PLAN?').then(async confirmed => {
    if (!confirmed) return;
    try {
      const { error } = await window.supabaseClient.from('planes').delete().eq('id', id);
      if (error) throw error;
      const idx = planesData.findIndex(x => x.id === id);
      if (idx !== -1) planesData.splice(idx, 1);
      showToast('PLAN ELIMINADO CON ÉXITO');
      closeModal();
      renderAll();
    } catch(err) {
      if(window.sysModal) window.sysModal('error', 'ERROR', 'Fallo al eliminar plan en base de datos.');
    }
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

  // Actualizar Tarjetas Resumen Pagos
  const statIngresos = document.getElementById('stat-pagos-ingresos');
  const statAlDia = document.getElementById('stat-pagos-aldia');
  const statAtrasados = document.getElementById('stat-pagos-atrasados');
  
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
    
    const aldia = membersData.filter(m => m.estado_pago === 'al_dia').length;
    const atrasados = membersData.filter(m => m.estado_pago === 'atrasado').length;
    if (statAlDia) statAlDia.textContent = aldia;
    if (statAtrasados) statAtrasados.textContent = atrasados;
  }

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

// Alertas removidas

function renderAccesos() {
  const tb = document.getElementById('accesos-table-body');
  if (!tb) return;
  
  if (accesosData.length === 0) {
    tb.innerHTML = `<tr class="border-b-4 border-brand-black opacity-50"><td colspan="4" class="p-6 text-center font-display font-bold uppercase tracking-widest text-sm">Esperando escaneo biométrico...</td></tr>`;
    return;
  }
  
  const rowClasses = "border-b-4 border-brand-black hover:bg-brand-green focus-within:bg-brand-green transition-colors group";
  
  tb.innerHTML = accesosData.map(log => {
    let estadoHTML = '';
    if (log.estado === 'permitido') {
      estadoHTML = '<span class="bg-brand-green text-brand-black font-display font-bold uppercase tracking-widest text-xs px-2 py-1 inline-block border-4 border-brand-green">Concedido</span>';
    } else if (log.estado === 'denegado') {
      estadoHTML = '<span class="bg-brand-black text-brand-white font-display font-bold uppercase tracking-widest text-xs px-2 py-1 inline-block border-4 border-brand-black"><i class="ph-bold ph-warning text-sm"></i> Denegado</span>';
    } else {
      estadoHTML = '<span class="bg-brand-white text-brand-black font-display font-bold uppercase tracking-widest text-xs px-2 py-1 inline-block border-4 border-brand-black">Desconocido</span>';
    }
    
    const d = new Date(log.tiempo);
    const hora = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    return `
      <tr class="${rowClasses}">
        <td class="p-6 font-display font-bold text-sm tracking-widest">${hora}</td>
        <td class="p-6 font-bold uppercase leading-tight">${log.nombre}</td>
        <td class="p-6 font-bold tracking-widest uppercase text-sm">${log.plan || '-'}</td>
        <td class="p-6">${estadoHTML}</td>
      </tr>
    `;
  }).join('');
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

async function processPago(e) {
  e.preventDefault();
  const m = membersData.find(x => x.id === currentModalId);
  if (!m) return;
  const metodo = document.getElementById('pago-metodo').value;
  const planInfo = planesData.find(p => p.nombre === m.plan) || { precio: '$0', periodo: 'Mes' };
  
  const monto = parseInt(planInfo.precio.replace(/\D/g,'')) || 0;
  const hoy = new Date().toISOString().split('T')[0];

  const originalText = e.submitter.textContent;
  e.submitter.textContent = "Procesando...";
  e.submitter.disabled = true;

  try {
    const payloadPago = {
      miembro_id: m.id,
      fecha: hoy,
      monto: monto,
      metodo: metodo
    };

    const { data: pagoData, error: pagoErr } = await window.supabaseClient.from('pagos').insert([payloadPago]).select();
    if (pagoErr) throw pagoErr;

    // Actualizar fecha vencimiento dinámicamente basado en plan.periodo
    let nuevaFecha = new Date(hoy);
    if (planInfo.periodo === 'Mes') {
      nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    } else if (planInfo.periodo === 'Año') {
      nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1);
    } // Si es 'Unico', vence hoy a las 23:59, así que la fecha es hoy.
    
    const strVencimiento = nuevaFecha.toISOString().split('T')[0];

    // Actualizamos el estado del miembro en Supabase a 'activo' si estaba expirado
    const { error: miemErr } = await window.supabaseClient.from('miembros').update({ activo: true }).eq('id', m.id);
    if (miemErr) throw miemErr;

    // Actualizamos arreglos locales
    if (pagoData && pagoData.length > 0) {
      m.historialPagos.unshift(pagoData[0]);
    }
    m.estado_pago = 'al_dia';
    m.fechaVencimiento = strVencimiento;
    m.activo = true;

    showToast('PAGO REGISTRADO CON ÉXITO');
    if (window.broadcastDBUpdate) window.broadcastDBUpdate();
    closeModal();
    renderAll();
  } catch (err) {
    if(window.sysModal) window.sysModal('error', 'ERROR', 'Fallo al procesar pago en base de datos.');
  } finally {
    e.submitter.textContent = originalText;
    e.submitter.disabled = false;
  }
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
  sysModal('confirm', 'REVERTIR PAGO', '¿ESTÁS SEGURO DE REVERTIR ESTE PAGO? ESTA ACCIÓN NO SE PUEDE DESHACER.').then(async confirmed => {
    if (!confirmed) return;
    try {
      const { error } = await window.supabaseClient.from('pagos').delete().eq('id', pagoId);
      if (error) throw error;
      
      const m = membersData.find(x => x.id === memberId);
      if (m) {
        m.historialPagos = m.historialPagos.filter(p => p.id !== pagoId);
        m.estado_pago = 'atrasado'; // Se marca atrasado por seguridad al revertir.
      }
      showToast('PAGO REVERTIDO');
      if (window.broadcastDBUpdate) window.broadcastDBUpdate();
      openHistorial(memberId);
      renderAll();
    } catch(err) {
      if(window.sysModal) window.sysModal('error', 'ERROR', 'Fallo al revertir pago.');
    }
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

function showKioskAlert(log) {
  const container = document.getElementById('kiosk-alert-container');
  if (!container) return;

  const alertId = 'kiosk-alert-' + Date.now() + Math.floor(Math.random() * 1000);
  const isPermitted = log.estado === 'permitido';
  const isDenied = log.estado === 'denegado';
  const isUnknown = log.estado === 'desconocido';

  let bgClass, borderClass, textClass, iconClass, reason, actionHTML;
  // Buscar ID del miembro para los botones de acción
  const m = membersData.find(x => x.nombre.toUpperCase() === (log.nombre || '').toUpperCase());
  
  if (isPermitted) {
    bgClass = 'bg-brand-green';
    borderClass = 'border-brand-green';
    textClass = 'text-brand-black';
    iconClass = 'ph-check-circle';
    reason = 'ACCESO AUTORIZADO';
    actionHTML = '';
  } else if (isDenied) {
    bgClass = 'bg-brand-black';
    borderClass = 'border-brand-black';
    textClass = 'text-brand-white';
    iconClass = 'ph-warning-circle';
    
    if (m && m.activo === false) {
      reason = 'MEMBRESÍA SUSPENDIDA';
      actionHTML = `
        <button onclick="openModal('member-edit', ${m.id}); document.getElementById('${alertId}').remove();" class="w-full mt-4 text-center bg-brand-white text-brand-black font-display font-bold uppercase tracking-widest px-4 py-3 text-sm hover:bg-brand-green focus:bg-brand-green transition-colors border-4 border-brand-white focus:outline-none active:bg-brand-green active:border-brand-green">
          Revisar Perfil
        </button>
      `;
    } else {
      reason = 'PAGOS PENDIENTES';
      actionHTML = m ? `
        <button onclick="openPagoForm(${m.id}); document.getElementById('${alertId}').remove();" class="w-full mt-4 text-center bg-brand-white text-brand-black font-display font-bold uppercase tracking-widest px-4 py-3 text-sm hover:bg-brand-green focus:bg-brand-green transition-colors border-4 border-brand-white focus:outline-none active:bg-brand-green active:border-brand-green">
          Cobrar Ahora
        </button>
      ` : '';
    }
  } else {
    bgClass = 'bg-brand-white';
    borderClass = 'border-brand-black';
    textClass = 'text-brand-black';
    iconClass = 'ph-question';
    reason = 'ROSTRO NO RECONOCIDO';
    actionHTML = `
      <button onclick="openModal('member-form'); document.getElementById('${alertId}').remove();" class="w-full mt-4 text-center bg-brand-black text-brand-white font-display font-bold uppercase tracking-widest px-4 py-3 text-sm hover:bg-brand-green hover:text-brand-black focus:bg-brand-green focus:text-brand-black transition-colors border-4 border-brand-black focus:outline-none active:bg-brand-green active:border-brand-green active:text-brand-black">
        Enrolar Nuevo
      </button>
    `;
  }

  const html = `
    <div id="${alertId}" class="${bgClass} ${textClass} border-4 ${borderClass} p-6 pointer-events-auto transform translate-x-full transition-transform duration-300 relative group">
      <button onclick="document.getElementById('${alertId}').remove()" class="absolute top-4 right-4 text-current hover:text-brand-green focus:outline-none transition-colors border-4 border-transparent focus:border-current hover:border-current p-1 flex items-center justify-center z-10 bg-[inherit]" aria-label="Cerrar alerta">
        <i class="ph-bold ph-x text-2xl"></i>
      </button>
      <div class="pr-12 min-w-0">
        <p class="font-display font-bold uppercase tracking-widest text-xs opacity-70 mb-1">Kiosco Biométrico</p>
        <h4 class="font-display font-bold text-2xl sm:text-3xl uppercase tracking-tighter leading-none mb-3 break-words">${log.nombre || 'DESCONOCIDO'}</h4>
        <div class="flex flex-col gap-1.5 mb-4">
          ${log.telefono ? `<p class="font-bold tracking-widest uppercase text-xs opacity-90"><i class="ph-bold ph-phone mr-1"></i> ${log.telefono}</p>` : ''}
          ${log.plan && log.plan !== '-' ? `<p class="font-bold tracking-widest uppercase text-xs opacity-90"><i class="ph-bold ph-clipboard-text mr-1"></i> ${log.plan}</p>` : ''}
          ${log.fechaVencimiento ? `<p class="font-bold tracking-widest uppercase text-xs opacity-90"><i class="ph-bold ph-calendar mr-1"></i> Vence: ${log.fechaVencimiento}</p>` : ''}
        </div>
        <div class="border-t-4 border-current pt-4 flex items-center justify-between gap-4">
          <p class="font-display font-bold uppercase tracking-widest text-sm">${reason}</p>
          <i class="ph-bold ${iconClass} text-4xl"></i>
        </div>
      </div>
      ${actionHTML}
    </div>
  `;

  container.insertAdjacentHTML('beforeend', html);
  const el = document.getElementById(alertId);
  
  // Animación de entrada
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.remove('translate-x-full');
    });
  });

  // Auto-cierre dinámico
  const duration = isPermitted ? 5000 : (isDenied ? 10000 : 8000);
  setTimeout(() => {
    if (document.getElementById(alertId)) {
      el.classList.add('translate-x-full');
      setTimeout(() => { if (el) el.remove(); }, 300);
    }
  }, duration);
}

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
              <button id="sys-modal-close-btn" aria-label="Cerrar" class="absolute top-4 right-4 text-current hover:text-brand-green focus:text-brand-green active:text-brand-green transition-colors focus:outline-none text-2xl bg-transparent p-1 z-10"><i class="ph-bold ph-x"></i></button>
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
    
    const btnBase = "font-display font-bold uppercase tracking-widest px-8 py-4 focus:outline-none transition-colors w-full sm:w-auto text-center text-sm";
    
    function closeAndResolve(val) {
      overlay.classList.remove('flex');
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
      resolve(val);
    }

    const closeBtn = document.getElementById('sys-modal-close-btn');
    if (closeBtn) closeBtn.onclick = () => closeAndResolve(false);

    document.body.style.overflow = 'hidden';

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
window.showKioskAlert = showKioskAlert;

window.requestRemoteEnrollment = async function(memberId) {
  if (!memberId || memberId === 'null') {
    if(window.sysModal) window.sysModal('info', 'ATENCIÓN', 'Primero debes guardar los datos del miembro para asignarle un ID antes de capturar su rostro.');
    return;
  }
  
  const m = membersData.find(x => x.id === memberId);
  if (!m) return;

  if (window.sysModal) window.sysModal('info', 'ENROLAMIENTO REMOTO', 'Dile al cliente que mire la pantalla del Kiosco. El Kiosco ha iniciado el escaneo biométrico...');
  
  const channel = window.supabaseClient.channel('kiosco-enroll');
  await channel.send({
    type: 'broadcast',
    event: 'enroll_request',
    payload: {
      memberId: memberId,
      nombre: m.nombre
    }
  });
};

window.broadcastDBUpdate = async function() {
  const channel = window.supabaseClient.channel('public:accesos');
  await channel.send({
    type: 'broadcast',
    event: 'db_updated',
    payload: {}
  });
};
