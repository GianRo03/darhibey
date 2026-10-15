(() => {
  "use strict";

  /* Fotos de la galería: archivos en assets/fotos/.
     Para añadir o cambiar una foto, edita esta lista. */
  const PHOTOS = [
    { src: "assets/fotos/maestra.jpg", alt: "Darhibey sonriendo con su uniforme, entre plantas", caption: "Maestra de corazón 🍎" },
    { src: "assets/fotos/pequenita.jpg", alt: "Darhibey de niña, con blusa rosada y las manos en la cintura", caption: "Desde pequeñita, con actitud 💛" },
    { src: "assets/fotos/sonrisa.jpg", alt: "Darhibey sonriendo en una selfie", caption: "Esa sonrisa ☀️" },
    { src: "assets/fotos/espejo.jpg", alt: "Darhibey con vestido negro frente a un espejo", caption: "Elegancia natural ✨" },
    { src: "assets/fotos/estilo.jpg", alt: "Darhibey con lentes de sol y camisa a rayas", caption: "Con todo el estilo 😎" },
    { src: "assets/fotos/cabello.jpg", alt: "Primer plano de la mirada de Darhibey entre su cabello", caption: "Esa mirada 🌻" }
  ];

  const $ = (selector) => document.querySelector(selector);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("js");

  /* ---------- Destellos de la portada ---------- */

  const sparkles = $("#sparkles");
  if (sparkles && !reduceMotion) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 26; i += 1) {
      const dot = document.createElement("span");
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 75}%`;
      dot.style.setProperty("--s", `${3 + Math.random() * 5}px`);
      dot.style.setProperty("--d", `${3 + Math.random() * 4}s`);
      dot.style.setProperty("--delay", `${Math.random() * 4}s`);
      fragment.appendChild(dot);
    }
    sparkles.appendChild(fragment);
  }

  /* ---------- Aparición al hacer scroll ---------- */

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ---------- Confeti amarillo ---------- */

  const confetti = $("#confetti");
  const confettiColors = ["#FFC93C", "#FFB627", "#FF7A2F", "#FFE14D", "#4CAF50", "#FFFFFF"];

  const burst = (originX = window.innerWidth / 2, originY = window.innerHeight / 2, amount = 60) => {
    if (!confetti || reduceMotion || !Element.prototype.animate) return;

    for (let i = 0; i < amount; i += 1) {
      const piece = document.createElement("span");
      const size = 6 + Math.random() * 8;
      const isMango = i % 12 === 0;

      if (isMango) {
        piece.textContent = "🥭";
        piece.style.fontSize = "22px";
      } else {
        piece.style.width = `${size}px`;
        piece.style.height = `${size * (Math.random() > 0.5 ? 1 : 0.5)}px`;
        piece.style.background = confettiColors[i % confettiColors.length];
        piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      }
      confetti.appendChild(piece);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 120 + Math.random() * 220;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity - 160;
      const fall = window.innerHeight * 0.6;

      piece
        .animate(
          [
            { transform: `translate(${originX}px, ${originY}px) rotate(0deg)`, opacity: 1 },
            { transform: `translate(${originX + dx}px, ${originY + dy}px) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.35 },
            { transform: `translate(${originX + dx * 1.3}px, ${originY + dy + fall}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
          ],
          { duration: 1800 + Math.random() * 900, easing: "cubic-bezier(0.2, 0.6, 0.4, 1)" }
        )
        .finished.then(() => piece.remove(), () => piece.remove());
    }
  };

  const centerOf = (element) => {
    const rect = element.getBoundingClientRect();
    return [rect.left + rect.width / 2, rect.top + rect.height / 2];
  };

  /* ---------- Música ---------- */

  const song = $("#song");
  const musicToggle = $("#musicToggle");

  const setPlaying = (playing) => {
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.setAttribute("aria-label", playing ? "Pausar canción" : "Reproducir canción");
  };

  // iOS solo permite reproducir audio dentro de un toque del usuario,
  // por eso play() se llama directamente desde los manejadores de clic.
  const playSong = () => {
    if (!song) return;
    song.volume = 0.6;
    const attempt = song.play();
    if (attempt && attempt.then) {
      attempt.then(
        () => {
          musicToggle.hidden = false;
          setPlaying(true);
        },
        () => {
          musicToggle.hidden = true;
        }
      );
    }
  };

  if (musicToggle && song) {
    musicToggle.addEventListener("click", () => {
      if (song.paused) {
        playSong();
      } else {
        song.pause();
        setPlaying(false);
      }
    });
    song.addEventListener("pause", () => setPlaying(false));
    song.addEventListener("play", () => setPlaying(true));
  }

  /* ---------- Botón "Ábrelo" ---------- */

  const openGift = $("#openGift");
  if (openGift) {
    openGift.addEventListener("click", () => {
      playSong();
      const [x, y] = centerOf(openGift);
      burst(x, y, 70);
      window.setTimeout(() => {
        $("#nombre").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      }, reduceMotion ? 0 : 700);
    });
  }

  /* ---------- Mango ---------- */

  const mango = $("#mangoButton");
  if (mango) {
    mango.addEventListener("click", () => {
      mango.classList.remove("is-popped");
      void mango.offsetWidth; // reinicia la animación
      mango.classList.add("is-popped");
      const [x, y] = centerOf(mango);
      burst(x, y, 50);
      if (navigator.vibrate) navigator.vibrate(30);
    });
  }

  /* ---------- Tarjetas ---------- */

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      const flipped = card.getAttribute("aria-pressed") === "true";
      card.setAttribute("aria-pressed", String(!flipped));
    });
  });

  /* ---------- Botón final ---------- */

  const celebrate = $("#celebrate");
  if (celebrate) {
    celebrate.addEventListener("click", () => {
      burst(window.innerWidth * 0.25, window.innerHeight * 0.4, 45);
      burst(window.innerWidth * 0.75, window.innerHeight * 0.4, 45);
    });
  }

  /* ---------- Galería ---------- */

  const gallery = $("#gallery");
  const dots = $("#galleryDots");
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");

  const buildGallery = () => {
    if (!gallery) return;
    const tilts = ["-1.5deg", "1deg", "-0.5deg", "1.5deg"];

    if (PHOTOS.length === 0) {
      ["🌻", "🥭", "☀️"].forEach((emoji, index) => {
        const figure = document.createElement("figure");
        figure.className = "gallery__item";
        figure.style.setProperty("--tilt", tilts[index % tilts.length]);
        figure.innerHTML = `<div class="gallery__placeholder" aria-hidden="true">${emoji}</div><figcaption>Pronto, una foto 💛</figcaption>`;
        gallery.appendChild(figure);
      });
    } else {
      PHOTOS.forEach((photo, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "gallery__item";
        button.style.setProperty("--tilt", tilts[index % tilts.length]);
        button.setAttribute("aria-label", `Ampliar foto: ${photo.alt}`);

        const img = document.createElement("img");
        img.src = photo.src;
        img.alt = photo.alt;
        img.width = 800;
        img.height = 1000;
        img.loading = index < 2 ? "eager" : "lazy";
        img.decoding = "async";
        button.appendChild(img);

        if (photo.caption) {
          const caption = document.createElement("span");
          caption.className = "gallery__caption";
          caption.textContent = photo.caption;
          button.appendChild(caption);
        }

        button.addEventListener("click", () => {
          if (!lightbox || !lightbox.showModal) return;
          lightboxImage.src = photo.full || photo.src;
          lightboxImage.alt = photo.alt;
          lightbox.showModal();
        });
        gallery.appendChild(button);
      });
    }

    if (!dots) return;
    const items = Array.from(gallery.children);
    items.forEach(() => dots.appendChild(document.createElement("span")));

    const updateDots = () => {
      const center = gallery.scrollLeft + gallery.clientWidth / 2;
      let active = 0;
      let best = Infinity;
      items.forEach((item, index) => {
        const distance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - center);
        if (distance < best) {
          best = distance;
          active = index;
        }
      });
      Array.from(dots.children).forEach((dot, index) => dot.classList.toggle("is-active", index === active));
    };

    let ticking = false;
    gallery.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          updateDots();
          ticking = false;
        });
      },
      { passive: true }
    );
    updateDots();
  };

  buildGallery();

  if (lightbox) {
    $("#lightboxClose").addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });
  }
})();
