/* ============================================================
   NEXORA — Premium Interactive JS
   Awwwards-Level Animations & Interactions
   ============================================================ */

const removePreloader = () => {
  const preloader = document.getElementById('site-preloader');
  if (preloader && !preloader.classList.contains('fade-out')) {
    preloader.classList.add('fade-out');
    setTimeout(() => {
      preloader.style.display = 'none';
      document.body.classList.remove('loading');
    }, 600);
  }
};

const checkAllMediaLoaded = () => {
  const images = Array.from(document.images);
  const videos = Array.from(document.getElementsByTagName('video'));
  
  const promises = [];
  
  images.forEach(img => {
    if (!img.complete) {
      promises.push(new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }));
    }
  });

  videos.forEach(video => {
    if (video.readyState < 3) { // 3 = HAVE_FUTURE_DATA
      promises.push(new Promise((resolve) => {
        video.addEventListener('canplay', resolve, { once: true });
        video.addEventListener('error', resolve, { once: true });
      }));
    }
  });

  Promise.all(promises).then(removePreloader);
  
  // Fallback failsafe
  setTimeout(removePreloader, 8000);
};

if (document.readyState === 'complete') {
  checkAllMediaLoaded();
} else {
  window.addEventListener('load', checkAllMediaLoaded);
}

'use strict';

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroCanvas();
  initNewsletterCanvas();
  initScrollReveal();
  initStatCounters();
  initTestimonialCarousel();
  initContactForm();
  initParallax();
  initServiceCardHover();
  initHeroMask();
});

/* ============================================================
   1. NAVBAR — Scroll blur effect
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;

  const handleScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
}

/* ============================================================
   2. HERO CANVAS — Smoke / floating particles
   ============================================================ */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, smokeParticles, animId;

  // --- RESIZE ---
  const resize = () => {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // --- PARTICLES (floating dust) ---
  class DustParticle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = H + 10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.3 + 0.1);
      this.r = Math.random() * 1.5 + 0.3;
      this.opacity = 0;
      this.maxOpacity = Math.random() * 0.35 + 0.05;
      this.life = 0;
      this.maxLife = Math.random() * 400 + 200;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      const t = this.life / this.maxLife;
      if (t < 0.15) {
        this.opacity = (t / 0.15) * this.maxOpacity;
      } else if (t > 0.7) {
        this.opacity = ((1 - t) / 0.3) * this.maxOpacity;
      } else {
        this.opacity = this.maxOpacity;
      }
      if (this.life >= this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- SMOKE PUFFS ---
  class SmokeParticle {
    constructor() { this.reset(); }
    reset() {
      // concentrate smoke near center-bottom (where the hands meet)
      this.x = W * 0.5 + (Math.random() - 0.5) * W * 0.35;
      this.y = H * 0.55 + (Math.random() - 0.5) * H * 0.2;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = -(Math.random() * 0.2 + 0.05);
      this.r = Math.random() * 80 + 40;
      this.opacity = 0;
      this.maxOpacity = Math.random() * 0.06 + 0.01;
      this.life = 0;
      this.maxLife = Math.random() * 600 + 300;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.002;
      this.scaleX = Math.random() * 0.5 + 0.8;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.r += 0.08;
      this.rotation += this.rotSpeed;
      this.life++;
      const t = this.life / this.maxLife;
      if (t < 0.2) {
        this.opacity = (t / 0.2) * this.maxOpacity;
      } else if (t > 0.6) {
        this.opacity = ((1 - t) / 0.4) * this.maxOpacity;
      } else {
        this.opacity = this.maxOpacity;
      }
      if (this.life >= this.maxLife) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.scaleX, 1);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r);
      grad.addColorStop(0, 'rgba(180,180,180,0.8)');
      grad.addColorStop(0.5, 'rgba(120,120,120,0.3)');
      grad.addColorStop(1, 'rgba(60,60,60,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Init particle pools
  particles = Array.from({ length: 80 }, () => {
    const p = new DustParticle();
    p.y = Math.random() * H;
    p.life = Math.floor(Math.random() * p.maxLife);
    return p;
  });

  smokeParticles = Array.from({ length: 14 }, () => {
    const p = new SmokeParticle();
    p.life = Math.floor(Math.random() * p.maxLife);
    return p;
  });

  // --- RENDER LOOP ---
  const render = () => {
    ctx.clearRect(0, 0, W, H);

    // Draw smoke
    smokeParticles.forEach(p => { p.update(); p.draw(); });
    // Draw dust
    particles.forEach(p => { p.update(); p.draw(); });

    animId = requestAnimationFrame(render);
  };
  render();

  // Cleanup
  return () => { cancelAnimationFrame(animId); };
}

/* ============================================================
   3. NEWSLETTER CANVAS — Floating particles
   ============================================================ */
function initNewsletterCanvas() {
  const canvas = document.getElementById('newsletterCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, pts, animId;

  const resize = () => {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  resize();

  class NLParticle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.2 + 0.2;
      this.opacity = Math.random() * 0.3 + 0.05;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  pts = Array.from({ length: 60 }, () => new NLParticle());

  const render = () => {
    ctx.clearRect(0, 0, W, H);
    // Draw connecting lines between nearby particles
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.globalAlpha = (1 - dist / 120) * 0.08;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    pts.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(render);
  };
  render();
}

/* ============================================================
   4. INTERSECTION OBSERVER — Scroll reveals
   ============================================================ */
function initScrollReveal() {
  // Add reveal classes to elements
  const revealTargets = [
    { selector: '.services-left', cls: 'reveal-left' },
    { selector: '.services-heading', cls: 'reveal' },
    { selector: '.services-desc', cls: 'reveal' },
    { selector: '.btn-dark', cls: 'reveal' },
    { selector: '.projects-left', cls: 'reveal-left' },
    { selector: '.projects-heading', cls: 'reveal' },
    { selector: '.process-heading', cls: 'reveal' },
    { selector: '.process-sub', cls: 'reveal' },
    { selector: '.testimonials-left', cls: 'reveal-left' },
    { selector: '.testimonials-heading', cls: 'reveal' },
    { selector: '.nl-heading', cls: 'reveal' },
    { selector: '.nl-desc', cls: 'reveal' },
    { selector: '.nl-form', cls: 'reveal' },
    { selector: '.footer-inner', cls: 'reveal' },
  ];

  revealTargets.forEach(({ selector, cls }) => {
    const el = document.querySelector(selector);
    if (el && !el.classList.contains(cls)) {
      el.classList.add(cls);
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Stagger child reveals
        const children = entry.target.querySelectorAll('[data-stagger]');
        children.forEach((child, i) => {
          setTimeout(() => child.classList.add('visible'), i * 80);
        });
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });

  // Service cards
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.animationPlayState = 'paused';
  });
  const serviceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.service-card');
        cards.forEach(card => {
          card.style.animationPlayState = 'running';
        });
      }
    });
  }, { threshold: 0 });
  const servicesSection = document.querySelector('.services-cards');
  if (servicesSection) serviceObserver.observe(servicesSection);

  // Process steps
  const processObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const steps = entry.target.querySelectorAll('.process-step');
        steps.forEach(step => {
          step.style.animationPlayState = 'running';
        });
      }
    });
  }, { threshold: 0 });
  const processSection = document.querySelector('.process-steps');
  if (processSection) processObserver.observe(processSection);

  // Project cards
  const projObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.project-card');
        cards.forEach(card => {
          card.style.animationPlayState = 'running';
        });
      }
    });
  }, { threshold: 0 });
  const projSection = document.querySelector('.projects-cards');
  if (projSection) projObserver.observe(projSection);

  // Testimonial cards
  const tcObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.testimonial-card');
        cards.forEach(card => {
          card.style.animationPlayState = 'running';
        });
      }
    });
  }, { threshold: 0 });
  const tcSection = document.querySelector('.testimonials-cards');
  if (tcSection) tcObserver.observe(tcSection);

  // Stat items
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.stat-item').forEach(el => statObserver.observe(el));
}

