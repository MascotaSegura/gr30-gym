
let staffData = [];
let membersData = [];
let planesData = [];
let accesosData = [];

const inputCls = 'w-full bg-brand-white text-brand-black border-4 border-brand-black px-4 py-4 sm:px-6 sm:py-5 text-lg sm:text-xl font-display font-bold tracking-wide focus:outline-none focus:bg-brand-green placeholder:text-brand-black/50 placeholder:uppercase transition-all';
const selectCls = 'w-full bg-brand-white text-brand-black border-4 border-brand-black px-4 py-4 sm:px-6 sm:py-5 pr-12 sm:pr-14 text-lg sm:text-xl font-display font-bold tracking-wide focus:outline-none focus:bg-brand-green cursor-pointer transition-all appearance-none';
const labelCls = 'block font-display font-bold uppercase tracking-widest text-xs sm:text-sm text-brand-black mb-2';
const saveBtnCls = 'w-full sm:w-auto px-8 py-4 font-display font-bold uppercase tracking-widest text-sm border-4 border-brand-black bg-brand-black text-brand-white hover:bg-brand-green hover:border-brand-green hover:text-brand-black focus:bg-brand-green focus:border-brand-green focus:text-brand-black active:bg-brand-green active:border-brand-green active:text-brand-black transition-colors focus:outline-none';
const cancelBtnCls = 'w-full sm:w-auto px-8 py-4 font-display font-bold uppercase tracking-widest text-sm border-4 border-brand-black bg-brand-white text-brand-black hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white active:bg-brand-black active:text-brand-white transition-colors focus:outline-none';
const deleteBtnCls = 'w-full sm:w-auto px-8 py-4 font-display font-bold uppercase tracking-widest text-sm border-4 border-brand-black bg-brand-black text-brand-white hover:bg-brand-white hover:border-brand-black hover:text-brand-black focus:bg-brand-white focus:border-brand-black focus:text-brand-black active:bg-brand-white active:border-brand-black active:text-brand-black transition-colors focus:outline-none';


const isSeeded = localStorage.getItem('gr30_v3_seeded');

const realNames = [
  'Alejandro García', 'Fernando Martínez', 'Roberto López', 'Mateo González', 'Sebastián Pérez', 
  'Nicolás Rodríguez', 'Hugo Sánchez', 'Diego Ramírez', 'Gabriel Cruz', 'Tomás Gómez', 
  'Sofía Valentina', 'Camila Isabella', 'Valeria Daniela', 'Mariana Renata', 'Natalia Regina'
];

let generatedAccesos = [];
if (!isSeeded) {

  const now = new Date();
  for (let i = 0; i < 100; i++) {
    const randomTime = new Date(now.getTime() - Math.random() * (48 * 60 * 60 * 1000));

    const name = realNames[Math.floor(Math.random() * realNames.length)];
    const plan = Math.random() > 0.3 ? 'Mensualidad Básica' : 'Anualidad Elite';
    

    const hour = randomTime.getHours();
    let isPeak = (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 21);

    if (!isPeak && Math.random() > 0.3) continue;

    generatedAccesos.push({
      nombre: name,
      plan: plan,
      estado: Math.random() > 0.05 ? 'permitido' : 'denegado',
      tiempo: randomTime.toISOString()
    });
  }
  generatedAccesos.sort((a, b) => new Date(b.tiempo) - new Date(a.tiempo));
  localStorage.setItem('gr30_accesos', JSON.stringify(generatedAccesos));
} else {
  generatedAccesos = JSON.parse(localStorage.getItem('gr30_accesos')) || [];
}

accesosData = generatedAccesos;

const screenTitles = {
  dashboard: 'Dashboard.',
  staff:     'Staff.',
  miembros:  'Directorio.',
  accesos:   'Accesos.',
  pagos:     'Pagos.',
  planes:    'Planes.',
  pos:       'Tienda.',
  inventario:'Inventario.',
};

const realisticInventory = [
  { id: 'p1', nombre: 'Agua Epura 1L', precio: 25, stock: 45, img: 'assets/img/pos_agua.png', barcode: '7501000000001' },
  { id: 'p2', nombre: 'Agua Epura 600ml', precio: 15, stock: 82, img: 'assets/img/pos_agua.png', barcode: '7501000000002' },
  { id: 'p3', nombre: 'Monster Energy 473ml', precio: 50, stock: 18, img: 'assets/img/pos_bebida.png', barcode: '7501000000003' },
  { id: 'p4', nombre: 'Red Bull 250ml', precio: 45, stock: 30, img: 'assets/img/pos_bebida.png', barcode: '7501000000004' },
  { id: 'p5', nombre: 'Playera Entrenamiento L', precio: 350, stock: 5, img: 'assets/img/pos_playera.png', barcode: '7501000000005' },
  { id: 'p6', nombre: 'Playera Entrenamiento M', precio: 350, stock: 8, img: 'assets/img/pos_playera.png', barcode: '7501000000006' },
  { id: 'p7', nombre: 'Quest Bar Chocolate', precio: 65, stock: 24, img: 'assets/img/pos_snack.png', barcode: '7501000000007' },
  { id: 'p8', nombre: 'One Bar Peanut Butter', precio: 70, stock: 12, img: 'assets/img/pos_snack.png', barcode: '7501000000008' },
  { id: 'p9', nombre: 'Toalla Microfibra', precio: 120, stock: 15, img: 'assets/img/pos_toalla.png', barcode: '7501000000009' },
  { id: 'p10', nombre: 'Candado Master Lock', precio: 150, stock: 3, img: 'assets/img/pos_candado.png', barcode: '7501000000010' }
];

