/**
 * Nikah Ceremony — Riya N & Arshad AP
 * Smooth Dissolve Opening Screen, Falling Burgundy Petals & Leaves, Background Audio & Calendar Integration
 */

let triggerPetalShower = () => {};

document.addEventListener('DOMContentLoaded', () => {
  // Enforce manual scroll restoration so page always starts at top
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  initOpeningCover();
  initOpeningTilt();
  initTypewriterDua();
  initPetalAnimation();
  initScrollTransitions();
  initMusicPlayer();
  initNavigation();
  initCalendarAction();
});

/* ==========================================================================
   3D PERSPECTIVE TILT ON OPENING CARD
   ========================================================================== */
function initOpeningTilt() {
  const card = document.querySelector('.opening-card');
  const cover = document.getElementById('opening-cover');
  if (!card || !cover) return;

  let isTouch = false;
  window.addEventListener('touchstart', () => { isTouch = true; }, { passive: true });

  cover.addEventListener('mousemove', (e) => {
    if (isTouch) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = (y / (rect.height / 2)) * -3.5;
    const tiltY = (x / (rect.width / 2)) * 3.5;
    card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
  });

  cover.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  cover.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.1s ease-out';
  });
}

/* ==========================================================================
   TYPEWRITER DUA ANIMATION
   ========================================================================== */
function initTypewriterDua() {
  const el = document.getElementById('typewriter-dua');
  const cursor = document.querySelector('.typewriter-cursor');
  if (!el) return;

  const secondHalf = "وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ";
  
  let segments = [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('ar', { granularity: 'grapheme' });
    segments = Array.from(segmenter.segment(secondHalf), s => s.segment);
  } else {
    segments = [...secondHalf];
  }

  let index = 0;
  setTimeout(() => {
    function typeNext() {
      if (index < segments.length) {
        el.textContent += segments[index];
        index++;
        // Natural typing rhythm: 55ms - 85ms
        const delay = Math.random() * 30 + 55;
        setTimeout(typeNext, delay);
      } else {
        if (cursor) {
          cursor.classList.add('finished');
        }
      }
    }
    typeNext();
  }, 500);
}

/* ==========================================================================
   1. EXCLUSIVE OPENING COVER — SMOOTH DISSOLVE TO INVITATION
   ========================================================================== */
function initOpeningCover() {
  const openingCover = document.getElementById('opening-cover');
  const bgAudio = document.getElementById('bg-audio');
  const musicBtn = document.getElementById('music-btn');
  if (!openingCover) return;

  let isCoverActive = true;
  let isDissolving = false;

  function dissolveCover() {
    if (isDissolving || !isCoverActive) return;
    isDissolving = true;

    // Pin viewport strictly to the top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Trigger smooth CSS dissolve crossfade & celebratory petal shower
    openingCover.classList.add('dissolving');
    triggerPetalShower(22);

    // Softly start background music if not already playing
    if (bgAudio && musicBtn && bgAudio.paused) {
      bgAudio.volume = 0.55;
      bgAudio.play()
        .then(() => {
          musicBtn.classList.add('playing');
          musicBtn.setAttribute('aria-label', 'Pause background music');
        })
        .catch(() => {});
    }

    // Cleanly remove cover and unlock normal scrolling ONLY after the dissolve transition has completely finished
    setTimeout(() => {
      openingCover.style.display = 'none';
      document.documentElement.classList.remove('cover-locked');
      document.body.classList.remove('cover-locked');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      isCoverActive = false;
      isDissolving = false;
    }, 1200);
  }

  // Handle URL param for instant testing
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('dissolve') === '1') {
    openingCover.style.display = 'none';
    document.documentElement.classList.remove('cover-locked');
    document.body.classList.remove('cover-locked');
    
    if (urlParams.get('test_view') === 'couple') {
      const invSec = document.getElementById('invitation-section');
      if (invSec) invSec.style.display = 'none';
    } else if (urlParams.get('test_view') === 'details') {
      const invSec = document.getElementById('invitation-section');
      const cplSec = document.getElementById('couple-section');
      if (invSec) invSec.style.display = 'none';
      if (cplSec) cplSec.style.display = 'none';
    }

    window.scrollTo(0, 0);
    isCoverActive = false;
  }

  // Trigger dissolve on click / tap anywhere on cover
  openingCover.addEventListener('click', (e) => {
    e.preventDefault();
    dissolveCover();
  });

  // Prevent any background scroll while cover or dissolve is active, and trigger dissolve
  window.addEventListener('wheel', (e) => {
    if (isCoverActive) {
      if (e.cancelable) e.preventDefault();
      dissolveCover();
    }
  }, { passive: false });

  // Prevent background scroll and trigger dissolve on touch swipe on mobile
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    if (isCoverActive && e.touches && e.touches.length > 0) {
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isCoverActive) {
      if (e.cancelable) e.preventDefault();
      if (e.touches && e.touches.length > 0) {
        const currentY = e.touches[0].clientY;
        if (Math.abs(touchStartY - currentY) > 8) {
          dissolveCover();
        }
      }
    }
  }, { passive: false });

  // Trigger dissolve on keyboard navigation keys
  window.addEventListener('keydown', (e) => {
    if (isCoverActive && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Enter'].includes(e.key)) {
      if (e.cancelable) e.preventDefault();
      dissolveCover();
    }
  });
}

