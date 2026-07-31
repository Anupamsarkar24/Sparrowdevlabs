/* ============================================================
   NEXORA — Premium Interactive JS
   Awwwards-Level Animations & Interactions
   ============================================================ */

/* ============================================================
   SPARROW DEV LABS - MATHEMATICAL LOGO REVEAL ENGINE (1000x1000)
   ============================================================ */
function initPreloaderLogoCanvas() {
  const canvas = document.getElementById('preloaderLogoCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const W = canvas.width;  // 1000
  const H = canvas.height; // 1000

  const wingOutlineSvg = "M 210,640 C 250,540 330,420 430,340 C 400,430 350,520 330,590 C 300,610 250,630 210,640 Z";
  const wingFeatherSvg = "M 408,362 C 360,430 310,500 270,550";
  const bodyOutlineSvg = "M 330,590 C 390,570 435,510 445,450 C 455,390 485,340 495,290 C 490,230 465,190 490,144 C 520,90 580,110 587,160 L 615,151 L 580,188 C 565,240 545,300 525,380 L 510,530 L 618,530 L 584,564 L 460,564 L 450,470 Z";
  const eyeCenter = { x: 535, y: 152, r: 3.5 };

  const wingPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  wingPath.setAttribute('d', wingOutlineSvg);
  const wingLen = wingPath.getTotalLength();

  const featherPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  featherPath.setAttribute('d', wingFeatherSvg);
  const featherLen = featherPath.getTotalLength();

  const bodyPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  bodyPath.setAttribute('d', bodyOutlineSvg);
  const bodyLen = bodyPath.getTotalLength();

  const wingSamples = [];
  for (let l = 0; l <= wingLen; l += 2) {
    const pt = wingPath.getPointAtLength(l);
    wingSamples.push({ x: pt.x, y: pt.y });
  }

  const featherSamples = [];
  for (let l = 0; l <= featherLen; l += 2) {
    const pt = featherPath.getPointAtLength(l);
    featherSamples.push({ x: pt.x, y: pt.y });
  }

  const bodySamples = [];
  for (let l = 0; l <= bodyLen; l += 2) {
    const pt = bodyPath.getPointAtLength(l);
    bodySamples.push({ x: pt.x, y: pt.y });
  }

  const dust = [];
  for (let i = 0; i < 24; i++) {
    dust.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.15 + 0.05,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2
    });
  }

  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  const DURATION = 3000;
  let startTime = null;

  function render(timestamp) {
    if (!document.getElementById('preloaderLogoCanvas')) return;
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) % DURATION;
    const seconds = elapsed / 1000.0;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ffffff';
    dust.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    let wingDrawPct = 0, bodyDrawPct = 0, featherDrawPct = 0, fillOpacity = 0;
    let activeParticlePos = wingSamples[0];
    let particleAlpha = 0, ringAlpha = 0, ringAngle = 0, breathingGlow = 0, isReversing = false;

    if (seconds < 0.3) {
      const t = seconds / 0.3;
      particleAlpha = easeOutCubic(t);
      activeParticlePos = wingSamples[0];
    }
    else if (seconds < 0.7) {
      const t = (seconds - 0.3) / 0.4;
      const easedT = easeInOutCubic(t);
      wingDrawPct = easedT;
      featherDrawPct = Math.max(0, (t - 0.2) / 0.8);
      particleAlpha = 1.0;
      const idx = Math.floor(wingDrawPct * (wingSamples.length - 1));
      activeParticlePos = wingSamples[idx];
    }
    else if (seconds < 1.4) {
      const t = (seconds - 0.7) / 0.7;
      const easedT = easeInOutCubic(t);
      wingDrawPct = 1.0; featherDrawPct = 1.0; bodyDrawPct = easedT;
      fillOpacity = Math.max(0, (t - 0.4) / 0.6);
      particleAlpha = 1.0;
      const idx = Math.floor(bodyDrawPct * (bodySamples.length - 1));
      activeParticlePos = bodySamples[idx];
    }
    else if (seconds < 1.8) {
      const t = (seconds - 1.4) / 0.4;
      wingDrawPct = 1.0; featherDrawPct = 1.0; bodyDrawPct = 1.0; fillOpacity = 1.0; particleAlpha = 1.0;
      const passAngle = (t * Math.PI * 0.4) - Math.PI / 4;
      activeParticlePos = { x: 500 + Math.cos(passAngle) * 220, y: 360 + Math.sin(passAngle) * 200 };
    }
    else if (seconds < 2.2) {
      const t = (seconds - 1.8) / 0.4;
      wingDrawPct = 1.0; featherDrawPct = 1.0; bodyDrawPct = 1.0; fillOpacity = 1.0; particleAlpha = 1.0;
      ringAlpha = Math.min(t * 1.6, 0.85);
      ringAngle = (Math.PI * 0.15) + (easeInOutCubic(t) * Math.PI * 1.65);
      activeParticlePos = { x: 500 + Math.cos(ringAngle) * 230, y: 360 + Math.sin(ringAngle) * 210 };
    }
    else if (seconds < 2.5) {
      const t = (seconds - 2.2) / 0.3;
      wingDrawPct = 1.0; featherDrawPct = 1.0; bodyDrawPct = 1.0; fillOpacity = 1.0; particleAlpha = 1.0;
      ringAlpha = 0.85 * (1.0 - t * 0.5);
      breathingGlow = Math.sin(t * Math.PI) * 0.35;
      ringAngle = (Math.PI * 1.8) + (t * Math.PI * 0.4);
      activeParticlePos = { x: 500 + Math.cos(ringAngle) * 230, y: 360 + Math.sin(ringAngle) * 210 };
    }
    else if (seconds < 2.8) {
      const t = (seconds - 2.5) / 0.3;
      const unDraw = 1.0 - easeInOutCubic(t);
      wingDrawPct = unDraw; featherDrawPct = unDraw; bodyDrawPct = unDraw; fillOpacity = unDraw;
      particleAlpha = Math.max(0.4, 1.0 - t * 0.4);
      ringAlpha = (1.0 - t) * 0.3;
      isReversing = true;
      const idx = Math.floor(unDraw * (wingSamples.length - 1));
      activeParticlePos = wingSamples[Math.max(0, idx)];
    }
    else {
      const t = (seconds - 2.8) / 0.2;
      particleAlpha = 1.0 - t;
      activeParticlePos = wingSamples[0];
    }

    if (fillOpacity > 0.01) {
      ctx.save();
      ctx.globalAlpha = fillOpacity;

      ctx.beginPath();
      for (let i = 0; i < bodySamples.length; i++) {
        if (i === 0) ctx.moveTo(bodySamples[i].x, bodySamples[i].y);
        else ctx.lineTo(bodySamples[i].x, bodySamples[i].y);
      }
      ctx.closePath();

      const bodyGrad = ctx.createLinearGradient(500, 100, 500, 600);
      bodyGrad.addColorStop(0, '#FFFFFF');
      bodyGrad.addColorStop(0.3, '#F6F6F6');
      bodyGrad.addColorStop(1, '#A7A7A7');
      ctx.fillStyle = bodyGrad;
      ctx.shadowColor = 'rgba(76, 174, 255, ' + (0.18 + breathingGlow) + ')';
      ctx.shadowBlur = 18;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(eyeCenter.x, eyeCenter.y, eyeCenter.r, 0, Math.PI * 2);
      ctx.fillStyle = '#050505'; ctx.fill();

      ctx.beginPath();
      for (let i = 0; i < wingSamples.length; i++) {
        if (i === 0) ctx.moveTo(wingSamples[i].x, wingSamples[i].y);
        else ctx.lineTo(wingSamples[i].x, wingSamples[i].y);
      }
      ctx.closePath();

      const wingGrad = ctx.createLinearGradient(430, 340, 210, 640);
      wingGrad.addColorStop(0, '#DFF3FF');
      wingGrad.addColorStop(0.5, '#77C8FF');
      wingGrad.addColorStop(1, '#2B8EFF');
      ctx.fillStyle = wingGrad;
      ctx.shadowColor = 'rgba(76, 174, 255, ' + (0.25 + breathingGlow) + ')';
      ctx.shadowBlur = 24;
      ctx.fill();

      if (featherDrawPct > 0.01) {
        const fCount = Math.floor(featherSamples.length * featherDrawPct);
        if (fCount > 1) {
          ctx.beginPath();
          for (let i = 0; i < fCount; i++) {
            if (i === 0) ctx.moveTo(featherSamples[i].x, featherSamples[i].y);
            else ctx.lineTo(featherSamples[i].x, featherSamples[i].y);
          }
          ctx.strokeStyle = '#050505'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.stroke();
        }
      }
      ctx.restore();
    }

    ctx.save();
    if (wingDrawPct > 0.01) {
      const wCount = Math.floor(wingSamples.length * wingDrawPct);
      if (wCount > 1) {
        ctx.beginPath();
        for (let i = 0; i < wCount; i++) {
          if (i === 0) ctx.moveTo(wingSamples[i].x, wingSamples[i].y);
          else ctx.lineTo(wingSamples[i].x, wingSamples[i].y);
        }
        ctx.strokeStyle = '#77C8FF'; ctx.lineWidth = isReversing ? 2.5 : 4.0;
        ctx.lineCap = 'round'; ctx.shadowColor = '#4CAEFF'; ctx.shadowBlur = 18; ctx.stroke();
      }
    }

    if (bodyDrawPct > 0.01) {
      const bCount = Math.floor(bodySamples.length * bodyDrawPct);
      if (bCount > 1) {
        ctx.beginPath();
        for (let i = 0; i < bCount; i++) {
          if (i === 0) ctx.moveTo(bodySamples[i].x, bodySamples[i].y);
          else ctx.lineTo(bodySamples[i].x, bodySamples[i].y);
        }
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = isReversing ? 2.5 : 4.0;
        ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(76, 174, 255, 0.8)'; ctx.shadowBlur = 18; ctx.stroke();
      }
    }

    if (ringAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = ringAlpha;
      ctx.beginPath(); ctx.ellipse(500, 360, 230, 210, -0.08, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(76, 174, 255, ' + (ringAlpha * 0.6) + ')';
      ctx.lineWidth = 2.0; ctx.shadowColor = '#4CAEFF'; ctx.shadowBlur = 18; ctx.stroke();
      ctx.restore();
    }

    if (particleAlpha > 0.01) {
      drawEnergyParticle(ctx, activeParticlePos.x, activeParticlePos.y, particleAlpha);
    }

    ctx.restore();
    requestAnimationFrame(render);
  }

  function drawEnergyParticle(context, x, y, alpha) {
    context.save(); context.globalAlpha = alpha;
    const glowGrad = context.createRadialGradient(x, y, 0, x, y, 32);
    glowGrad.addColorStop(0, '#4CAEFF'); glowGrad.addColorStop(0.4, 'rgba(76, 174, 255, 0.4)'); glowGrad.addColorStop(1, 'rgba(76, 174, 255, 0)');
    context.fillStyle = glowGrad; context.beginPath(); context.arc(x, y, 32, 0, Math.PI * 2); context.fill();

    const coreGrad = context.createRadialGradient(x, y, 0, x, y, 8);
    coreGrad.addColorStop(0, '#FFFFFF'); coreGrad.addColorStop(0.6, '#DFF3FF'); coreGrad.addColorStop(1, '#4CAEFF');
    context.fillStyle = coreGrad; context.beginPath(); context.arc(x, y, 8, 0, Math.PI * 2); context.fill();
    context.restore();
  }

  requestAnimationFrame(render);
}

