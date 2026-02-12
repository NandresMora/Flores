// ==========================================================================
// 14 de Febrero | Interacciones
// - Control de música (fade-in) + Explosión de corazones
// - Animaciones simples al hacer scroll
// - Lluvia de girasoles y lirios
// ==========================================================================

const audio = document.getElementById("bgAudio");
const toggleButton = document.getElementById("toggleMusic");
const revealItems = document.querySelectorAll(".reveal");
const petalStream = document.querySelector(".petal-stream");

const AUDIO_TARGET_VOLUME = 0.15;

// --- Función de Explosión de Corazones ---
const createHeartExplosion = (element) => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Crear 15 corazones
  for (let i = 0; i < 15; i++) {
    const heart = document.createElement('span');
    heart.innerHTML = '❤️';
    heart.className = 'heart-particle';
    document.body.appendChild(heart);

    // Calcular dirección aleatoria hacia afuera
    const angle = Math.random() * Math.PI * 2;
    const velocity = 50 + Math.random() * 100; // Distancia
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    heart.style.left = `${centerX}px`;
    heart.style.top = `${centerY}px`;
    heart.style.setProperty('--tx', `${tx}px`);
    heart.style.setProperty('--ty', `${ty}px`);

    // Eliminar elemento después de la animación
    heart.addEventListener('animationend', () => heart.remove());
  }
};

const fadeInAudio = (targetVolume = AUDIO_TARGET_VOLUME, duration = 3000) => {
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

  // Llamamos a la explosión de corazones en cada clic
  if (toggleButton) {
    createHeartExplosion(toggleButton);
  }

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
    toggleButton.textContent = "❤️ Reproducir música";
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
  const rotation = (Math.random() * 360).toFixed(0);
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

// ==========================================================================
// Efecto Máquina de Escribir (Mejorado: Cursor se elimina al terminar)
// ==========================================================================
const typeWriterEffect = (element, speed = 100) => {
  const text = element.getAttribute("data-text");
  if (!text) return;
  
  element.innerHTML = "";
  let i = 0;
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      // Texto terminado: Añadimos cursor brevemente
      const cursor = document.createElement("span");
      cursor.innerHTML = "|";
      cursor.style.animation = "blink 1s infinite";
      cursor.className = "cursor-blink";
      element.appendChild(cursor);
      
      // Eliminamos el cursor después de 500ms para que no quede parpadeando
      setTimeout(() => {
        cursor.remove();
      }, 500);
    }
  }
  type();
};

const initPage = () => {
  if (toggleButton) {
    toggleButton.addEventListener("click", toggleMusic);
  }

  if (revealItems.length > 0) {
    initScrollReveal();
  }
  
  const heroTitle = document.querySelector(".hero__title");
  if (heroTitle) {
    // Pequeño delay para esperar la animación de entrada
    setTimeout(() => typeWriterEffect(heroTitle), 500);
  }

  initPetals();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}

// ==========================================================================
// Lógica del Lightbox (Visor de fotos)
// ==========================================================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.lightbox__close');

// Solo ejecutar si existen los elementos (por si no agregaste el HTML del lightbox aun)
if (lightbox && lightboxImg) {
  // Abrir Lightbox
  document.querySelectorAll('.gallery__item img').forEach(img => {
    img.addEventListener('click', () => {
      lightbox.classList.add('active');
      lightboxImg.src = img.src;
    });
  });

  // Cerrar Lightbox
  const closeLightbox = () => lightbox.classList.remove('active');

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}