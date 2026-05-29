const fs = require('fs');
let code = fs.readFileSync('c:/Users/DELL/Documents/GR30/assets/js/admin.js', 'utf8');

// Replace the hardcoded arrays with empty arrays
code = code.replace(/let staffData = \[[\s\S]*?\];/, 'let staffData = [];');
code = code.replace(/let membersData = \[[\s\S]*?\];/, 'let membersData = [];');
code = code.replace(/let planesData = \[[\s\S]*?\];/, 'let planesData = [];');

// Import supabase at top
code = "import { supabase } from './supabase.js';\n\n" + code;

// We need an initData function
const initDataFunc = `
async function fetchData() {
  const { data: staff } = await supabase.from('staff').select('*');
  const { data: planes } = await supabase.from('planes').select('*');
  const { data: miembros } = await supabase.from('miembros').select('*');
  const { data: pagos } = await supabase.from('pagos').select('*');
  
  if (staff) staffData = staff;
  if (planes) planesData = planes;
  
  if (miembros) {
    membersData = miembros.map(m => {
      const historial = pagos ? pagos.filter(p => p.miembro_id === m.id).sort((a,b) => new Date(b.fecha) - new Date(a.fecha)) : [];
      return { ...m, historialPagos: historial };
    });
  }
  
  renderAll();
}

fetchData();
`;

// Insert the fetchData function right before setScreen('dashboard');
code = code.replace("setScreen('dashboard');", "setScreen('dashboard');\n" + initDataFunc);

// Modify saveStaff
code = code.replace(/function saveStaff\(e\) \{[\s\S]*?renderAll\(\);\n\}/, `
async function saveStaff(e) {
  e.preventDefault();
  const nombre = document.getElementById('sf-nombre').value;
  const especialidad = document.getElementById('sf-esp').value;
  const turno = document.getElementById('sf-turno').value;
  const avatar = getInitials(nombre);

  if (!currentModalId) {
    const { error } = await supabase.from('staff').insert([{ avatar, nombre, especialidad, turno }]);
    if (!error) showToast('STAFF AÑADIDO CON ÉXITO');
  } else {
    const { error } = await supabase.from('staff').update({ nombre, especialidad, turno }).eq('id', currentModalId);
    if (!error) showToast('STAFF ACTUALIZADO');
  }
  closeModal();
  await fetchData();
}
`);

// Modify deleteStaff
code = code.replace(/function deleteStaff\(id\) \{[\s\S]*?renderAll\(\);\n  \}\);\n\}/, `
function deleteStaff(id) {
  sysModal('confirm', 'ELIMINAR STAFF', '¿ESTÁS SEGURO DE ELIMINAR ESTE REGISTRO?').then(async confirmed => {
    if (!confirmed) return;
    await supabase.from('staff').delete().eq('id', id);
    showToast('REGISTRO ELIMINADO');
    await fetchData();
  });
}
`);

// Modify saveMember
code = code.replace(/function saveMember\(e\) \{[\s\S]*?renderAll\(\);\n\}/, `
async function saveMember(e) {
  e.preventDefault();
  const nombre = document.getElementById('mf-nombre').value;
  const telefono = document.getElementById('mf-tel').value;
  const plan = document.getElementById('mf-plan').value;
  const activo = document.getElementById('mf-estado').value === "1";

  if (!currentModalId) {
    const { error } = await supabase.from('miembros').insert([{ nombre, telefono, plan, activo, estado_pago: 'pendiente' }]);
    if (error) { sysModal('error', 'ERROR', error.message); return; }
    showToast('MIEMBRO AÑADIDO CON ÉXITO');
  } else {
    const { error } = await supabase.from('miembros').update({ nombre, telefono, plan, activo }).eq('id', currentModalId);
    if (error) { sysModal('error', 'ERROR', error.message); return; }
    showToast('MIEMBRO ACTUALIZADO');
  }
  closeModal();
  await fetchData();
}
`);

// Modify deleteMember
code = code.replace(/function deleteMember\(id\) \{[\s\S]*?renderAll\(\);\n  \}\);\n\}/, `
function deleteMember(id) {
  sysModal('confirm', 'ELIMINAR MIEMBRO', '¿ESTÁS SEGURO DE ELIMINAR ESTE MIEMBRO?').then(async confirmed => {
    if (!confirmed) return;
    await supabase.from('miembros').delete().eq('id', id);
    showToast('MIEMBRO ELIMINADO');
    await fetchData();
  });
}
`);

