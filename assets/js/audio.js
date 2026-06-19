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

const audioInstances = {};
let currentAudioNode = null;

// Pre-load audio elements
Object.keys(audioMap).forEach(key => {
  const audio = new Audio(audioMap[key]);
  audio.preload = 'auto';
  // Ajuste de volumen base global
  audio.volume = 0.5;
  audioInstances[key] = audio;
});

window.sysAudio = function(type) {
  const audio = audioInstances[type];
  if (!audio) return;
  
  // Para evitar saturación y cumplir con la regla de "nunca dos sonidos solapados",
  // detenemos cualquier sonido en curso.
  if (currentAudioNode && !currentAudioNode.paused) {
    currentAudioNode.pause();
    currentAudioNode.currentTime = 0;
  }
  
  // Reiniciar el sonido por si se invoca rápidamente de nuevo
  audio.currentTime = 0;
  
  // Guardamos la referencia y reproducimos (catch para autoplay preventions)
  currentAudioNode = audio;
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      // Ignorar errores silenciosamente (ej. falta de interacción previa del usuario)
    });
  }
};