let inventoryData = [];
function loadInventory() {
  if (!isSeeded) {
    inventoryData = JSON.parse(JSON.stringify(realisticInventory));
    saveInventory();
  } else {
    const saved = localStorage.getItem('gr30_inventory');
    if (saved) {
      inventoryData = JSON.parse(saved);
    } else {
      inventoryData = JSON.parse(JSON.stringify(realisticInventory));
      saveInventory();
    }
  }
}

function saveInventory() {
  localStorage.setItem('gr30_inventory', JSON.stringify(inventoryData));
}

loadInventory();

let posCart = [];
let posSalesHistory = [];

if (!isSeeded) {

  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const randomTime = new Date(now.getTime() - Math.random() * (48 * 60 * 60 * 1000));

    const numItems = Math.floor(Math.random() * 3) + 1;
    let saleTotal = 0;
    const saleItems = [];
    for (let j = 0; j < numItems; j++) {
      const p = realisticInventory[Math.floor(Math.random() * realisticInventory.length)];
      saleItems.push({ id: p.id, nombre: p.nombre, qty: 1, precio: p.precio });
      saleTotal += p.precio;
    }
    posSalesHistory.push({
      fecha: randomTime.toISOString(),
      total: saleTotal,
      items: saleItems
    });
  }
  localStorage.setItem('gr30_pos_history', JSON.stringify(posSalesHistory));
  localStorage.setItem('gr30_v3_seeded', 'true');
} else {
  posSalesHistory = JSON.parse(localStorage.getItem('gr30_pos_history')) || [];
}
window.toggleMobileMenu = function() {
  const nav = document.getElementById('sidebar-nav');
  const icon = document.getElementById('adminMenuIcon');
  const btn = document.getElementById('mobileMenuBtn');
  if (nav.classList.contains('hidden')) {
    nav.classList.remove('hidden');
    nav.classList.add('flex');
    icon.classList.remove('ph-list');
    icon.classList.add('ph-x');
    btn.setAttribute('aria-expanded', 'true');
  } else {
    nav.classList.add('hidden');
    nav.classList.remove('flex');
    icon.classList.remove('ph-x');
    icon.classList.add('ph-list');
    btn.setAttribute('aria-expanded', 'false');
  }
};

function setScreen(name) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('block');
    s.classList.add('hidden');
  });
  const targetScreen = document.getElementById('screen-' + name);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
    targetScreen.classList.add('block');
  }
  
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

let barcodeBuffer = '';
let barcodeTimeout;

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    if (e.target.id !== 'pr-barcode' && e.target.id !== 'search-pos' && e.target.id !== 'inventory-search') return;
  }
  
  if (e.key === 'Enter') {
    if (barcodeBuffer.length >= 3) {
      handleBarcodeScan(barcodeBuffer);
      e.preventDefault(); 
    }
    barcodeBuffer = '';
  } else if (e.key.length === 1) {
    barcodeBuffer += e.key;
    clearTimeout(barcodeTimeout);
    barcodeTimeout = setTimeout(() => { barcodeBuffer = ''; }, 50);
  }
});

function handleBarcodeScan(code) {
  if (document.getElementById('modal-overlay') && !document.getElementById('modal-overlay').classList.contains('hidden')) {
    if (currentModalType === 'product-form') {
      const input = document.getElementById('pr-barcode');
      if (input) input.value = code;
      return;
    }
  }

  const product = inventoryData.find(p => p.barcode === code);
  
  if (product) {
    const screenInv = document.getElementById('screen-inventario');
    if (screenInv && !screenInv.classList.contains('hidden')) {
      updateStock(product.id, 1);
      showScannerFlash('+1 ' + product.nombre, 'success');
      return;
    }
    
    addToCart(product.id);
    setScreen('pos');
    showScannerFlash('AGREGADO: ' + product.nombre, 'success');
  } else {
    showScannerFlash('CÓDIGO DESCONOCIDO: ' + code, 'error');
    sysModal('confirm', 'CÓDIGO NO ENCONTRADO', `El código escaneado (${code}) no pertenece a ningún producto. ¿Deseas agregarlo al inventario?`).then(confirmed => {
      if (confirmed) {
        setScreen('inventario');
        openModal('product-form');
        setTimeout(() => {
          const barcodeInput = document.getElementById('pr-barcode');
          if (barcodeInput) barcodeInput.value = code;
        }, 100);
      }
    });
  }
}