/* ============================================================
   5. STAT COUNTER ANIMATION
   ============================================================ */
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);
      const currentValue = Math.round(easedProgress * target);
      el.textContent = currentValue;
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
}

/* ============================================================
   6. TESTIMONIAL CAROUSEL
   ============================================================ */
function initTestimonialCarousel() {
  const cards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.c-dot');
  const prevBtn = document.getElementById('tc-prev');
  const nextBtn = document.getElementById('tc-next');

  if (!cards.length) return;

  let currentIndex = 0;
  let autoInterval;

  const updateCarousel = (index) => {
    // On small viewports or desktop — just update visual state
    cards.forEach((card, i) => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      if (i === index) {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
        card.style.order = '0';
      } else {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
        card.style.order = '1';
      }
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentIndex = index;
  };

  const next = () => {
    updateCarousel((currentIndex + 1) % cards.length);
  };
  const prev = () => {
    updateCarousel((currentIndex - 1 + cards.length) % cards.length);
  };

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      updateCarousel(parseInt(dot.dataset.index, 10));
      resetAuto();
    });
  });

  const startAuto = () => { autoInterval = setInterval(next, 5000); };
  const resetAuto = () => { clearInterval(autoInterval); startAuto(); };

  startAuto();
}

/* ============================================================
   7. NEWSLETTER FORM
   ============================================================ */
