const urlMiembros = 'https://ibslnogitgwtyeyxfscw.supabase.co/rest/v1/miembros';
const urlPagos = 'https://ibslnogitgwtyeyxfscw.supabase.co/rest/v1/pagos';
const key = 'sb_publishable_G43BK4zraE7IZ-HrQoL0oA_NVo2QLoL';

async function run() {
  // Check if member already exists
  const checkRes = await fetch(`${urlMiembros}?telefono=eq.1111111111`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const checkData = await checkRes.json();
  let memberId;

  if (checkData && checkData.length > 0) {
    memberId = checkData[0].id;
    console.log('Member already exists, id:', memberId);
  } else {
    const res = await fetch(urlMiembros, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        nombre: 'David P.',
        telefono: '1111111111',
        password: 'GR30Client',
        biometria: {fake: true},
        plan: 'Mensual',
        estado_pago: 'atrasado',
        activo: true
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      memberId = data[0].id;
      console.log('Inserted member, id:', memberId);
    } else {
      console.error('Failed to insert member:', await res.text());
      return;
    }
  }

  // Insert fake payments
  const pagosRes = await fetch(`${urlPagos}?miembro_id=eq.${memberId}`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const pagosData = await pagosRes.json();
  
  if (!pagosData || pagosData.length === 0) {
    const pagosToInsert = [
      { miembro_id: memberId, fecha: '2026-03-26', monto: 450, metodo: 'Tarjeta' },
      { miembro_id: memberId, fecha: '2026-04-26', monto: 450, metodo: 'Efectivo' }
    ];
    const pres = await fetch(urlPagos, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(pagosToInsert)
    });
    console.log('Inserted payments status:', pres.status);
  } else {
    console.log('Payments already exist');
  }
}

run();
