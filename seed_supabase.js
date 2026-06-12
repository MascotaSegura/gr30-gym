const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ibslnogitgwtyeyxfscw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_G43BK4zraE7IZ-HrQoL0oA_NVo2QLoL';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

async function seed() {
  console.log("Iniciando reseteo de base de datos...");

  console.log("Limpiando pagos...");
  await supabase.from('pagos').delete().neq('id', 0);
  console.log("Limpiando miembros...");
  await supabase.from('miembros').delete().neq('id', 0);
  console.log("Limpiando staff...");
  await supabase.from('staff').delete().neq('id', 0);
  console.log("Limpiando planes...");
  await supabase.from('planes').delete().neq('id', 0);

  console.log("Insertando planes...");
  const planes = [
    { nombre: 'Mensualidad Básica', precio: 500, periodo: 'Mes', destacado: false, beneficios: ['Acceso área de pesas', 'Cardio ilimitado', 'Uso de regaderas'] },
    { nombre: 'Anualidad Elite', precio: 4500, periodo: 'Año', destacado: true, beneficios: ['Acceso total 24/7', 'Todas las clases grupales', 'Nutriólogo mensual', 'Invitado los fines de semana', 'Toalla gratis'] },
    { nombre: 'Semestral Pro', precio: 2600, periodo: 'Mes', destacado: false, beneficios: ['Acceso total', 'Clases grupales', '1 Asesoría de rutinas al mes'] },
    { nombre: 'Day Pass', precio: 150, periodo: 'Día', destacado: false, beneficios: ['Acceso por 24 horas', 'Regaderas y lockers'] },
    { nombre: 'Estudiantes', precio: 350, periodo: 'Mes', destacado: false, beneficios: ['Acceso en horario matutino', 'Cardio y pesas', 'Requiere credencial vigente'] }
  ];
  const { data: insertedPlanes, error: planesErr } = await supabase.from('planes').insert(planes).select();
  if (planesErr) console.error("Error planes:", planesErr);

  console.log("Insertando staff...");
  const staff = [
    { nombre: 'Carlos Mendoza', especialidad: 'Gerente', turno: 'Mañana', avatar: 'CM', imagen: 'assets/img/entrenador-1.webp' },
    { nombre: 'Lucía Fernández', especialidad: 'Recepción', turno: 'Tarde', avatar: 'LF', imagen: 'assets/img/entrenador-2.webp' },
    { nombre: 'Javier "Toro" Silva', especialidad: 'Coach', turno: 'Mixto', avatar: 'JS', imagen: 'assets/img/entrenador-3.webp' },
    { nombre: 'Mariana Ríos', especialidad: 'Coach', turno: 'Tarde', avatar: 'MR', imagen: 'assets/img/entrenador-4.webp' }
  ];
  const { error: staffErr } = await supabase.from('staff').insert(staff);
  if (staffErr) console.error("Error staff:", staffErr);


  console.log("Insertando miembros...");
  const nombresH = ['Alejandro', 'Fernando', 'Roberto', 'Mateo', 'Sebastián', 'Nicolás', 'Hugo', 'Diego', 'Gabriel', 'Tomás', 'Arturo', 'Emilio', 'Oscar', 'Raúl', 'Héctor'];
  const nombresM = ['Sofía', 'Valentina', 'Camila', 'Isabella', 'Valeria', 'Daniela', 'Mariana', 'Renata', 'Natalia', 'Regina', 'Andrea', 'Paola', 'Diana', 'Lorena', 'Carmen'];
  const apellidos = ['García', 'Martínez', 'López', 'González', 'Pérez', 'Rodríguez', 'Sánchez', 'Ramírez', 'Cruz', 'Gómez', 'Flores', 'Morales', 'Vázquez', 'Jiménez', 'Reyes'];
  
  const miembros = [];
  const now = new Date();
  const pastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  for (let i = 0; i < 100; i++) {
    const isMale = Math.random() > 0.5;
    const nameList = isMale ? nombresH : nombresM;
    const nombre = `${nameList[Math.floor(Math.random() * nameList.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;
    const plan = insertedPlanes[Math.floor(Math.random() * 3)]; // Day pass excluded mostly
    
    miembros.push({
      nombre: nombre,
      telefono: '55' + Math.floor(10000000 + Math.random() * 90000000).toString(),
      plan: plan.nombre,
      activo: Math.random() > 0.15,
      password: Math.floor(1000 + Math.random() * 9000).toString()
    });
  }
  const { data: insertedMiembros, error: miemErr } = await supabase.from('miembros').insert(miembros).select();
  if (miemErr) console.error("Error miembros:", miemErr);


  console.log("Insertando pagos...");
  const pagos = [];
  const metodos = ['Efectivo', 'Tarjeta', 'Transferencia'];
  
  if (insertedMiembros) {
    for (const m of insertedMiembros) {
      const plan = insertedPlanes.find(p => p.nombre === m.plan);
      const regDate = randomDate(pastYear, now);
      
      if (plan.periodo === 'Año') {
        pagos.push({
          miembro_id: m.id,
          monto: plan.precio,
          fecha: regDate.toISOString(),
          metodo: metodos[Math.floor(Math.random() * metodos.length)]
        });
      } else if (plan.periodo === 'Mes') {
        let currentPayDate = new Date(regDate);
        while (currentPayDate <= now) {
          pagos.push({
            miembro_id: m.id,
            monto: plan.precio,
            fecha: currentPayDate.toISOString(),
            metodo: metodos[Math.floor(Math.random() * metodos.length)]
          });
          currentPayDate.setMonth(currentPayDate.getMonth() + 1);
          currentPayDate.setDate(currentPayDate.getDate() + Math.floor(Math.random() * 5));
        }
        if (!m.activo && Math.random() > 0.5) {
          pagos.pop();
        }
      }
    }
    
    for (let i = 0; i < 80; i++) {
      const randomMember = insertedMiembros[Math.floor(Math.random() * insertedMiembros.length)];
      pagos.push({
        miembro_id: randomMember.id,
        monto: Math.floor(Math.random() * 100) + 20,
        fecha: randomDate(pastYear, now).toISOString(),
        metodo: 'Efectivo'
      });
    }
    
    for(let i=0; i<pagos.length; i+=50) {
        const { error: pagoErr } = await supabase.from('pagos').insert(pagos.slice(i, i+50));
        if (pagoErr) console.error("Error pagos:", pagoErr);
    }
  }

  console.log("¡Base de datos reseteada y poblada con éxito!");
}

seed().catch(console.error);
