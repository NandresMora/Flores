// ==========================================================================
// 14 de Febrero | Interacciones
// - Control de música (fade-in)
// - Animaciones simples al hacer scroll
// - Lluvia de girasoles y lirios
// ==========================================================================

const audio = document.getElementById("bgAudio");
const toggleButton = document.getElementById("toggleMusic");
const revealItems = document.querySelectorAll(".reveal");
const petalStream = document.querySelector(".petal-stream");

const AUDIO_TARGET_VOLUME = 0.18;

const fadeInAudio = (targetVolume = AUDIO_TARGET_VOLUME, duration = 1600) => {
  if (!audio) return;
  const startTime = performance.now();
  const initialVolume = 0;

  audio.volume = initialVolume;

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    audio.volume = initialVolume + (targetVolume - initialVolume) * progress;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

const toggleMusic = async () => {
  if (!audio) return;

  if (audio.paused) {
    try {
      await audio.play();
      fadeInAudio();
      toggleButton.textContent = "Pausar música";
      toggleButton.setAttribute("aria-pressed", "true");
    } catch (error) {
      console.warn("No se pudo reproducir el audio:", error);
    }
  } else {
    audio.pause();
    toggleButton.textContent = "Reproducir música";
    toggleButton.setAttribute("aria-pressed", "false");
  }
};

const initScrollReveal = () => {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
};

// ==========================================================================
// Lluvia de girasoles y lirios (PNG transparente)
// ==========================================================================

const PETAL_IMAGES = [
  { src: "Imagenes/girasol.png", className: "petal--sunflower" },
  { src: "Imagenes/lirio.png", className: "petal--lily" },
];

const createPetal = (index) => {
  if (!petalStream) {
    console.error("⚠️ No se encontró .petal-stream en el DOM");
    return;
  }

  const petal = document.createElement("img");
  const { src, className } = PETAL_IMAGES[index % PETAL_IMAGES.length];

  const startX = Math.random() * 100;
  const drift = (Math.random() * 16 - 8).toFixed(2);
  const duration = (12 + Math.random() * 8).toFixed(2);
  const rotation = (Math.random() * 360).toFixed(0); // Mejor rango de rotación
  const delay = (Math.random() * duration).toFixed(2);

  petal.src = src;
  petal.alt = "";
  petal.className = `petal ${className}`;
  
  // Asignar todas las propiedades CSS
  petal.style.left = `${startX}vw`;
  petal.style.setProperty("--x-start", `0vw`);
  petal.style.setProperty("--x-end", `${parseFloat(drift)}vw`);
  petal.style.setProperty("--rotation", `${rotation}deg`);
  petal.style.animationDuration = `${duration}s`;
  petal.style.animationDelay = `-${delay}s`;

  petal.addEventListener("animationend", () => {
    petal.remove();
  });

  petalStream.appendChild(petal);
  
  // Debug
  console.log("🌸 Pétalo creado:", { startX, drift, duration, rotation });
};
let petalTimer = null;

const initPetals = () => {
  if (!petalStream) return;
  const isMobile = window.innerWidth < 720;
  const burst = isMobile ? 4 : 6;
  const interval = isMobile ? 900 : 650;
  const maxPetals = isMobile ? 14 : 24;

  for (let i = 0; i < burst; i += 1) {
    createPetal(i);
  }

  petalTimer = window.setInterval(() => {
    if (petalStream.children.length > maxPetals) return;
    createPetal(Math.floor(Math.random() * 1000));
  }, interval);
};

const initPage = () => {
  if (toggleButton) {
    toggleButton.addEventListener("click", toggleMusic);
  }

  if (revealItems.length > 0) {
    initScrollReveal();
  }

  initPetals();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}