/* ==========================================================================
   2. CONTINUOUS REALISTIC FALLING BURGUNDY PETAL & LEAF ANIMATION
      Features Dynamic Scroll Gusts & Flurries Between Pages
   ========================================================================== */
function initPetalAnimation() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const particleSrcs = [
    'images/petal_1.png',
    'images/petal_2.png',
    'images/petal_3.png',
    'images/petal_4.png',
    'images/petal_5.png',
    'images/leaf_silver_2.png'
  ];

  const particleImages = [];
  let imagesLoaded = 0;

  particleSrcs.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === particleSrcs.length) {
        startParticles();
      }
    };
    img.onerror = () => {
      imagesLoaded++;
      if (imagesLoaded === particleSrcs.length) {
        startParticles();
      }
    };
    particleImages.push(img);
  });

  let width = 0;
  let height = 0;
  let dpr = 1;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  const isMobile = window.innerWidth < 768;
  const baseCount = isMobile ? 36 : 52;
  const maxCount = isMobile ? 85 : 125;
  const particles = [];
  let scrollBoost = 0;

  class Particle {
    constructor(initialSpawn = false, isShower = false) {
      this.reset(initialSpawn, isShower);
    }

    reset(initialSpawn = false, isShower = false) {
      this.img = particleImages[Math.floor(Math.random() * particleImages.length)];
      // Dainty, delicate size: 12px to 20px (matching original elegant proportions)
      this.size = Math.random() * 8 + 12;
      this.x = Math.random() * (width + 80) - 40;
      
      if (initialSpawn) {
        this.y = Math.random() * height;
      } else if (isShower) {
        this.y = -20 - Math.random() * 120;
      } else {
        this.y = -40 - Math.random() * 80;
      }

      this.speedY = Math.random() * 1.05 + 0.85; // 0.85 - 1.9 px/frame
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = Math.random() * 0.018 + 0.009;
      this.swayWidth = Math.random() * 1.5 + 0.6;

      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.032;

      this.flip = Math.random() * Math.PI * 2;
      this.flipSpeed = Math.random() * 0.032 + 0.016;

      this.opacity = Math.random() * 0.35 + 0.65; // 0.65 - 1.0
      this.speedFactor = Math.random() * 0.8 + 0.6;
    }

    update() {
      // Base falling speed plus dynamic scroll velocity boost
      const effectiveSpeed = this.speedY + (scrollBoost * this.speedFactor);
      this.y += effectiveSpeed;
      
      this.swayAngle += this.swaySpeed + (scrollBoost * 0.004);
      this.x += Math.sin(this.swayAngle) * (this.swayWidth + scrollBoost * 0.3);
      
      this.rotation += this.rotationSpeed + (scrollBoost * 0.007);
      this.flip += this.flipSpeed + (scrollBoost * 0.009);

      if (this.y > height + 60) {
        // Naturally prune burst particles until base count is reached
        if (particles.length > baseCount) {
          return false;
        }
        this.reset(false);
      }
      if (this.x < -80) this.x = width + 60;
      if (this.x > width + 80) this.x = -60;
      return true;
    }

    draw(context) {
      if (!this.img || !this.img.complete || !this.img.naturalWidth) return;

      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.rotation);
      
      const scaleX = Math.cos(this.flip);
      context.scale(scaleX, 1);
      context.globalAlpha = this.opacity;

      const drawSize = this.size;
      context.drawImage(
        this.img,
        -drawSize / 2,
        -drawSize / 2,
        drawSize,
        drawSize
      );

      context.restore();
    }
  }

  // Connect global shower trigger for transitions
  triggerPetalShower = function(count = 24) {
    scrollBoost = Math.min(scrollBoost + 3.8, 6.2);
    const targetCount = Math.min(count, maxCount - particles.length);
    for (let i = 0; i < targetCount; i++) {
      particles.push(new Particle(false, true));
    }
  };

  // Scroll listener: generates dynamic flurries of falling leaves & petals when scrolling between pages
  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  let lastScrollTime = Date.now();
  let scrollThrottle = 0;

  window.addEventListener('scroll', () => {
    const now = Date.now();
    const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const deltaY = Math.abs(currentY - lastScrollY);
    const dt = Math.max(now - lastScrollTime, 16);
    
    // Speed in px per animation frame
    const speed = (deltaY / dt) * 16;
    scrollBoost = Math.min(scrollBoost + speed * 0.14, 6.5);

    // Burst extra leaves and petals as user scrolls between pages
    if (deltaY > 12 && now - scrollThrottle > 50 && particles.length < maxCount) {
      scrollThrottle = now;
      const countToSpawn = Math.min(Math.floor(deltaY / 18) + 2, 6);
      for (let i = 0; i < countToSpawn; i++) {
        particles.push(new Particle(false, true));
      }
    }

    lastScrollY = currentY;
    lastScrollTime = now;
  }, { passive: true });

  function startParticles() {
    for (let i = 0; i < baseCount; i++) {
      particles.push(new Particle(true));
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      // Smooth decay of scroll boost back to ambient drift
      if (scrollBoost > 0.01) {
        scrollBoost *= 0.94;
      } else {
        scrollBoost = 0;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const alive = particles[i].update();
        if (!alive) {
          particles.splice(i, 1);
        } else {
          particles[i].draw(ctx);
        }
      }

      requestAnimationFrame(render);
    }

    render();
  }
}

