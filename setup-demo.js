const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ibslnogitgwtyeyxfscw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_G43BK4zraE7IZ-HrQoL0oA_NVo2QLoL';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log("Iniciando purgado de la base de datos...");
  
  // 1. Borrar pagos
  const { error: errPagos } = await supabase.from('pagos').delete().neq('id', 0);
  if (errPagos) console.error("Error borrando pagos:", errPagos);
  else console.log("Pagos eliminados.");

  // 2. Borrar miembros
  const { error: errMiembros } = await supabase.from('miembros').delete().neq('id', 0);
  if (errMiembros) console.error("Error borrando miembros:", errMiembros);
  else console.log("Miembros eliminados.");

  console.log("Inyectando miembros de demostración...");

  const dummyMembers = [
    { nombre: 'Héctor Miguel Velázquez', telefono: '5511223344', plan: 'Anual', password: '123', activo: true },
    { nombre: 'Valeria Gómez Ruiz', telefono: '5522334455', plan: 'Mensual', password: '123', activo: true },
    { nombre: 'Ricardo Tamez', telefono: '5533445566', plan: 'Mensual', password: '123', activo: true },
    { nombre: 'Ana Karen Silva', telefono: '5544556677', plan: 'Mensual', password: '123', activo: true },
    { nombre: 'Luis Fernando Castro', telefono: '5555667788', plan: 'Visita Diaria', password: '123', activo: true },
    { nombre: 'Mónica de la Garza', telefono: '5566778899', plan: 'Anual', password: '123', activo: true },
    { nombre: 'Jorge Alberto Soto', telefono: '5577889900', plan: 'Mensual', password: '123', activo: false }, // Suspendido manualmente
    { nombre: 'Diego Herrera', telefono: '5588990011', plan: 'Mensual', password: '123', activo: true }
  ];

  const { data: insertedMembers, error: insertErr } = await supabase
    .from('miembros')
    .insert(dummyMembers)
    .select();

  if (insertErr) {
    console.error("Error insertando miembros:", insertErr);
    return;
  }
  
  console.log(`Se insertaron ${insertedMembers.length} miembros ficticios.`);

  // Generar fechas
  const hoy = new Date();
  const hace10Dias = new Date(hoy); hace10Dias.setDate(hoy.getDate() - 10);
  const hace40Dias = new Date(hoy); hace40Dias.setDate(hoy.getDate() - 40);

  const formatFecha = (d) => d.toISOString().split('T')[0];

  const pagosData = [
    // Héctor (Anual, pagó hace 10 días -> Al día)
    { miembro_id: insertedMembers.find(m => m.nombre === 'Héctor Miguel Velázquez').id, monto: 5990, metodo: 'Tarjeta', fecha: formatFecha(hace10Dias) },
    // Valeria (Mensual, pagó hace 10 días -> Al día)
    { miembro_id: insertedMembers.find(m => m.nombre === 'Valeria Gómez Ruiz').id, monto: 650, metodo: 'Efectivo', fecha: formatFecha(hace10Dias) },
    // Ricardo (Mensual, pagó hace 40 días -> Atrasado)
    { miembro_id: insertedMembers.find(m => m.nombre === 'Ricardo Tamez').id, monto: 650, metodo: 'Transferencia', fecha: formatFecha(hace40Dias) },
    // Ana (Mensual, pagó hace 40 días -> Atrasado)
    { miembro_id: insertedMembers.find(m => m.nombre === 'Ana Karen Silva').id, monto: 650, metodo: 'Tarjeta', fecha: formatFecha(hace40Dias) },
    // Mónica (Anual, pagó hace 40 días -> Al día)
    { miembro_id: insertedMembers.find(m => m.nombre === 'Mónica de la Garza').id, monto: 5990, metodo: 'Efectivo', fecha: formatFecha(hace40Dias) }
  ];

  const { error: pagosErr } = await supabase.from('pagos').insert(pagosData);
  if (pagosErr) console.error("Error insertando pagos:", pagosErr);
  else console.log("Pagos ficticios insertados para generar estados (Al día / Atrasado).");

  console.log("¡Configuración de demostración completada!");
}

run();