// Start Logo Preloader Canvas Immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPreloaderLogoCanvas);
} else {
  initPreloaderLogoCanvas();
}

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
  if (vid) { vid.play().catch(e => console.log(e)); }
  
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
   Telegram Contact Form Integration & Membership Lookup
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

    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'SENDING...';
    submitBtn.style.opacity = '0.7';
    submitBtn.disabled = true;

    // Telegram Bot Setup & Google Sheet Webhook
    const BOT_TOKEN = '8673149889:AAH6Md9MPqmz6UigMpcRuVxb480vDKgZ9kI';
    const CHAT_ID = '7833318325';
    const sheetUrl = 'https://script.google.com/macros/s/AKfycbxsxS1i1xrBdL_RQqeGG_fmTwLwvC-UFtRbHeQJtvGfl38BTPApljhlbIe0DjWNmN-C-Q/exec';

    try {
      let membershipPlan = 'FREE USER';

      // Step 1: Query Google Sheet Database for active subscription matching this Gmail
      try {
        const checkRes = await fetch(`${sheetUrl}?action=check_membership&email=${encodeURIComponent(email)}`);
        const checkData = await checkRes.json();
        if (checkData && checkData.plan && checkData.plan !== 'NONE') {
          membershipPlan = checkData.plan.toUpperCase();
        }
      } catch (checkErr) {
        console.warn('Membership lookup notice:', checkErr.message);
      }

      // Step 2: Format rich Telegram alert with Category, Email, Membership Plan, and Message
      const telegramMessage = `
<b>📬 NEW CONTACT MESSAGE</b>

<b>📧 Email:</b> ${email}
<b>⭐ Membership Plan:</b> <code>[${membershipPlan}]</code>
<b>📌 Category:</b> ${category}

<b>💬 Message:</b>
<i>${message}</i>
      `.trim();

      // Step 3: Send alert to Telegram Bot
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
        showToast(`Message sent! (Membership: ${membershipPlan})`, 'success');
        form.reset();
      } else {
        showToast('Error sending message. Please try again.', 'error');
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

/* ============================================================
   12. MOBILE HAMBURGER MENU
   ============================================================ */
function initMobileMenu() {
  const hamburger = document.querySelector('.nav-hamburger');
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link, .nav-cta');

  if (!hamburger || !navbar) return;

  hamburger.addEventListener('click', () => {
    navbar.classList.toggle('menu-open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('menu-open');
    });
  });
}