/* ==========================================================================
   3. SCROLL TRANSITIONS & FLORAL PARALLAX
   ========================================================================== */
function initScrollTransitions() {
  const animatedElements = document.querySelectorAll('.fade-in-up');

  const observerOptions = {
    root: null,
    rootMargin: '120px 0px 120px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach((el) => {
    observer.observe(el);
  });
}

/* ==========================================================================
   4. FLOATING MUSIC PLAYER CONTROL & AUTOPLAY MANAGER
   ========================================================================== */
function initMusicPlayer() {
  const musicBtn = document.getElementById('music-btn');
  const bgAudio = document.getElementById('bg-audio');
  if (!musicBtn || !bgAudio) return;

  function updatePlayState(playing) {
    if (playing) {
      musicBtn.classList.add('playing');
      musicBtn.setAttribute('aria-label', 'Pause background music');
    } else {
      musicBtn.classList.remove('playing');
      musicBtn.setAttribute('aria-label', 'Play background music');
    }
  }

  function playAudio() {
    bgAudio.volume = 0.55;
    const playPromise = bgAudio.play();
    if (playPromise !== undefined) {
      return playPromise
        .then(() => {
          updatePlayState(true);
          cleanupAutoplayListeners();
          return true;
        })
        .catch(() => {
          updatePlayState(false);
          return false;
        });
    }
    return Promise.resolve(false);
  }

  function pauseAudio() {
    bgAudio.pause();
    updatePlayState(false);
  }

  function toggleAudio() {
    if (!bgAudio.paused) {
      pauseAudio();
    } else {
      playAudio();
    }
  }

  // Synchronize button visual state with audio element events
  bgAudio.addEventListener('play', () => updatePlayState(true));
  bgAudio.addEventListener('pause', () => updatePlayState(false));

  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAudio();
  });

  // 1. Immediately attempt autoplay on initial page load
  playAudio();

  // 2. Seamless user interaction fallback:
  // Modern browsers restrict unmuted sound until the user interacts with the page.
  // The moment the user touches, scrolls, or clicks anywhere on the opening screen,
  // we immediately start playing the music from the beginning.
  const interactionEvents = ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'click', 'wheel', 'keydown'];

  function onFirstUserInteraction() {
    if (bgAudio.paused) {
      playAudio();
    }
  }

  function cleanupAutoplayListeners() {
    interactionEvents.forEach((evt) => {
      window.removeEventListener(evt, onFirstUserInteraction, { capture: true });
    });
  }

  interactionEvents.forEach((evt) => {
    window.addEventListener(evt, onFirstUserInteraction, { capture: true, passive: true });
  });
}

