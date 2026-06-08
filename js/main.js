(() => {
  "use strict";

  const body = document.body;
  const loader = document.querySelector("#loader");
  const header = document.querySelector("#siteHeader");
  const scrollProgress = document.querySelector("#scrollProgress");
  const navToggle = document.querySelector("#navToggle");
  const navLinks = document.querySelector("#navLinks");
  const navItems = document.querySelectorAll(".nav-links a");
  const rainLayer = document.querySelector("#rainLayer");
  const goldParticles = document.querySelector("#goldParticles");
  const loaderParticles = document.querySelector("#loaderParticles");
  const lightning = document.querySelector("#lightning");
  const hero = document.querySelector(".hero");
  const shieldPanel = document.querySelector("#shieldPanel");
  const shieldHallPanel = document.querySelector("#shieldHallPanel");
  const quoteText = document.querySelector("#quoteText");
  const quoteCarousel = document.querySelector(".quote-carousel");
  const rainAudio = document.querySelector("#rainAudio");
  const year = document.querySelector("#year");
  const audioPlayer = document.querySelector(".audio-player");
  const audioToggle = document.querySelector("#audioToggle");
  const audioButtons = document.querySelectorAll(".audio-option");
  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightboxImage");
  const lightboxCaption = document.querySelector("#lightboxCaption");
  const lightboxClose = document.querySelector("#lightboxClose");

  let audioContext;
  let epicGain;
  let epicOscillators = [];
  let currentAudioMode = "silent";
  let currentAmbientProfile = "hero";
  let rafPending = false;

  const ambientProfiles = {
    hero: { gain: 0.05, frequencies: [110, 165, 220] },
    history: { gain: 0.024, frequencies: [98, 147, 196] },
    shield: { gain: 0.04, frequencies: [73, 110, 146] },
    legacy: { gain: 0.045, frequencies: [130, 196, 261] }
  };

  body.classList.add("is-loading");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const createRain = () => {
    if (!rainLayer) return;

    const amount = window.matchMedia("(max-width: 620px)").matches ? 150 : 260;
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < amount; index += 1) {
      const drop = document.createElement("span");
      drop.className = "drop";
      drop.style.left = `${Math.random() * 100}vw`;
      drop.style.height = `${38 + Math.random() * 92}px`;
      drop.style.opacity = `${0.16 + Math.random() * 0.54}`;
      drop.style.animationDuration = `${0.45 + Math.random() * 0.85}s`;
      drop.style.animationDelay = `${Math.random() * 2.5}s`;
      fragment.appendChild(drop);
    }

    rainLayer.appendChild(fragment);
  };

  const createParticles = (target, amount, className = "gold-dot") => {
    if (!target) return;

    const fragment = document.createDocumentFragment();

    for (let index = 0; index < amount; index += 1) {
      const dot = document.createElement("span");
      dot.className = className;
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 100}%`;
      dot.style.animationDuration = `${4 + Math.random() * 7}s`;
      dot.style.animationDelay = `${Math.random() * 4}s`;
      fragment.appendChild(dot);
    }

    target.appendChild(fragment);
  };

  const hideLoader = () => {
    loader?.classList.add("is-hidden");
    body.classList.remove("is-loading");
    setTimeout(() => loader?.remove(), 800);
  };

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  const updateScrollState = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;

    if (scrollProgress) {
      scrollProgress.style.transform = `scaleX(${progress})`;
    }

    let activeId = "inicio";
    document.querySelectorAll("main section[id]").forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.38 && rect.bottom >= window.innerHeight * 0.28) {
        activeId = section.id;
      }
    });

    const navActiveId = activeId === "sala-escudo" ? "escudo" : activeId;

    navItems.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${navActiveId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const closeMenu = () => {
    navLinks?.classList.remove("is-open");
    header?.classList.remove("is-open");
    body.classList.remove("nav-open");
    navToggle?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  };

  const setupReveal = () => {
    const nodes = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.16 }
    );

    nodes.forEach((node) => observer.observe(node));
  };

  const parallax = () => {
    if (rafPending) return;
    rafPending = true;
    window.requestAnimationFrame(() => {
      if (hero) {
        hero.style.backgroundPosition = `center ${window.scrollY * 0.08}px`;
      }
      rafPending = false;
    });
  };

  const triggerLightning = () => {
    if (!lightning) return;

    lightning.style.opacity = "0.34";
    setTimeout(() => {
      lightning.style.opacity = "0";
    }, 90);
    setTimeout(() => {
      lightning.style.opacity = "0.16";
      setTimeout(() => {
        lightning.style.opacity = "0";
      }, 70);
    }, 170);

    window.setTimeout(triggerLightning, 6000 + Math.random() * 12000);
  };

  const setupShieldTilt = () => {
    const panels = [
      { node: shieldPanel, xVar: "--mx", yVar: "--my", resetY: "28%" },
      { node: shieldHallPanel, xVar: "--hall-x", yVar: "--hall-y", resetY: "34%" }
    ];

    panels.forEach(({ node, xVar, yVar, resetY }) => {
      if (!node) return;

      node.addEventListener("pointermove", (event) => {
        const rect = node.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        const rotateY = (x - 50) / 22;
        const rotateX = (50 - y) / 26;

        node.style.setProperty(xVar, `${x}%`);
        node.style.setProperty(yVar, `${y}%`);
        node.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      node.addEventListener("pointerleave", () => {
        node.style.transform = "";
        node.style.setProperty(xVar, "50%");
        node.style.setProperty(yVar, resetY);
      });
    });
  };

  const setupHeroLight = () => {
    if (!hero) return;

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty("--hero-x", `${x}%`);
      hero.style.setProperty("--hero-y", `${y}%`);
    });

    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--hero-x", "50%");
      hero.style.setProperty("--hero-y", "34%");
    });
  };

  const setupQuotes = () => {
    if (!quoteText || !quoteCarousel) return;

    const quotes = [
      '"No es el nombre quien crea la grandeza."',
      '"La sabiduría es la forma más elevada del poder."',
      '"Todo legado comienza con una decisión."',
      '"El liderazgo auténtico nace del ejemplo."'
    ];
    let index = 0;

    window.setInterval(() => {
      quoteCarousel.classList.add("is-changing");
      window.setTimeout(() => {
        index = (index + 1) % quotes.length;
        quoteText.textContent = quotes[index];
        quoteCarousel.classList.remove("is-changing");
      }, 360);
    }, 4500);
  };

  const stopRain = () => {
    if (!rainAudio) return;
    rainAudio.pause();
    rainAudio.currentTime = 0;
  };

  const applyAmbientProfile = (profileName) => {
    currentAmbientProfile = profileName;
    if (!audioContext || !epicGain || epicOscillators.length === 0) return;

    const profile = ambientProfiles[profileName] || ambientProfiles.hero;
    const now = audioContext.currentTime;
    epicGain.gain.cancelScheduledValues(now);
    epicGain.gain.setTargetAtTime(profile.gain, now, 1.2);

    epicOscillators.forEach((oscillator, index) => {
      const frequency = profile.frequencies[index] || profile.frequencies[0];
      oscillator.frequency.cancelScheduledValues(now);
      oscillator.frequency.setTargetAtTime(frequency, now, 1.4);
    });
  };

  const stopEpic = () => {
    epicOscillators.forEach((oscillator) => oscillator.stop());
    epicOscillators = [];

    if (epicGain) {
      epicGain.disconnect();
      epicGain = null;
    }
  };

  const startEpic = async () => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    audioContext ||= new AudioContextCtor();
    await audioContext.resume();

    stopEpic();
    epicGain = audioContext.createGain();
    epicGain.gain.value = 0;
    epicGain.connect(audioContext.destination);

    [110, 165, 220].forEach((frequency) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(epicGain);
      oscillator.start();
      epicOscillators.push(oscillator);
    });

    applyAmbientProfile(currentAmbientProfile);
  };

  const setAudioMode = async (mode) => {
    currentAudioMode = mode;
    audioButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.audio === mode));
    stopRain();
    stopEpic();

    if (mode === "rain" && rainAudio) {
      rainAudio.volume = 0.36;
      await rainAudio.play().catch(() => undefined);
    }

    if (mode === "epic" && (window.AudioContext || window.webkitAudioContext)) {
      await startEpic().catch(() => undefined);
    }
  };

  const setupAmbientSections = () => {
    const targets = [
      { selector: "#inicio", profile: "hero" },
      { selector: "#historia", profile: "history" },
      { selector: "#escudo", profile: "shield" },
      { selector: "#sala-escudo", profile: "shield" },
      { selector: "#legado", profile: "legacy" },
      { selector: "#contacto", profile: "legacy" }
    ];

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const match = targets.find((target) => entry.target.matches(target.selector));
          if (!match) return;
          applyAmbientProfile(match.profile);
        });
      },
      { threshold: 0.45 }
    );

    targets.forEach(({ selector }) => {
      const section = document.querySelector(selector);
      if (section) observer.observe(section);
    });
  };

  const setupAudio = () => {
    audioToggle?.addEventListener("click", () => {
      const isOpen = audioPlayer?.classList.toggle("is-open") || false;
      audioToggle.setAttribute("aria-expanded", String(isOpen));
    });

    audioButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setAudioMode(button.dataset.audio || "silent");
        audioPlayer?.classList.remove("is-open");
        audioToggle?.setAttribute("aria-expanded", "false");
      });
    });
  };

  const setupLightbox = () => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;

    document.querySelectorAll(".gallery-item").forEach((item) => {
      item.addEventListener("click", () => {
        lightboxImage.src = item.dataset.full || "";
        lightboxImage.alt = item.dataset.caption || "Imagen de galeria Darhibey";
        lightboxCaption.textContent = item.dataset.caption || "";
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
      });
    });

    const close = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImage.src = "";
    };

    lightboxClose?.addEventListener("click", close);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = navLinks?.classList.toggle("is-open") || false;
    header?.classList.toggle("is-open", isOpen);
    body.classList.toggle("nav-open", isOpen);
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("scroll", parallax, { passive: true });
  window.addEventListener("load", () => window.setTimeout(hideLoader, 3000));

  createRain();
  createParticles(goldParticles, 58);
  createParticles(goldParticles, 28, "white-dot");
  createParticles(loaderParticles, 70);
  createParticles(loaderParticles, 18, "white-dot");
  setupReveal();
  setupShieldTilt();
  setupHeroLight();
  setupQuotes();
  setupAudio();
  setupAmbientSections();
  setupLightbox();
  updateHeader();
  updateScrollState();
  window.setTimeout(triggerLightning, 5000);
})();
