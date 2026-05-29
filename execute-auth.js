const fs = require('fs');

// 1. Create cliente.html
const clienteHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Mi Perfil | GR30.</title>
  <meta name="description" content="Perfil de miembro de GR30.">
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
</head>
<body class="font-sans bg-brand-white text-brand-black antialiased selection:bg-brand-green selection:text-brand-black min-h-screen flex flex-col">
  <header class="w-full bg-brand-white border-b-4 border-brand-black flex items-center justify-between px-6 lg:px-12 py-5 flex-shrink-0 z-50">
    <a href="index.html" class="flex items-center gap-4 group focus:outline-none focus:ring-4 focus:ring-brand-green focus:ring-offset-4 focus:ring-offset-brand-white">
      <div class="w-12 h-12 bg-brand-black text-brand-white flex items-center justify-center font-display font-bold text-2xl select-none group-hover:bg-brand-green group-hover:text-brand-black group-focus:bg-brand-green group-focus:text-brand-black group-active:bg-brand-green group-active:text-brand-black transition-colors">
        <span class="text-2xl leading-none">G</span>
      </div>
      <span class="font-display font-bold text-2xl uppercase tracking-widest text-brand-black hidden sm:block">Cliente<span class="text-brand-green">.</span></span>
    </a>
    <button onclick="logout()" class="border-4 border-brand-black bg-brand-black text-brand-white hover:bg-brand-white hover:text-brand-black focus:bg-brand-white focus:text-brand-black transition-colors px-6 py-3 font-display font-bold uppercase tracking-widest text-xs flex items-center gap-2 focus:outline-none">
      Cerrar Sesión <i class="ph-bold ph-sign-out text-lg"></i>
    </button>
  </header>

  <main class="flex-1 w-full max-w-4xl mx-auto p-6 sm:p-12">
    <div id="loading" class="flex items-center justify-center py-24">
      <i class="ph-bold ph-spinner animate-spin text-5xl text-brand-black"></i>
    </div>
    
    <div id="client-content" class="hidden flex-col gap-12">
      <!-- Info Header -->
      <div class="flex flex-col gap-4">
        <h1 class="text-[clamp(3rem,8vw,5rem)] leading-none font-display font-bold uppercase tracking-tighter text-brand-black">Hola, <br><span id="c-nombre" class="text-brand-green break-all">...</span></h1>
      </div>

      <!-- Alert Section (Hidden by default) -->
      <div id="alert-section" class="hidden bg-brand-black text-brand-white border-4 border-brand-black p-6 sm:p-8 flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 class="text-2xl font-display font-bold uppercase tracking-widest text-brand-green mb-2 flex items-center gap-2"><i class="ph-bold ph-warning"></i> Pago Pendiente</h2>
          <p class="font-medium text-lg leading-relaxed">Tu plan actual requiere regularización. Acércate a recepción para evitar la suspensión de tu acceso.</p>
        </div>
      </div>

      <!-- Details Card -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-brand-white border-4 border-brand-black p-6 sm:p-8">
          <p class="text-xs font-display font-bold uppercase tracking-widest text-brand-black mb-2 opacity-60">Plan Actual</p>
          <p id="c-plan" class="text-2xl font-display font-bold uppercase tracking-widest text-brand-black break-all">...</p>
        </div>
        <div class="bg-brand-white border-4 border-brand-black p-6 sm:p-8">
          <p class="text-xs font-display font-bold uppercase tracking-widest text-brand-black mb-2 opacity-60">Estado</p>
          <div id="c-estado">...</div>
        </div>
        <div class="bg-brand-white border-4 border-brand-black p-6 sm:p-8">
          <p class="text-xs font-display font-bold uppercase tracking-widest text-brand-black mb-2 opacity-60">Vencimiento</p>
          <p id="c-venc" class="text-2xl font-display font-bold uppercase tracking-widest text-brand-black">...</p>
        </div>
      </div>

      <!-- Historial -->
      <div>
        <h2 class="text-3xl font-display font-bold uppercase tracking-tighter mb-6 text-brand-black border-b-4 border-brand-black pb-4">Tus Pagos.</h2>
        <div id="historial-container" class="flex flex-col gap-4">
          <!-- Rows -->
        </div>
      </div>
    </div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="assets/js/supabase.js"></script>
  <script>
    const sessionTel = localStorage.getItem('gr30_session');
    if (!sessionTel || sessionTel === 'admin') {
      window.location.href = 'login.html';
    }

    function logout() {
      localStorage.removeItem('gr30_session');
      window.location.href = 'login.html';
    }

    async function loadClientData() {
      try {
        const { data: member, error } = await window.supabaseClient.from('miembros').select('*').eq('telefono', sessionTel).single();
        if (error || !member) {
          logout();
          return;
        }

        document.getElementById('c-nombre').textContent = member.nombre;
        document.getElementById('c-plan').textContent = member.plan;

        let badge = '';
        if (member.estado_pago === 'al_dia') {
          badge = '<span class="bg-brand-green text-brand-black font-display font-bold uppercase tracking-widest text-xs px-2 py-1 inline-block border-4 border-brand-green">Al Día</span>';
        } else if (member.estado_pago === 'atrasado') {
          badge = '<span class="bg-brand-black text-brand-white font-display font-bold uppercase tracking-widest text-xs px-2 py-1 inline-flex items-center gap-1 w-max border-4 border-brand-black"><i class="ph-bold ph-warning text-sm"></i> Atrasado</span>';
          document.getElementById('alert-section').classList.remove('hidden');
          document.getElementById('alert-section').classList.add('flex');
        } else {
          badge = '<span class="bg-brand-white text-brand-black font-display font-bold uppercase tracking-widest text-xs px-2 py-1 inline-block border-4 border-brand-black">Pendiente</span>';
          document.getElementById('alert-section').classList.remove('hidden');
          document.getElementById('alert-section').classList.add('flex');
        }
        document.getElementById('c-estado').innerHTML = badge;

        // Fetch pagos
        const { data: pagos } = await window.supabaseClient.from('pagos').select('*').eq('miembro_id', member.id).order('fecha', { ascending: false });
        
        // Simular fecha vencimiento del último pago
        let venc = '-';
        if (pagos && pagos.length > 0) {
          const lastDate = new Date(pagos[0].fecha);
          lastDate.setMonth(lastDate.getMonth() + 1);
          venc = lastDate.toISOString().split('T')[0];
        }
        document.getElementById('c-venc').textContent = venc;

        const histContainer = document.getElementById('historial-container');
        if (!pagos || pagos.length === 0) {
          histContainer.innerHTML = '<div class="bg-brand-white border-4 border-brand-black p-6 font-bold uppercase tracking-widest text-sm text-brand-black text-center">No hay pagos registrados.</div>';
        } else {
          histContainer.innerHTML = pagos.map(p => \`
            <div class="bg-brand-white border-4 border-brand-black p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <p class="font-display font-bold text-xl uppercase text-brand-black">\$\${p.monto} mxn</p>
                <p class="text-xs font-bold uppercase tracking-widest opacity-60 mt-1">\${p.metodo}</p>
              </div>
              <div class="font-display font-bold uppercase tracking-widest text-sm bg-brand-black text-brand-white px-4 py-2 text-center w-max">
                \${p.fecha}
              </div>
            </div>
          \`).join('');
        }

        document.getElementById('loading').classList.add('hidden');
        document.getElementById('client-content').classList.remove('hidden');
        document.getElementById('client-content').classList.add('flex');

      } catch (err) {
        console.error(err);
      }
    }

    document.addEventListener('DOMContentLoaded', loadClientData);
  </script>
</body>
</html>`;

fs.writeFileSync('c:/Users/DELL/Documents/GR30/cliente.html', clienteHTML);

// 2. Protect admin.html
let adminHtml = fs.readFileSync('c:/Users/DELL/Documents/GR30/admin.html', 'utf8');
const authCheck = `<script>
    if (localStorage.getItem('gr30_session') !== 'admin') {
      window.location.href = 'login.html';
    }
    function logoutAdmin() {
      localStorage.removeItem('gr30_session');
      window.location.href = 'login.html';
    }
  </script>
</head>`;
adminHtml = adminHtml.replace('</head>', authCheck);

// Optional: Change sidebar 'Regresar al Inicio' to logout logic
adminHtml = adminHtml.replace(/<a href="index.html" class="nav-btn.*?Regresar al Inicio<\/a>/, 
  `<button onclick="logoutAdmin()" class="nav-btn w-full text-left px-6 py-4 border-4 border-transparent hover:border-brand-black font-display font-bold text-sm tracking-widest uppercase transition-colors focus:outline-none text-brand-black hover:bg-brand-green hover:text-brand-black focus:bg-brand-green focus:text-brand-black active:bg-brand-green active:text-brand-black flex items-center gap-3"><i class="ph-bold ph-sign-out text-xl"></i> Cerrar Sesión</button>`);
fs.writeFileSync('c:/Users/DELL/Documents/GR30/admin.html', adminHtml);

// 3. Update login.html logic
let loginHtml = fs.readFileSync('c:/Users/DELL/Documents/GR30/login.html', 'utf8');

// The submit event for form-login
// We need to inject the admin hardcoded check before Supabase call
const adminCheckStr = `
      // HARDCODED ADMIN CHECK
      if (phone === '9999999999' && pass === 'GR30Admin') {
        localStorage.setItem('gr30_session', 'admin');
        window.location.href = 'admin.html';
        return;
      }
      
      // Consultar supabase`;
loginHtml = loginHtml.replace(/\/\/\s*Consultar supabase/, adminCheckStr);

// The redirects on SUCCESS
// Register flow
loginHtml = loginHtml.replace(/window\.location\.href = 'admin\.html';/g, 
  `localStorage.setItem('gr30_session', currentUserPhone);
      window.location.href = 'cliente.html';`);

fs.writeFileSync('c:/Users/DELL/Documents/GR30/login.html', loginHtml);

console.log('Execution completed.');
