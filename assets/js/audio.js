const audioMap = {
  click: 'assets/audio/click1.wav',
  success: 'assets/audio/switch33.wav',
  error: 'assets/audio/switch14.wav',
  modalOpen: 'assets/audio/switch1.wav',
  modalClose: 'assets/audio/switch2.wav',
  increment: 'assets/audio/rollover1.wav',
  decrement: 'assets/audio/rollover2.wav',
  notification: 'assets/audio/rollover6.wav'
};

const audioBuffers = {};
let audioCtx = null;
let audioUnlocked = false;
let currentSource = null;

function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
}

// Desbloquear AudioContext en la primera interacción (crítico para iOS/Android)
function unlockAudioContext() {
  if (audioUnlocked) return;
  initAudioContext();
  if (!audioCtx) return;
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  // Reproducir un buffer vacío instantáneamente para "engañar" al navegador y desbloquear el contexto
  const buffer = audioCtx.createBuffer(1, 1, 22050);
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start(0);
  
  audioUnlocked = true;
  
  // Limpiar listeners una vez desbloqueado
  document.removeEventListener('touchstart', unlockAudioContext, true);
  document.removeEventListener('touchend', unlockAudioContext, true);
  document.removeEventListener('click', unlockAudioContext, true);
}

// Adjuntar eventos de desbloqueo en fase de captura para que se ejecuten antes que cualquier otra cosa
document.addEventListener('touchstart', unlockAudioContext, { once: true, capture: true });
document.addEventListener('touchend', unlockAudioContext, { once: true, capture: true });
document.addEventListener('click', unlockAudioContext, { once: true, capture: true });

// Precargar audios en buffers
async function loadAudio(key, url) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    initAudioContext();
    if (!audioCtx) return;
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    audioBuffers[key] = audioBuffer;
  } catch (e) {
    console.warn(`No se pudo cargar el audio ${key}:`, e);
  }
}

Object.keys(audioMap).forEach(key => {
  loadAudio(key, audioMap[key]);
});

window.sysAudio = function(type) {
  if (!audioCtx) initAudioContext();
  if (!audioCtx) return; // Fallback silencioso si no hay soporte Web Audio API
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  
  const buffer = audioBuffers[type];
  if (!buffer) return;
  
  // Detener el sonido anterior si existe para evitar solapamiento (tu regla de "nunca dos sonidos")
  if (currentSource) {
    try {
      currentSource.stop();
    } catch(e) {}
  }
  
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.5; // Ajuste de volumen base global
  
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  source.start(0);
  currentSource = source;
};

// Delegación global de eventos de audio para asegurar 100% de consistencia
document.addEventListener('click', function(e) {
  if (!e.isTrusted) return; // Ignore synthetic events
  
  // Find the closest interactive element
  const target = e.target.closest('a, button, summary, input[type="submit"], input[type="checkbox"], input[type="radio"], select');
  
  if (target) {
    if (target.dataset.sysAudioIgnore === "true") return;
    
    // Some buttons specify custom sounds, like '+' or '-'
    const audioType = target.dataset.sysAudio || 'click';
    if (window.sysAudio) window.sysAudio(audioType);
  }
});