/* ==========================================================================
   5. NAVIGATION & SCROLL GUIDES
   ========================================================================== */
function initNavigation() {
  const invitationScrollBtn = document.getElementById('scroll-indicator-invitation');
  const coupleScrollBtn = document.getElementById('scroll-indicator-couple');
  const coupleSection = document.getElementById('couple-section');
  const detailsSection = document.getElementById('details-section');

  if (invitationScrollBtn && coupleSection) {
    invitationScrollBtn.addEventListener('click', () => {
      triggerPetalShower(24);
      coupleSection.scrollIntoView({ behavior: 'smooth' });
    });
    invitationScrollBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerPetalShower(24);
        coupleSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (coupleScrollBtn && detailsSection) {
    coupleScrollBtn.addEventListener('click', () => {
      triggerPetalShower(24);
      detailsSection.scrollIntoView({ behavior: 'smooth' });
    });
    coupleScrollBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerPetalShower(24);
        detailsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/* ==========================================================================
   6. CALENDAR INTEGRATION (.ICS GENERATOR & GOOGLE CALENDAR)
   ========================================================================== */
function initCalendarAction() {
  const calendarBtn = document.getElementById('add-to-calendar-btn');
  if (!calendarBtn) return;

  calendarBtn.addEventListener('click', () => {
    const title = "Nikah Ceremony: Riya N & Arshad AP";
    const description = "With hearts full of joy and gratitude, we cordially invite you to celebrate the Nikah Ceremony of Riya N & Arshad AP.\\n\\nDate: Saturday, 19 December 2026\\nTime: 11:00 AM\\nVenue: City Auditorium\\nLocation: https://maps.app.goo.gl/ddZ5TCMYNeJ3gXcR6";
    const location = "City Auditorium";
    
    // Date: 19 December 2026 at 11:00 AM IST (UTC+05:30) -> 05:30 UTC
    const startDate = "20261219T053000Z";
    const endDate = "20261219T083000Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Riya and Arshad Nikah Ceremony//Invitation//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:nikah-riya-arshad-20261219@nikahceremony.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "Nikah-Ceremony-Riya-and-Arshad.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const span = calendarBtn.querySelector('span');
    if (span) {
      const originalText = span.textContent;
      span.textContent = "Saved to Calendar!";
      setTimeout(() => {
        span.textContent = originalText;
      }, 2500);
    }
  });
}