document.addEventListener('DOMContentLoaded', initMobileMenu);

/* ============================================================
   MEMBERSHIP PAYMENT & RAZORPAY INTEGRATION WITH BILLING TOGGLE
   ============================================================ */
let isYearlyBilling = false;
let selectedPlan = { name: 'PRO', amount: 299900, priceFormatted: '2,999', isYearly: false };

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('payment-modal');
  const modalBackdrop = document.getElementById('payment-modal-backdrop');
  const modalClose = document.getElementById('payment-modal-close');
  const paymentForm = document.getElementById('payment-form');

  const toggleBtn = document.getElementById('billing-toggle-btn');
  const monthlyLabel = document.getElementById('billing-monthly-label');
  const yearlyLabel = document.getElementById('billing-yearly-label');

  const planCards = [
    { id: 'plan-beginner', name: 'BEGINNER', priceId: 'price-beginner', periodId: 'period-beginner' },
    { id: 'plan-pro', name: 'PRO', priceId: 'price-pro', periodId: 'period-pro' },
    { id: 'plan-legend', name: 'LEGEND', priceId: 'price-legend', periodId: 'period-legend' }
  ];

  // Billing Toggle Switch Event
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isYearlyBilling = !isYearlyBilling;

      if (isYearlyBilling) {
        toggleBtn.classList.add('yearly');
        monthlyLabel.classList.remove('billing-label--active');
        yearlyLabel.classList.add('billing-label--active');
      } else {
        toggleBtn.classList.remove('yearly');
        monthlyLabel.classList.add('billing-label--active');
        yearlyLabel.classList.remove('billing-label--active');
      }

      // Update Card Displays
      planCards.forEach(cardInfo => {
        const cardEl = document.getElementById(cardInfo.id);
        const priceEl = document.getElementById(cardInfo.priceId);
        const periodEl = document.getElementById(cardInfo.periodId);

        if (cardEl && priceEl && periodEl) {
          if (isYearlyBilling) {
            priceEl.textContent = cardEl.getAttribute('data-yearly-display');
            periodEl.textContent = cardEl.getAttribute('data-yearly-period');
          } else {
            priceEl.textContent = cardEl.getAttribute('data-monthly-display');
            periodEl.textContent = cardEl.getAttribute('data-monthly-period');
          }
        }
      });
    });
  }

  // Wire Get Started Buttons
  planCards.forEach(cardInfo => {
    const cardEl = document.getElementById(cardInfo.id);
    if (cardEl) {
      const btn = cardEl.querySelector('.plan-cta');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const name = cardEl.getAttribute('data-plan');
          const amount = isYearlyBilling 
            ? Number(cardEl.getAttribute('data-yearly-amount')) 
            : Number(cardEl.getAttribute('data-monthly-amount'));
          const price = isYearlyBilling 
            ? cardEl.getAttribute('data-yearly-display') 
            : cardEl.getAttribute('data-monthly-display');

          openPaymentModal({
            name: name,
            amount: amount,
            price: price,
            isYearly: isYearlyBilling
          });
        });
      }
    }
  });

  function openPaymentModal(plan) {
    selectedPlan = plan;
    document.getElementById('modal-plan-badge').textContent = `${plan.name} PLAN (${plan.isYearly ? 'YEARLY (1 YEAR)' : 'MONTHLY (1 MONTH)'})`;
    document.getElementById('modal-plan-name').textContent = plan.name;
    document.getElementById('modal-plan-price').textContent = plan.price;
    
    const modalPeriod = modal.querySelector('.payment-modal-price .period');
    if (modalPeriod) {
      modalPeriod.textContent = plan.isYearly ? '/year' : '/month';
    }

    const activeView = document.getElementById('active-sub-view');
    if (activeView) activeView.style.display = 'none';
    const submitBtn = document.getElementById('payment-submit-btn');
    if (submitBtn) submitBtn.style.display = 'flex';

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closePaymentModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  if (modalClose) modalClose.addEventListener('click', closePaymentModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closePaymentModal);

  // Helper to ensure Razorpay SDK is loaded
  function ensureRazorpayLoaded() {
    return new Promise((resolve, reject) => {
      if (typeof window.Razorpay !== 'undefined') {
        return resolve();
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
      document.head.appendChild(script);
    });
  }

  // Form Submit -> Initiate Razorpay Payment (With Pre-Check for Active Subscriptions)
  if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('payment-email');
      const email = emailInput.value.trim();

      if (!email) {
        showToast('Please enter your Gmail address.', 'error');
        return;
      }

      const submitBtn = document.getElementById('payment-submit-btn');
      const activeView = document.getElementById('active-sub-view');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Checking membership status...</span>';

      const sheetUrl = 'https://script.google.com/macros/s/AKfycbxsxS1i1xrBdL_RQqeGG_fmTwLwvC-UFtRbHeQJtvGfl38BTPApljhlbIe0DjWNmN-C-Q/exec';

      try {
        // Step 0: Check if an active paid subscription already exists for this Gmail in Google Sheets
        try {
          const checkRes = await fetch(`${sheetUrl}?action=check_active_subscription&email=${encodeURIComponent(email)}`);
          const checkData = await checkRes.json();

          if (checkData && checkData.active && checkData.subscription) {
            const sub = checkData.subscription;
            const expDate = new Date(sub.expiryDate);
            const today = new Date();
            const timeDiff = expDate.getTime() - today.getTime();
            const daysDiff = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
            const hoursDiff = Math.max(0, Math.ceil(timeDiff / (1000 * 3600)) % 24);
            const timeRemainingText = daysDiff > 0 ? `${daysDiff} Days, ${hoursDiff} Hours Remaining` : 'Expires Today';

            // Calculate Day Bought display (e.g. 2026-07-31, Friday)
            let dayOfWeekStr = sub.dayBought || '';
            if (!dayOfWeekStr && sub.startDate) {
              try {
                const parts = sub.startDate.split('-');
                if (parts.length === 3) {
                  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  dayOfWeekStr = days[d.getDay()];
                }
              } catch (e) {}
            }
            const dateAndDayDisplay = sub.startDate + (dayOfWeekStr ? ` (${dayOfWeekStr})` : '');

            activeView.innerHTML = `
              <span class="active-sub-badge">ACTIVE SUBSCRIPTION FOUND</span>
              <div class="active-sub-row"><span class="label">Gmail Address:</span><span class="value">${sub.email}</span></div>
              <div class="active-sub-row"><span class="label">Active Plan:</span><span class="value">${sub.plan}</span></div>
              <div class="active-sub-row"><span class="label">Plan Price:</span><span class="value">${sub.price || '₹1 / month'}</span></div>
              <div class="active-sub-row"><span class="label">Date & Day Bought:</span><span class="value">${dateAndDayDisplay}</span></div>
              <div class="active-sub-row"><span class="label">Expiry Date:</span><span class="value">${sub.expiryDate}</span></div>
              <div class="active-sub-row"><span class="label">Time Remaining:</span><span class="value value--highlight">${timeRemainingText}</span></div>
              <div class="active-sub-notice">You already have an active subscription linked to this Gmail address! Payment checkout has been stopped so you are not double-charged.</div>
            `;
            activeView.style.display = 'flex';
            submitBtn.style.display = 'none';
            showToast(`Active subscription found for ${email}`, 'info');
            return; // Stop execution - DO NOT open Razorpay!
          }
        } catch (checkErr) {
          console.warn('Pre-checkout subscription check notice:', checkErr.message);
        }

        submitBtn.innerHTML = '<span>Opening Razorpay...</span>';
        await ensureRazorpayLoaded();

        let orderData = null;
        try {
          const orderRes = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: selectedPlan.amount,
              currency: 'INR',
              receipt: `rcpt_${Date.now()}`
            })
          });
          if (orderRes.ok) {
            orderData = await orderRes.json();
          }
        } catch (apiErr) {
          console.warn('Backend order creation notice, falling back to direct checkout:', apiErr.message);
        }

        closePaymentModal();

        // Open Razorpay Standard Checkout Modal with logo1.png and modern theme
        const logoUrl = window.location.origin + '/assets/images/logo1.png';
        const options = {
          key: (orderData && orderData.key_id) || 'rzp_live_TKASfdnAAW6hJu',
          amount: (orderData && orderData.amount) || selectedPlan.amount,
          currency: (orderData && orderData.currency) || 'INR',
          name: 'SparrowDevLabs',
          description: `${selectedPlan.name} Membership (${selectedPlan.isYearly ? '1 Year' : '1 Month'})`,
          image: logoUrl,
          prefill: {
            email: email
          },
          theme: {
            color: '#6d28d9',
            backdrop_color: 'rgba(10, 10, 18, 0.92)',
            hide_topbar: false
          },
          config: {
            display: {
              sequence: ['block.upi', 'block.card', 'block.netbanking'],
              preferences: {
                show_default_blocks: true
              }
            }
          },
          handler: async function (response) {
            // Payment Success -> Web Toast
            showToast(`🎉 Payment Successful! Your ${selectedPlan.name} membership has been activated.`, 'success');

            // Save to Google Sheet Database
            const sheetUrl = 'https://script.google.com/macros/s/AKfycbxsxS1i1xrBdL_RQqeGG_fmTwLwvC-UFtRbHeQJtvGfl38BTPApljhlbIe0DjWNmN-C-Q/exec';
            const now = new Date();
            const startDate = now.toISOString().split('T')[0];
            const expiry = new Date(now);
            expiry.setDate(expiry.getDate() + (selectedPlan.isYearly ? 365 : 30));
            const expiryDate = expiry.toISOString().split('T')[0];

            try {
              const queryString = `action=add_subscription&email=${encodeURIComponent(email)}&plan=${encodeURIComponent(selectedPlan.name + (selectedPlan.isYearly ? ' (YEARLY)' : ' (MONTHLY)'))}&startDate=${encodeURIComponent(startDate)}&expiryDate=${encodeURIComponent(expiryDate)}&paymentId=${encodeURIComponent(response.razorpay_payment_id || 'N/A')}&orderId=${encodeURIComponent(response.razorpay_order_id || 'N/A')}&status=ACTIVE&_t=${Date.now()}`;

              // 1. Un-blockable Image Beacon
              const img = new Image();
              img.src = `${sheetUrl}?${queryString}`;

              // 2. Backup Fetch API call
              fetch(`${sheetUrl}?${queryString}`, {
                method: 'GET',
                mode: 'no-cors'
              });
            } catch (sheetErr) {
              console.warn('Google Sheet log warning:', sheetErr.message);
            }
          },
          modal: {
            ondismiss: function () {
              showToast('Checkout cancelled by user.', 'info');
            }
          }
        };

        if (orderData && orderData.order_id) {
          options.order_id = orderData.order_id;
        }

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          const failMsg = (response.error && response.error.description) ? response.error.description : 'Transaction cancelled';
          showToast(`❌ Payment Failed: ${failMsg}`, 'error');
        });

        rzp.open();

      } catch (err) {
        showToast(`Checkout Error: ${err.message}`, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});
