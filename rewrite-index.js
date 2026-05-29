const fs = require('fs');
let html = fs.readFileSync('c:/Users/DELL/Documents/GR30/index.html', 'utf8');

// Clear Staff container content and add ID
html = html.replace(/<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">[\s\S]*?<\/section>/, 
`<div id="staff-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- Dynamic Staff -->
    </div>
  </section>`);

// Clear Planes container content and add ID
html = html.replace(/<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">[\s\S]*?<\/section>/,
`<div id="planes-container" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Dynamic Planes -->
    </div>
  </section>`);

// Append script to fetch data
const scriptStr = `
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script type="module">
    import { supabase } from './assets/js/supabase.js';

    async function loadData() {
      const { data: staff } = await supabase.from('staff').select('*');
      if (staff) {
        document.getElementById('staff-container').innerHTML = staff.map(s => \`
          <div class="staff-card trainer-card">
            <div class="staff-card-img">
              \${s.imagen ? \`<img src="\${s.imagen}" alt="\${s.nombre}" loading="lazy" decoding="async">\` : \`<div class="w-full h-full bg-brand-green flex items-center justify-center font-display font-bold text-6xl text-brand-black uppercase">\${s.avatar}</div>\`}
            </div>
            <div class="staff-card-body">
              <div>
                <h3 class="text-3xl font-display font-bold uppercase mb-1">\${s.nombre}</h3>
                <p class="font-bold text-xs tracking-widest uppercase bg-brand-black text-brand-white inline-block px-2 py-1 mb-4">\${s.especialidad}</p>
              </div>
              <p class="font-medium text-lg leading-snug">Turno: \${s.turno}</p>
            </div>
          </div>
        \`).join('');
      }

      const { data: planes } = await supabase.from('planes').select('*');
      if (planes) {
        document.getElementById('planes-container').innerHTML = planes.map(p => {
          const bgCls = p.destacado ? 'bg-brand-green text-brand-black border-4 border-brand-green' : 'bg-brand-white text-brand-black border-4 border-brand-black';
          const priceHTML = p.destacado 
            ? \`<p class="text-5xl sm:text-6xl font-display font-bold mb-6 text-brand-black group-hover:text-brand-green group-focus:text-brand-green group-active:text-brand-green tracking-tighter break-all">\${p.precio}<span class="text-xl sm:text-2xl text-current tracking-normal">mxn</span></p>\`
            : \`<p class="text-5xl sm:text-6xl font-display font-bold mb-6 bg-brand-green text-brand-black inline-block px-3 py-1 tracking-tighter -ml-3 break-all">\${p.precio}<span class="text-xl sm:text-2xl text-current tracking-normal">mxn</span></p>\`;
            
          const bulletCls = p.destacado 
            ? 'text-brand-black group-hover:text-brand-green group-focus:text-brand-green group-active:text-brand-green font-bold'
            : 'text-brand-black group-hover:text-brand-white group-focus:text-brand-white group-active:text-brand-white font-bold';

          const btnCls = "w-full px-8 py-4 text-center bg-brand-black text-brand-white group-hover:bg-brand-white group-hover:text-brand-black group-focus:bg-brand-white group-focus:text-brand-black group-active:bg-brand-white group-active:text-brand-black hover:!bg-brand-green hover:!text-brand-black focus:!bg-brand-green focus:!text-brand-black focus:outline-none active:!bg-brand-green active:!text-brand-black transition-colors font-display font-bold uppercase tracking-widest text-sm";

          return \`
            <div tabindex="0" class="\${bgCls} p-8 sm:p-12 flex flex-col justify-between group hover:bg-brand-black hover:text-brand-white focus:bg-brand-black focus:text-brand-white active:bg-brand-black active:text-brand-white transition-colors cursor-pointer">
              <div>
                <h3 class="text-3xl font-display font-bold uppercase mb-2">\${p.nombre}</h3>
                \${priceHTML}
                <ul class="space-y-6 font-medium mb-8 text-lg">
                  \${(p.beneficios || []).map(b => \`<li class="flex gap-4 items-start"><i class="ph-bold ph-check text-xl mt-1 \${bulletCls}"></i> \${b}</li>\`).join('')}
                </ul>
              </div>
              <a href="#contacto" class="\${btnCls}">Elegir Plan</a>
            </div>
          \`;
        }).join('');
      }
    }
    loadData();
  </script>
</body>`;

html = html.replace('</body>', scriptStr);
fs.writeFileSync('c:/Users/DELL/Documents/GR30/index.html', html);
console.log("index.html refactored");
