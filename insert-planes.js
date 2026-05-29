const url = 'https://ibslnogitgwtyeyxfscw.supabase.co/rest/v1/planes';
const key = 'sb_publishable_G43BK4zraE7IZ-HrQoL0oA_NVo2QLoL';

const planesData = [
  { nombre: 'Visita Diaria', precio: '$70', periodo: 'Unico', destacado: false, beneficios: ['Acceso total a pesas y cardio', 'Uso de regaderas'] },
  { nombre: 'Mensual', precio: '$450', periodo: 'Mes', destacado: true, beneficios: ['Acceso 100% ilimitado', 'Asesoría en rutina', 'Clases de Zumba incluidas'] },
  { nombre: 'Anual', precio: '$4,500', periodo: 'Año', destacado: false, beneficios: ['Todos los beneficios mensuales', 'Ahorras 2 meses completos', 'Congelamiento de tarifa'] }
];

async function run() {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(planesData)
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text);
}

run();