function initNewsletterForm() {
  const form = document.getElementById('nl-form');
  const input = document.getElementById('nl-email');
  const submitBtn = document.getElementById('nl-submit-btn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email || !email.includes('@')) {
      input.style.borderBottom = '1px solid rgba(255,80,80,0.5)';
      input.placeholder = 'Please enter a valid email';
      return;
    }

    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="animation:spin 0.6s linear infinite">
        <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5" stroke-dasharray="20 22" stroke-linecap="round"/>
      </svg>
    `;
    submitBtn.style.pointerEvents = 'none';

    setTimeout(() => {
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 9l4 4 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Subscribed!</span>
      `;
      submitBtn.style.background = '#111';
      submitBtn.style.color = 'white';
      input.value = '';
      input.placeholder = 'Enter your email address';
    }, 1200);
  });
}

/* ============================================================
   8. CUSTOM CURSOR TRAIL
   ============================================================ */
function initCursorTrail() {
  // Only on non-touch devices
  if ('ontouchstart' in window) return;

  const trailCount = 8;
  const trails = [];

  for (let i = 0; i < trailCount; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      width: ${3 + i * 0.5}px;
      height: ${3 + i * 0.5}px;
      border-radius: 50%;
      background: rgba(255,255,255,${0.4 - i * 0.04});
      pointer-events: none;
      z-index: 99999;
      top: 0; left: 0;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
      will-change: transform;
    `;
    document.body.appendChild(dot);
    trails.push({ el: dot, x: 0, y: 0, tx: 0, ty: 0 });
  }

  let mouseX = -100, mouseY = -100;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    trails[0].tx = mouseX;
    trails[0].ty = mouseY;
  });

  // Hide on mouse leave
  document.addEventListener('mouseleave', () => {
    trails.forEach(t => { t.el.style.opacity = '0'; });
  });
  document.addEventListener('mouseenter', () => {
    trails.forEach(t => { t.el.style.opacity = '1'; });
  });

  const animateTrail = () => {
    for (let i = 0; i < trailCount; i++) {
      const trail = trails[i];
      const lag = 0.12 + i * 0.04;
      if (i === 0) {
        trail.x += (mouseX - trail.x) * 0.6;
        trail.y += (mouseY - trail.y) * 0.6;
      } else {
        trail.x += (trails[i - 1].x - trail.x) * lag;
        trail.y += (trails[i - 1].y - trail.y) * lag;
      }
      trail.el.style.transform = `translate(calc(-50% + ${trail.x}px), calc(-50% + ${trail.y}px))`;
    }
    requestAnimationFrame(animateTrail);
  };
  animateTrail();

  // Cursor grow on interactive elements
  const interactiveEls = document.querySelectorAll('a, button, .service-card, .project-card, .testimonial-card');
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      trails[0].el.style.width = '40px';
      trails[0].el.style.height = '40px';
      trails[0].el.style.background = 'rgba(255,255,255,0.08)';
      trails[0].el.style.border = '1px solid rgba(255,255,255,0.3)';
    });
    el.addEventListener('mouseleave', () => {
      trails[0].el.style.width = '3px';
      trails[0].el.style.height = '3px';
      trails[0].el.style.background = 'rgba(255,255,255,0.4)';
      trails[0].el.style.border = 'none';
    });
  });
}

/* ============================================================
   9. PARALLAX
   ============================================================ */
function initParallax() {
  const heroIllustration = document.querySelector('.hero-illustration');
  const heroContent = document.querySelector('.hero-content');

  if (!heroIllustration) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const parallaxSpeed = 0.25;

    if (heroIllustration) {
      heroIllustration.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
    }
    if (heroContent) {
      heroContent.style.transform = `translateY(${scrollY * 0.1}px)`;
      heroContent.style.opacity = Math.max(0, 1 - scrollY / 600);
    }
  }, { passive: true });
}

/* ============================================================
   10. SERVICE CARD HOVER — Magnetic effect
   ============================================================ */
function initServiceCardHover() {
  const cards = document.querySelectorAll('.service-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = (y / rect.height) * 4;
      const rotY = -(x / rect.width) * 4;

      const nudgeY = parseFloat(getComputedStyle(card).getPropertyValue('--nudge-y') || '0');
      card.style.transform = `
        translateY(calc(${nudgeY}px - 10px))
        rotateX(${rotX}deg) 
        rotateY(${rotY}deg)
      `;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      const nudgeY = getComputedStyle(card).getPropertyValue('--nudge-y') || '0';
      card.style.transform = `translateY(${nudgeY})`;
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease';
    });
  });

  // Project card tilt
  const projCards = document.querySelectorAll('.project-card');
  projCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = (y / rect.height) * 3;
      const rotY = -(x / rect.width) * 3;
      card.style.transform = `translateY(-8px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      card.style.transition = 'transform 0.12s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  });
}

/* ============================================================
   11. SMOOTH SCROLL for nav links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ============================================================
   12. Button ripple effect
   ============================================================ */
document.querySelectorAll('.btn-primary, .btn-dark, .btn-ghost, .btn-outline, .nl-submit').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: 4px; height: 4px;
      background: rgba(255,255,255,0.25);
      border-radius: 50%;
      left: ${x}px; top: ${y}px;
      transform: translate(-50%, -50%) scale(0);
      animation: rippleAnim 0.6s ease-out forwards;
      pointer-events: none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

// Ripple keyframe via style tag
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleAnim {
    to { transform: translate(-50%, -50%) scale(80); opacity: 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(rippleStyle);

/* ============================================================
   13. HERO HANDS — Subtle breathing animation
   ============================================================ */
(function initHandsAnimation() {
  const leftHand = document.getElementById('leftHand');
  const rightHand = document.getElementById('rightHand');

  if (!leftHand || !rightHand) return;

  let t = 0;
  const animate = () => {
    t += 0.008;
    const breathe = Math.sin(t) * 3;
    const xShift = Math.sin(t * 0.7) * 2;

    leftHand.style.transform = `translate(${xShift}px, ${breathe}px)`;
    rightHand.style.transform = `translate(${-xShift}px, ${breathe}px)`;

    requestAnimationFrame(animate);
  };
  animate();
})();

/* ============================================================
   14. AMBIENT TAGS — Staggered float
   ============================================================ */
(function initAmbientTags() {
  const tags = document.querySelectorAll('.ambient-tag');
  tags.forEach((tag, i) => {
    tag.style.animationDuration = `${7 + i * 1.5}s`;
    tag.style.animationDelay = `${i * 1.8}s`;
  });
})();

/* ============================================================
   15. PROCESS STEP connector animation
   ============================================================ */
(function initProcessConnectors() {
  const connectors = document.querySelectorAll('.process-connector line');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        connectors.forEach((line, i) => {
          setTimeout(() => {
            line.style.transition = 'stroke-dashoffset 1s ease';
            line.style.strokeDasharray = '140';
            line.style.strokeDashoffset = '0';
          }, i * 200 + 400);
        });
      }
    });
  }, { threshold: 0 });

  const processSection = document.querySelector('.process-steps');
  if (processSection) {
    // Initialize connectors
    connectors.forEach(line => {
      line.style.strokeDasharray = '140';
      line.style.strokeDashoffset = '140';
    });
    observer.observe(processSection);
  }
})();