// Modify savePlan
code = code.replace(/function savePlan\(e\) \{[\s\S]*?renderAll\(\);\n\}/, `
async function savePlan(e) {
  e.preventDefault();
  const nombre = document.getElementById('pf-nombre').value;
  const precio = document.getElementById('pf-precio').value;
  const periodo = document.getElementById('pf-periodo').value;
  const destacado = document.getElementById('pf-destacado').checked;
  const benLines = document.getElementById('pf-beneficios').value.split('\\n').map(l => l.trim()).filter(l => l);

  if (!currentModalId) {
    await supabase.from('planes').insert([{ nombre, precio, periodo, destacado, beneficios: benLines }]);
    showToast('PLAN CREADO CON ÉXITO');
  } else {
    await supabase.from('planes').update({ nombre, precio, periodo, destacado, beneficios: benLines }).eq('id', currentModalId);
    showToast('PLAN ACTUALIZADO');
  }
  closeModal();
  await fetchData();
}
`);

// Modify deletePlan
code = code.replace(/function deletePlan\(id\) \{[\s\S]*?renderAll\(\);\n  \}\);\n\}/, `
function deletePlan(id) {
  sysModal('confirm', 'ELIMINAR PLAN', '¿ESTÁS SEGURO DE ELIMINAR ESTE PLAN?').then(async confirmed => {
    if (!confirmed) return;
    await supabase.from('planes').delete().eq('id', id);
    showToast('PLAN ELIMINADO CON ÉXITO');
    closeModal();
    await fetchData();
  });
}
`);

// Modify processPago
code = code.replace(/function processPago\(e\) \{[\s\S]*?renderAll\(\);\n\}/, `
async function processPago(e) {
  e.preventDefault();
  const m = membersData.find(x => x.id === currentModalId);
  const metodo = document.getElementById('pago-metodo').value;
  const planInfo = planesData.find(p => p.nombre === m.plan) || { precio: '$0' };
  
  const monto = parseInt(planInfo.precio.replace(/\\D/g,'')) || 0;
  const hoy = new Date().toISOString().split('T')[0];
  
  await supabase.from('pagos').insert([{ miembro_id: currentModalId, fecha: hoy, monto, metodo }]);
  
  let nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  await supabase.from('miembros').update({ estado_pago: 'al_dia', fecha_vencimiento: nextMonth.toISOString().split('T')[0] }).eq('id', currentModalId);

  showToast('PAGO REGISTRADO CON ÉXITO');
  closeModal();
  await fetchData();
}
`);

// Modify revertPago
code = code.replace(/function revertPago\(memberId, pagoId\) \{[\s\S]*?renderAll\(\);\n  \}\);\n\}/, `
function revertPago(memberId, pagoId) {
  sysModal('confirm', 'REVERTIR PAGO', '¿ESTÁS SEGURO DE REVERTIR ESTE PAGO? ESTA ACCIÓN NO SE PUEDE DESHACER.').then(async confirmed => {
    if (!confirmed) return;
    await supabase.from('pagos').delete().eq('id', pagoId);
    await supabase.from('miembros').update({ estado_pago: 'atrasado' }).eq('id', memberId);
    showToast('PAGO REVERTIDO');
    await fetchData();
    openHistorial(memberId);
  });
}
`);

const bindToWindow = "\n\nwindow.setScreen = setScreen;\nwindow.openModal = openModal;\nwindow.closeModal = closeModal;\nwindow.saveStaff = saveStaff;\nwindow.deleteStaff = deleteStaff;\nwindow.saveMember = saveMember;\nwindow.deleteMember = deleteMember;\nwindow.savePlan = savePlan;\nwindow.deletePlan = deletePlan;\nwindow.openPagoForm = openPagoForm;\nwindow.processPago = processPago;\nwindow.openHistorial = openHistorial;\nwindow.revertPago = revertPago;\n";

code += bindToWindow;

fs.writeFileSync('c:/Users/DELL/Documents/GR30/assets/js/admin.js', code);
console.log("admin.js refactored successfully");