function showScannerFlash(msg, type) {
  const flash = document.createElement('div');
  flash.className = `fixed top-0 left-0 w-full p-6 text-center font-display font-bold uppercase tracking-widest text-xl sm:text-2xl z-[9999999] transition-all duration-300 transform -translate-y-full ${type === 'success' ? 'bg-brand-green text-brand-black' : 'bg-brand-black text-brand-white'}`;
  flash.innerText = msg;
  document.body.appendChild(flash);
  
  setTimeout(() => flash.classList.remove('-translate-y-full'), 10);
  
  setTimeout(() => {
    flash.classList.add('-translate-y-full');
    setTimeout(() => flash.remove(), 300);
  }, 2000);
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
    
   
    const channel = window.supabaseClient.channel('public:accesos');
    channel.on('broadcast', { event: 'acceso' }, (payload) => {
      const log = payload.payload;
      accesosData.unshift(log);
      if (accesosData.length > 50) accesosData.pop();
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
        m.biometria = ['enrolado'];
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
  renderPOS();
  renderInventoryStats();
  filterInventoryList(document.getElementById('inventory-search') ? document.getElementById('inventory-search').value : '');
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

  const statAfluencia = document.getElementById('stat-afluencia');
  const statHoraPico = document.getElementById('stat-horapico');

  if (statAfluencia) {
    const today = new Date().toISOString().split('T')[0];
    const hoyCount = accesosData.filter(a => a.estado === 'permitido' && a.tiempo.startsWith(today)).length;
    statAfluencia.textContent = hoyCount;
  }

  if (statHoraPico) {
    const hourCounts = {};
    let maxHour = -1;
    let maxCount = 0;
    
    accesosData.filter(a => a.estado === 'permitido').forEach(a => {
      const h = new Date(a.tiempo).getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
      if (hourCounts[h] > maxCount) {
        maxCount = hourCounts[h];
        maxHour = h;
      }
    });

    if (maxHour !== -1) {
      const ampm = maxHour >= 12 ? 'PM' : 'AM';
      let h12 = maxHour % 12;
      h12 = h12 ? h12 : 12; 
      statHoraPico.textContent = `${h12}:00 ${ampm}`;
    } else {
      statHoraPico.textContent = '--:--';
    }
  }
}

const searchMiembrosEl = document.getElementById('search-miembros');
if (searchMiembrosEl) searchMiembrosEl.addEventListener('input', renderTables);

const searchPagosEl = document.getElementById('search-pagos');
if (searchPagosEl) searchPagosEl.addEventListener('input', renderPagos);

function renderTables() {
  const btnClasses = "font-display font-bold uppercase tracking-widest px-6 py-3 text-xs border-4 border-brand-black bg-brand-black text-brand-white hover:bg-brand-green hover:border-brand-green hover:text-brand-black focus:bg-brand-green focus:border-brand-green focus:text-brand-black active:bg-brand-green active:border-brand-green active:text-brand-black transition-colors focus:outline-none";
  const btnDangerClasses = "font-display font-bold uppercase tracking-widest px-6 py-3 text-xs bg-brand-white text-brand-black border-4 border-brand-black hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white active:bg-brand-black active:text-brand-white transition-colors focus:outline-none";
  const rowClasses = "border-b-4 border-brand-black hover:bg-brand-green focus-within:bg-brand-green transition-colors group";

  const stb = document.getElementById('staff-table-body');
  if (stb) {
    stb.innerHTML = staffData.length === 0 ? '<tr><td colspan="3" class="p-6 text-center font-display font-bold uppercase tracking-widest text-sm opacity-50">NO HAY STAFF REGISTRADO</td></tr>' : staffData.slice(0,4).map(s => `
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
    sfb.innerHTML = staffData.length === 0 ? '<tr><td colspan="3" class="p-6 text-center font-display font-bold uppercase tracking-widest text-sm opacity-50">NO HAY STAFF REGISTRADO</td></tr>' : staffData.map(s => `
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

  const statsContainer = document.getElementById('stats-miembros-container');
  if (statsContainer) {
    let activos = 0;
    let inactivos = 0;
    const planesCount = {};

    membersData.forEach(m => {
      if (m.estado_pago === 'al_dia') activos++;
      else inactivos++;
      if (m.plan) {
        planesCount[m.plan] = (planesCount[m.plan] || 0) + 1;
      }
    });

    let topPlan = '-';
    let topPlanCount = 0;
    for (const [plan, count] of Object.entries(planesCount)) {
      if (count > topPlanCount) {
        topPlanCount = count;
        topPlan = plan;
      }
    }

    statsContainer.innerHTML = `
      <div class="border-4 border-brand-black p-6 bg-brand-white text-brand-black flex flex-col">
        <p class="font-bold uppercase tracking-widest text-xs opacity-60 mb-2">Miembros Al Día</p>
        <p class="text-5xl font-display font-bold tracking-tighter">${activos}</p>
      </div>
      <div class="border-4 border-brand-black p-6 bg-brand-black text-brand-white flex flex-col">
        <p class="font-bold uppercase tracking-widest text-xs opacity-60 mb-2">Miembros Atrasados</p>
        <p class="text-5xl font-display font-bold tracking-tighter">${inactivos}</p>
      </div>
      <div class="border-4 border-brand-black p-6 bg-brand-green text-brand-black flex flex-col">
        <p class="font-bold uppercase tracking-widest text-xs opacity-60 mb-2">Plan Más Popular</p>
        <p class="text-3xl font-display font-bold tracking-tighter uppercase mt-auto">${topPlan}</p>
      </div>
    `;
  }

  const mfb = document.getElementById('members-full-table-body');
  if (mfb) mfb.innerHTML = membersData.length === 0 ? '<tr><td colspan="4" class="p-6 text-center font-display font-bold uppercase tracking-widest text-sm opacity-50">NO HAY MIEMBROS REGISTRADOS</td></tr>' : mHtml;
  
  const mpb = document.getElementById('members-preview-body');
  if (mpb) mpb.innerHTML = membersData.length === 0 ? '<tr><td colspan="4" class="p-6 text-center font-display font-bold uppercase tracking-widest text-sm opacity-50">NO HAY MIEMBROS REGISTRADOS</td></tr>' : prevHtml;
}

function renderPlanes() {
  const container = document.getElementById('planes-container');
  if (!planesData || planesData.length === 0) {
    container.innerHTML = '<div class="col-span-full p-8 text-center border-4 border-brand-black bg-brand-white"><p class="font-display font-bold uppercase tracking-widest opacity-50">NO HAY PLANES REGISTRADOS</p></div>';
    return;
  }
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






var currentModalType = null;
var currentModalId   = null;

function openModal(type, idOrName) {
  try {
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
  } else if (type === 'product-form') {
    const p = inventoryData.find(x => x.id === idOrName);
    title.textContent = p ? 'Editar Producto.' : 'Añadir Producto.';
    body.innerHTML = productFormHTML(p);
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
  } catch (error) {

    showKioskAlert('Error al abrir la ventana: ' + error.message, 'error');
  }
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
    <form onsubmit="saveMember(event)" novalidate class="flex flex-col gap-8 text-brand-black">
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
            ${typeof planesData !== 'undefined' && planesData.length > 0 ? planesData.map(p => `<option value="${p.nombre}" ${m && m.plan===p.nombre ? 'selected':''}>${p.nombre ? p.nombre.toUpperCase() : 'SIN NOMBRE'}</option>`).join('') : '<option value="" disabled>NO HAY PLANES REGISTRADOS</option>'}
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

function productFormHTML(p) {
  p = p || {};
  return `
    <form onsubmit="saveProduct(event)" id="form-product" class="flex flex-col gap-6">
      <input type="hidden" id="pr-id" value="${p.id || ''}">
      <div>
        <label class="${labelCls}">Nombre del Producto</label>
        <input type="text" id="pr-nombre" value="${p.nombre || ''}" class="${inputCls}" required>
      </div>
      <div>
        <label class="${labelCls}">Foto (URL de la imagen)</label>
        <input type="text" id="pr-img" value="${p.img || 'assets/img/pos_snack.png'}" class="${inputCls}" placeholder="ej: assets/img/pos_snack.png" required>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label class="${labelCls}">Precio ($)</label>
          <input type="number" id="pr-precio" value="${p.precio !== undefined ? p.precio : ''}" min="0" step="0.01" class="${inputCls}" required>
        </div>
        <div>
          <label class="${labelCls}">Stock Inicial</label>
          <input type="number" id="pr-stock" value="${p.stock !== undefined ? p.stock : 0}" min="0" class="${inputCls}" required>
        </div>
      </div>
      <div>
        <label class="${labelCls}">Código de Barras (Opcional)</label>
        <div class="flex">
          <input type="text" id="pr-barcode" value="${p.barcode || ''}" class="${inputCls} border-r-0 placeholder:text-brand-black/30" placeholder="ESCANEA O ESCRIBE">
          <button type="button" onclick="openCameraScanner('pr-barcode')" class="flex-shrink-0 w-16 sm:w-20 border-4 border-brand-black flex items-center justify-center bg-brand-white text-brand-black hover:bg-brand-black hover:text-brand-white focus:outline-none transition-colors" aria-label="Escanear con cámara">
            <i class="ph-bold ph-camera text-2xl sm:text-3xl"></i>
          </button>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row justify-between gap-4 mt-4">
        ${p.id ? `<button type="button" onclick="deleteProduct('${p.id}')" class="${deleteBtnCls} w-full sm:w-auto">Eliminar Producto</button>` : '<div></div>'}
        <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button type="button" onclick="closeModal()" class="${cancelBtnCls} w-full sm:w-auto">Cancelar</button>
          <button type="submit" class="${saveBtnCls} w-full sm:w-auto">Guardar Producto</button>
        </div>
      </div>
    </form>
  `;
}

window.saveProduct = async function(e) {
  e.preventDefault();
  const id = document.getElementById('pr-id').value;
  const nombre = document.getElementById('pr-nombre').value.trim();
  const precio = parseFloat(document.getElementById('pr-precio').value);
  const stock = parseInt(document.getElementById('pr-stock').value, 10);
  const img = document.getElementById('pr-img').value.trim();
  const barcode = document.getElementById('pr-barcode').value.trim();

  if (!nombre || isNaN(precio) || isNaN(stock)) {
    if(window.sysModal) window.sysModal('error', 'ERROR', 'Faltan datos obligatorios.');
    return;
  }

  const originalText = e.submitter.textContent;
  e.submitter.textContent = "Guardando...";
  e.submitter.disabled = true;

  try {
    if (id) {
      const payload = { nombre, precio, stock, barcode: barcode || null, img: img || 'assets/img/pos_snack.png' };
      const { error } = await window.supabaseClient.from('inventory').update(payload).eq('id', id);
      if (error) throw error;
      const prod = inventoryData.find(x => x.id === id);
      if (prod) {
        prod.nombre = nombre;
        prod.precio = precio;
        prod.stock = stock;
        prod.barcode = barcode || null;
        prod.img = img || 'assets/img/pos_snack.png';
      }
      if(window.showToast) window.showToast('PRODUCTO ACTUALIZADO CON ÉXITO');
    } else {
      const payload = { nombre, precio, stock, barcode: barcode || null, img: img || 'assets/img/pos_snack.png' };
      const { data, error } = await window.supabaseClient.from('inventory').insert([payload]).select();
      if (error) throw error;
      if (data && data.length > 0) inventoryData.push(data[0]);
      if(window.showToast) window.showToast('PRODUCTO AÑADIDO CON ÉXITO');
    }
    closeModal();
    const searchInput = document.getElementById('inventory-search');
    if(window.filterInventoryList) window.filterInventoryList(searchInput ? searchInput.value : '');
    if(window.renderPOS) window.renderPOS();
    if(window.renderInventoryStats) window.renderInventoryStats();
  } catch (err) {
    if(window.sysModal) window.sysModal('error', 'ERROR', 'Fallo al guardar producto en la base de datos.');
  } finally {
    e.submitter.textContent = originalText;
    e.submitter.disabled = false;
  }
};

window.deleteProduct = function(id) {
  if(window.sysModal) {
    window.sysModal('confirm', 'ELIMINAR PRODUCTO', '¿ESTÁS SEGURO DE ELIMINAR ESTE PRODUCTO? ESTO NO SE PUEDE DESHACER.').then(async confirmed => {
      if (!confirmed) return;
      try {
        const { error } = await window.supabaseClient.from('inventory').delete().eq('id', id);
        if (error) throw error;
        const idx = inventoryData.findIndex(x => x.id === id);
        if (idx !== -1) {
          inventoryData.splice(idx, 1);
          if (typeof posCart !== 'undefined') posCart = posCart.filter(item => item.id !== id);
          if (window.renderCart) window.renderCart();
          if (window.renderPOS) window.renderPOS();
          if (window.renderInventoryStats) window.renderInventoryStats();
          const searchInput = document.getElementById('inventory-search');
          if (window.filterInventoryList) window.filterInventoryList(searchInput ? searchInput.value : '');
          closeModal();
          if(window.showToast) window.showToast('PRODUCTO ELIMINADO');
        }
      } catch (err) {
        if(window.sysModal) window.sysModal('error', 'ERROR', 'Fallo al eliminar producto.');
      }
    });
  }
};

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

  const originalText = e.submitter ? e.submitter.textContent : 'Guardar';
  if (e.submitter) {
    e.submitter.textContent = "Guardando...";
    e.submitter.disabled = true;
  }

  if (!nombre) {
    if (e.submitter) { e.submitter.textContent = originalText; e.submitter.disabled = false; }
    return sysModal('error', 'FALTAN DATOS', 'Por favor, ingresa el nombre completo del miembro.');
  }
  if (!telefono) {
    if (e.submitter) { e.submitter.textContent = originalText; e.submitter.disabled = false; }
    return sysModal('error', 'FALTAN DATOS', 'Por favor, ingresa el teléfono del miembro.');
  }
  if (!plan) {
    if (e.submitter) { e.submitter.textContent = originalText; e.submitter.disabled = false; }
    return sysModal('error', 'FALTAN DATOS', 'Por favor, selecciona un plan.');
  }

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
    ptb.innerHTML = filtered.length === 0 ? '<tr><td colspan="4" class="p-6 text-center font-display font-bold uppercase tracking-widest text-sm opacity-50">NO SE ENCONTRARON PAGOS</td></tr>' : filtered.map(m => `
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


function renderAccesos() {
  const statHoy = document.getElementById('stat-accesos-hoy');
  const statPico = document.getElementById('stat-accesos-horapico');
  
  if (statHoy) {
    const today = new Date().toISOString().split('T')[0];
    statHoy.textContent = accesosData.filter(a => a.estado === 'permitido' && a.tiempo.startsWith(today)).length;
  }
  
  if (statPico) {
    const hourCounts = {};
    let maxHour = -1;
    let maxCount = 0;
    
    accesosData.filter(a => a.estado === 'permitido').forEach(a => {
      const h = new Date(a.tiempo).getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
      if (hourCounts[h] > maxCount) {
        maxCount = hourCounts[h];
        maxHour = h;
      }
    });

    if (maxHour !== -1) {
      const ampm = maxHour >= 12 ? 'PM' : 'AM';
      let h12 = maxHour % 12;
      h12 = h12 ? h12 : 12; 
      statPico.textContent = `${h12}:00 ${ampm}`;
    } else {
      statPico.textContent = '--:--';
    }
  }

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

   
    let nuevaFecha = new Date(hoy);
    if (planInfo.periodo === 'Mes') {
      nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    } else if (planInfo.periodo === 'Año') {
      nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1);
    }
    
    const strVencimiento = nuevaFecha.toISOString().split('T')[0];

   
    const { error: miemErr } = await window.supabaseClient.from('miembros').update({ activo: true }).eq('id', m.id);
    if (miemErr) throw miemErr;

   
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
        m.estado_pago = 'atrasado';
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
  
 
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.remove('translate-x-full');
    });
  });

 
  const duration = isPermitted ? 5000 : (isDenied ? 10000 : 8000);
  setTimeout(() => {
    if (document.getElementById(alertId)) {
      el.classList.add('translate-x-full');
      setTimeout(() => { if (el) el.remove(); }, 300);
    }
  }, duration);
}




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

function renderPOS() {
  const container = document.getElementById('pos-catalog-container');
  if (!container) return;

  const searchTermInput = document.getElementById('search-pos');
  const searchTerm = searchTermInput ? searchTermInput.value.toLowerCase().trim() : '';
  const filteredItems = inventoryData.filter(item => item.nombre.toLowerCase().includes(searchTerm));

  if (filteredItems.length === 0) {
    container.innerHTML = `<div class="p-8 text-center border-4 border-brand-black bg-brand-white"><p class="font-display font-bold uppercase tracking-widest text-brand-black">No se encontraron productos.</p></div>`;
    renderCart();
    return;
  }

  container.innerHTML = filteredItems.map(item => {
    const agotado = item.stock <= 0;
    const stockBajo = !agotado && item.stock <= 5;

    return `
    <div class="bg-brand-white border-4 border-brand-black flex flex-col">
      <div class="w-full aspect-[3/4] bg-brand-white border-b-4 border-brand-black flex items-center justify-center overflow-hidden relative p-8">
        <img src="${item.img}" alt="${item.nombre}" class="w-full ${agotado ? 'opacity-50' : ''}">
        ${agotado ? '<div class="absolute inset-0 flex items-center justify-center bg-brand-white"><p class="font-display font-bold uppercase tracking-widest text-sm">Agotado</p></div>' : ''}
      </div>
      <div class="p-6 flex flex-col justify-between flex-1">
        <h3 class="font-display font-bold uppercase tracking-widest text-lg mb-2 leading-tight">${item.nombre}</h3>
        <div>
          <p class="font-display font-bold text-3xl tracking-tighter mb-4">$${item.precio}</p>
          <button
            ${agotado ? 'disabled' : `onclick="addToCart('${item.id}')"`}
            class="w-full text-center font-display font-bold uppercase tracking-widest px-4 py-3 text-xs focus:outline-none border-4 border-brand-black ${agotado ? 'bg-brand-white opacity-50' : 'bg-brand-black text-brand-white hover:bg-brand-green hover:text-brand-black focus:bg-brand-green focus:text-brand-black active:bg-brand-green active:text-brand-black transition-colors'}"
          >${agotado ? 'AGOTADO' : 'Añadir'}</button>
        </div>
      </div>
    </div>
  `;
  }).join('');

  renderCart();
  initPOSSearch();
}

function initPOSSearch() {
  const input = document.getElementById('search-pos');
  if (input && !input._posListenerAttached) {
    input.addEventListener('input', renderPOS);
    input._posListenerAttached = true;
  }
}

window.addToCart = function(id) {
  const product = inventoryData.find(p => p.id === id);
  if (!product || product.stock <= 0) return;

  const existingItem = posCart.find(i => i.id === id);
  if (existingItem) {
    if (existingItem.qty < product.stock) {
      existingItem.qty += 1;
    } else {
      showToast('STOCK MÁXIMO ALCANZADO');
      return;
    }
  } else {
    posCart.push({ id: id, qty: 1 });
  }
  renderCart();
};

window.updateCartQty = function(id, change) {
  const itemIndex = posCart.findIndex(i => i.id === id);
  if (itemIndex === -1) return;
  
  const product = inventoryData.find(p => p.id === id);
  const item = posCart[itemIndex];
  
  const newQty = item.qty + change;
  if (newQty <= 0) {
    posCart.splice(itemIndex, 1);
  } else if (newQty > product.stock) {
    showToast('STOCK MÁXIMO ALCANZADO');
  } else {
    item.qty = newQty;
  }
  renderCart();
};

window.removeFromCart = function(id) {
  const itemIndex = posCart.findIndex(i => i.id === id);
  if (itemIndex > -1) {
    posCart.splice(itemIndex, 1);
    renderCart();
  }
};

function renderCart() {
  const cartContainer = document.getElementById('pos-cart-container');
  const totalEl = document.getElementById('pos-total');
  const btnCobrar = document.getElementById('btn-cobrar-pos');
  if (!cartContainer || !totalEl) return;

  if (posCart.length === 0) {
    cartContainer.innerHTML = `<div class="flex flex-col items-center justify-center py-12 opacity-50"><i class="ph-bold ph-shopping-cart text-5xl mb-4"></i><p class="font-display font-bold uppercase tracking-widest text-sm text-center">Carrito Vacío</p></div>`;
    totalEl.textContent = '$0';
    if (btnCobrar) { btnCobrar.disabled = true; btnCobrar.classList.add('opacity-50'); }
    return;
  }

  if (btnCobrar) { btnCobrar.disabled = false; btnCobrar.classList.remove('opacity-50'); }

  let total = 0;
  cartContainer.innerHTML = posCart.map(item => {
    const product = inventoryData.find(p => p.id === item.id);
    const itemTotal = product.precio * item.qty;
    total += itemTotal;

    return `
      <div class="border-4 border-brand-black p-4 bg-brand-white relative">
        <div class="flex items-start justify-between mb-4 gap-4">
          <p class="font-display font-bold uppercase text-sm leading-tight">${product.nombre}</p>
          <p class="font-bold tracking-tighter text-xl">$${itemTotal}</p>
        </div>
        <div class="flex items-center justify-between border-t-4 border-brand-black pt-4 mt-2">
          <div class="flex items-center gap-2 border-4 border-brand-black bg-brand-white px-2 py-1">
            <button onclick="updateCartQty('${item.id}', -1)" class="flex items-center justify-center hover:bg-brand-black hover:text-brand-white focus:outline-none transition-colors w-8 h-8"><i class="ph-bold ph-minus text-xs"></i></button>
            <span class="font-display font-bold text-center text-sm px-2">${item.qty}</span>
            <button onclick="updateCartQty('${item.id}', 1)" class="flex items-center justify-center hover:bg-brand-black hover:text-brand-white focus:outline-none transition-colors w-8 h-8"><i class="ph-bold ph-plus text-xs"></i></button>
          </div>
          <button onclick="removeFromCart('${item.id}')" class="flex items-center justify-center bg-brand-black text-brand-white hover:bg-brand-green hover:text-brand-black focus:outline-none transition-colors w-10 h-10 flex-shrink-0" title="Eliminar">
            <i class="ph-bold ph-x text-sm"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  totalEl.textContent = '$' + total;
}

window.procesarVenta = function() {
  if (posCart.length === 0) return;
  
  let totalVenta = 0;
  const saleItems = [];
  
 
  posCart.forEach(item => {
    const product = inventoryData.find(p => p.id === item.id);
    if (product) {
      product.stock -= item.qty;
      totalVenta += product.precio * item.qty;
      saleItems.push({ nombre: product.nombre, qty: item.qty, subtotal: product.precio * item.qty });
    }
  });
  
 
  posSalesHistory.push({
    fecha: new Date().toISOString(),
    total: totalVenta,
    items: saleItems
  });
  
  if (window.sysModal) {
    window.sysModal('success', 'VENTA COMPLETADA', `Se ha registrado una venta por un total de <span class="bg-brand-black text-brand-white px-2 py-1">$${totalVenta}</span> y el inventario ha sido descontado.`).then(() => {
      posCart = [];
      renderPOS();
    });
  } else {
    alert('Venta completada por $' + totalVenta);
    posCart = [];
    renderPOS();
  }
};

window.updateStock = function(id, delta) {
  const product = inventoryData.find(p => p.id === id);
  if (product) {
    product.stock += delta;
    if (product.stock < 0) product.stock = 0;
    saveInventory();
    
    const searchInput = document.getElementById('inventory-search');
    filterInventoryList(searchInput ? searchInput.value : '');
    renderPOS();
    renderInventoryStats();
  }
};

window.renderInventoryTableBody = function(query = '') {
  const normalizedQuery = query.toLowerCase().trim();
  const filtered = inventoryData.filter(p => 
    p.nombre.toLowerCase().includes(normalizedQuery) || 
    (p.barcode && p.barcode.includes(normalizedQuery))
  );

  if (filtered.length === 0) {
    return `
      <div class="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 p-8 text-center bg-brand-white border-4 border-brand-black">
        <p class="font-display font-bold uppercase tracking-widest text-2xl text-brand-black">NO SE ENCONTRARON PRODUCTOS</p>
      </div>
    `;
  }

  return filtered.map(p => {
    const safeStock = Number(p.stock) || 0;
    const safePrecio = Number(p.precio) || 0;
    
    return `
    <div class="border-4 border-brand-black bg-brand-white flex flex-col group relative text-brand-black">
      <div class="absolute top-4 right-4 text-xs font-bold uppercase tracking-widest px-2 py-1 border-2 border-brand-black bg-brand-white text-brand-black z-10">
        Stock: ${safeStock}
      </div>
      <div class="w-full h-48 sm:h-56 p-6 flex justify-center items-center border-b-4 border-brand-black">
        <img src="${p.img || 'assets/img/pos_snack.png'}" class="max-w-full max-h-full object-contain" onerror="this.src='assets/img/pos_snack.png'">
      </div>
      <div class="p-6 flex flex-col flex-grow">
        <h3 class="font-display font-bold uppercase tracking-widest text-lg sm:text-xl leading-tight mb-2">${p.nombre}</h3>
        <p class="font-bold text-2xl tracking-tighter mb-6">$${safePrecio.toFixed(2)}</p>
        
        <div class="mt-auto flex flex-col gap-4">
          <div class="flex items-center justify-between border-4 border-brand-black p-2">
            <button onclick="updateStock('${p.id}', -1)" class="w-10 h-10 flex items-center justify-center hover:bg-brand-green hover:text-brand-black text-2xl font-bold transition-colors focus:outline-none border-2 border-transparent hover:border-brand-black">-</button>
            <span class="font-display font-bold text-2xl tracking-tighter w-12 text-center">${safeStock}</span>
            <button onclick="updateStock('${p.id}', 1)" class="w-10 h-10 flex items-center justify-center hover:bg-brand-green hover:text-brand-black text-2xl font-bold transition-colors focus:outline-none border-2 border-transparent hover:border-brand-black">+</button>
          </div>
          
          <button onclick="openModal('product-form', '${p.id}')" class="w-full py-3 border-4 border-brand-black text-brand-black hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white font-display font-bold uppercase tracking-widest text-sm transition-colors focus:outline-none">
            Editar
          </button>
        </div>
      </div>
    </div>
  `}).join('');
};

window.filterInventoryList = function(query) {
  const tbody = document.getElementById('inventory-tbody');
  if (tbody) {
    tbody.innerHTML = renderInventoryTableBody(query);
  }
};

window.renderInventoryStats = function() {
  let totalIngresos = posSalesHistory.reduce((acc, sale) => acc + sale.total, 0);
  
  const salesCount = {};
  posSalesHistory.forEach(sale => {
    sale.items.forEach(item => {
      salesCount[item.id] = (salesCount[item.id] || 0) + item.qty;
    });
  });
  let topSellerId = null;
  let topSellerCount = 0;
  for (const [id, count] of Object.entries(salesCount)) {
    if (count > topSellerCount) {
      topSellerCount = count;
      topSellerId = id;
    }
  }
  let topSellerName = 'Ninguno';
  if (topSellerId) {
    const prod = inventoryData.find(p => p.id === topSellerId);
    if (prod) topSellerName = prod.nombre;
  }

  const lowStockItems = inventoryData.filter(p => p.stock <= 5);
  const alertContainer = document.getElementById('inventario-alert-container');
  if (alertContainer) {
    if (lowStockItems.length > 0) {
      alertContainer.innerHTML = `
        <div class="bg-brand-black text-brand-white border-4 border-brand-black p-6 mb-8 flex flex-col sm:flex-row items-center gap-4 animate-pulse">
          <i class="ph-bold ph-warning text-4xl text-brand-white"></i>
          <div>
            <p class="font-display font-bold uppercase tracking-widest text-xl">Alerta Crítica de Escasez</p>
            <p class="font-bold uppercase opacity-80 text-sm mt-1">${lowStockItems.length} producto(s) con stock crítico. Reabastecer inmediatamente.</p>
          </div>
        </div>
      `;
    } else {
      alertContainer.innerHTML = '';
    }
  }

  const statsContainer = document.getElementById('stats-inventario-container');
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="bg-brand-black text-brand-white p-8 border-4 border-brand-black flex flex-col items-start hover:bg-brand-green hover:text-brand-black transition-colors group">
        <i class="ph-bold ph-currency-dollar text-4xl mb-4 text-brand-green group-hover:text-brand-black transition-colors"></i>
        <p class="text-xs font-display font-bold uppercase tracking-widest mb-2 bg-brand-white text-brand-black group-hover:bg-brand-black group-hover:text-brand-white inline-block px-2 py-1">Ingresos Totales POS</p>
        <p class="text-5xl font-display font-bold tracking-tighter">$${totalIngresos}</p>
      </div>
      <div class="bg-brand-white text-brand-black p-8 border-4 border-brand-black flex flex-col items-start hover:bg-brand-black hover:text-brand-white transition-colors group">
        <i class="ph-bold ph-receipt text-4xl mb-4 group-hover:text-brand-green transition-colors"></i>
        <p class="text-xs font-display font-bold uppercase tracking-widest mb-2 bg-brand-black text-brand-white group-hover:bg-brand-white group-hover:text-brand-black inline-block px-2 py-1">Ventas Realizadas</p>
        <p class="text-5xl font-display font-bold tracking-tighter">${posSalesHistory.length}</p>
      </div>
      <div class="bg-brand-green text-brand-black p-8 border-4 border-brand-black flex flex-col items-start hover:bg-brand-black hover:text-brand-white transition-colors group">
        <i class="ph-bold ph-trend-up text-4xl mb-4 text-brand-black group-hover:text-brand-green transition-colors"></i>
        <p class="text-xs font-display font-bold uppercase tracking-widest mb-2 bg-brand-black text-brand-white group-hover:bg-brand-white group-hover:text-brand-black inline-block px-2 py-1">Top Producto</p>
        <p class="text-3xl font-display font-bold tracking-tighter uppercase mt-auto leading-tight">${topSellerName}</p>
      </div>
    `;
  }
};


window.deleteProduct = function(id) {
  sysModal('confirm', 'ELIMINAR PRODUCTO', '¿ESTÁS SEGURO DE ELIMINAR ESTE PRODUCTO? ESTO NO SE PUEDE DESHACER.').then(confirmed => {
    if (!confirmed) return;
    const idx = inventoryData.findIndex(x => x.id === id);
    if (idx !== -1) {
      inventoryData.splice(idx, 1);
      saveInventory();
      // Limpiar el carrito POS por seguridad si tenía este producto
      posCart = posCart.filter(item => item.id !== id);
      renderCart();
      renderPOS();
      renderInventoryStats();
      const searchInput = document.getElementById('inventory-search');
      filterInventoryList(searchInput ? searchInput.value : '');
      closeModal();
      showToast('PRODUCTO ELIMINADO');
    }
  });
};

window.openCameraScanner = function(targetInputId) {
  const overlayHtml = `
    <div id="sys-scanner-overlay" class="fixed inset-0 bg-brand-black z-[999999] flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
      <div class="w-full max-w-lg bg-brand-white border-4 border-brand-black flex flex-col shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
        <div class="p-6 border-b-4 border-brand-black flex justify-between items-center bg-brand-black text-brand-white">
          <h3 class="font-display font-bold uppercase tracking-widest text-lg sm:text-xl">Escanear Código</h3>
          <button onclick="closeCameraScanner()" class="text-brand-white hover:text-brand-green focus:outline-none text-3xl"><i class="ph-bold ph-x"></i></button>
        </div>
        <div class="p-6 bg-brand-white flex-1 flex flex-col items-center">
          <div id="qr-reader" class="w-full border-4 border-brand-black min-h-[300px]"></div>
          <p class="mt-6 font-display font-bold uppercase tracking-widest text-xs text-center opacity-70">Apunta la cámara de tu dispositivo hacia el código de barras o QR.</p>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', overlayHtml);
  document.body.style.overflow = 'hidden';

  // Html5QrcodeScanner instanciación usando html5-qrcode
  if (typeof Html5QrcodeScanner !== 'undefined') {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: {width: 250, height: 250} },
      /* verbose= */ false
    );

    window.closeCameraScanner = function() {
      html5QrcodeScanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
      const overlay = document.getElementById('sys-scanner-overlay');
      if (overlay) overlay.remove();
      document.body.style.overflow = '';
    };

    html5QrcodeScanner.render((decodedText, decodedResult) => {
      // Escaneo exitoso
      const input = document.getElementById(targetInputId);
      if (input) {
        input.value = decodedText;
        // Disparar evento para actualizar
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      showToast('CÓDIGO ESCANEADO: ' + decodedText);
      closeCameraScanner();
    }, (error) => {
      // Ignorar errores de escaneo temporal
    });
  } else {
    sysModal('error', 'ERROR', 'Librería de escáner no cargada.');
    window.closeCameraScanner = function() {
      const overlay = document.getElementById('sys-scanner-overlay');
      if (overlay) overlay.remove();
      document.body.style.overflow = '';
    };
  }
};

window.openCameraScanner = function(targetInputId) {
  const overlayHtml = `
    <div id="sys-scanner-overlay" class="fixed inset-0 bg-brand-black z-[999999] flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
      <div class="w-full max-w-lg bg-brand-white border-4 border-brand-black flex flex-col shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
        <div class="p-6 border-b-4 border-brand-black flex justify-between items-center bg-brand-black text-brand-white">
          <h3 class="font-display font-bold uppercase tracking-widest text-lg sm:text-xl">Escanear Código</h3>
          <button onclick="closeCameraScanner()" class="text-brand-white hover:text-brand-green focus:outline-none text-3xl"><i class="ph-bold ph-x"></i></button>
        </div>
        <div class="p-6 bg-brand-white flex-1 flex flex-col items-center">
          <div id="qr-reader" class="w-full border-4 border-brand-black min-h-[300px]"></div>
          <p class="mt-6 font-display font-bold uppercase tracking-widest text-xs text-center opacity-70">Apunta la cámara de tu dispositivo hacia el código de barras o QR.</p>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', overlayHtml);
  document.body.style.overflow = 'hidden';

  if (typeof Html5QrcodeScanner !== 'undefined') {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: {width: 250, height: 250} },
      false
    );

    window.closeCameraScanner = function() {
      html5QrcodeScanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
      const overlay = document.getElementById('sys-scanner-overlay');
      if (overlay) overlay.remove();
      document.body.style.overflow = '';
    };

    html5QrcodeScanner.render((decodedText, decodedResult) => {
      const input = document.getElementById(targetInputId);
      if (input) {
        input.value = decodedText;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if(window.showToast) window.showToast('CÓDIGO ESCANEADO: ' + decodedText);
      closeCameraScanner();
    }, (error) => {});
  } else {
    if(window.sysModal) window.sysModal('error', 'ERROR', 'Librería de escáner no cargada.');
    window.closeCameraScanner = function() {
      const overlay = document.getElementById('sys-scanner-overlay');
      if (overlay) overlay.remove();
      document.body.style.overflow = '';
    };
  }
};

fetchData();
setScreen('dashboard');