/* ============================================================
   16. HERO MASK EFFECT
   ============================================================ */
function initHeroMask() {
  const hero = document.getElementById('hero');
  const overlay = document.querySelector('.hero-image-overlay');
  if (!hero || !overlay) return;
  const vid = hero.querySelector('video');
  if(vid) { vid.play().catch(e=>console.log(e)); }
  
  const resetMask = "radial-gradient(circle at -9999px -9999px, transparent 0%, transparent 150px, black 300px)";
  overlay.style.webkitMaskImage = resetMask;
  overlay.style.maskImage = resetMask;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const maskStr = `radial-gradient(circle at ${x}px ${y}px, transparent 0%, transparent 150px, black 300px)`;
    overlay.style.webkitMaskImage = maskStr;
    overlay.style.maskImage = maskStr;
  });
  
  hero.addEventListener('mouseleave', () => {
    overlay.style.webkitMaskImage = resetMask;
    overlay.style.maskImage = resetMask;
  });
}




/* ============================================================
   Telegram Contact Form Integration
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate inputs
    const category = document.getElementById('contact-category').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;
    const submitBtn = document.getElementById('contact-submit');

    if (!category || !email || !message) {
      showToast('Please fill out all fields before sending.', 'error');
      return;
    }

    // Telegram Bot Setup
    const BOT_TOKEN = '8673149889:AAH6Md9MPqmz6UigMpcRuVxb480vDKgZ9kI';
    const CHAT_ID = '7833318325'; // IMPORTANT: Add your Chat ID here!

    const telegramMessage = `
<b>📬 New Contact Request</b>

<b>Category:</b> ${category}
<b>Email:</b> ${email}

<b>Message:</b>
<i>${message}</i>
    `.trim();

    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'SENDING...';
    submitBtn.style.opacity = '0.7';
    submitBtn.disabled = true;

    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: telegramMessage,
          parse_mode: 'HTML'
        })
      });

      const data = await response.json();
      if (data.ok) {
        showToast('Message sent successfully!', 'success');
        form.reset();
      } else {
        showToast('Error sending message. Please try again.', 'error');
        console.error(data);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to send message.', 'error');
    } finally {
      submitBtn.innerText = originalText;
      submitBtn.style.opacity = '1';
      submitBtn.disabled = false;
    }
  });
}



/* ============================================================
   Toast UI Helper
   ============================================================ */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else if (type === 'error') {
    iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  } else {
    iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400); // Wait for transition out
  }, 4000);
}
