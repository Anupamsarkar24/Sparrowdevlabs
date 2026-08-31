/* ============================================================
   NEXORA — Premium Interactive JS
   Awwwards-Level Animations & Interactions
   ============================================================ */

/* ============================================================
   RADIX / ANIMATE-UI PROGRESS PRELOADER ENGINE
   ============================================================ */
function initRadixProgressPreloader() {
  const preloader = document.getElementById('site-preloader');
  const indicator = document.getElementById('preloader-progress-indicator');
  const percentText = document.getElementById('preloader-percent-text');
  const statusText = document.getElementById('preloader-status-text');

  if (!preloader || !indicator) return;

  let progress = 0;
  let isDone = false;

  function updateProgress(value, status = '') {
    progress = Math.min(100, Math.max(0, value));
    indicator.style.transform = `translateX(-${100 - progress}%)`;
    if (percentText) percentText.textContent = `${Math.round(progress)}%`;
    if (statusText && status) statusText.textContent = status;

    if (progress >= 100 && !isDone) {
      isDone = true;
      if (statusText) statusText.textContent = 'READY';
      setTimeout(() => {
        preloader.classList.add('fade-out');
        document.body.classList.remove('loading');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 650);
      }, 350);
    }
  }

  // Smooth progressive stepped intervals (0 -> 25 -> 50 -> 75 -> 100)
  updateProgress(15, 'INITIALIZING');

  const stepTimer1 = setTimeout(() => { if (!isDone) updateProgress(35, 'LOADING ASSETS'); }, 200);
  const stepTimer2 = setTimeout(() => { if (!isDone) updateProgress(65, 'BUILDING UI'); }, 500);
  const stepTimer3 = setTimeout(() => { if (!isDone) updateProgress(85, 'OPTIMIZING'); }, 900);

  // Asset load listener
  function onReady() {
    clearTimeout(stepTimer1);
    clearTimeout(stepTimer2);
    clearTimeout(stepTimer3);
    updateProgress(100, 'COMPLETED');
  }

  if (document.readyState === 'complete') {
    setTimeout(onReady, 600);
  } else {
    window.addEventListener('load', () => {
      setTimeout(onReady, 400);
    });
  }

  // Safety failsafe
  setTimeout(onReady, 3500);
}

// Start immediately
initRadixProgressPreloader();

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
  initMutedHeroVideos();
});

/* Enforce 100% Silent Hero Video */
function initMutedHeroVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach(v => {
    v.muted = true;
    v.volume = 0;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
  });
}

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
   2. HERO SKY CANVAS — Procedural Fractal Noise Sky & Clouds
   ============================================================ */
function initHeroCanvas() {
  const canvas = document.getElementById('heroSkyCanvas') || document.getElementById('heroCanvas');
  if (!canvas) return;

  const heroSection = document.getElementById('hero');
  let gl = null;
  try {
    gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' }) ||
         canvas.getContext('experimental-webgl', { alpha: false, antialias: false });
  } catch (e) {
    gl = null;
  }

  let animId = null;
  let isVisible = true;
  let startTime = performance.now();
  let lastElapsed = 0;

  // IntersectionObserver to pause loop when not on screen
  if ('IntersectionObserver' in window && heroSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          startTime = performance.now() - (lastElapsed * 1000);
          if (gl) {
            renderGL();
          } else {
            render2D();
          }
        }
      });
    }, { threshold: 0.05 });
    observer.observe(heroSection);
  }

  // --- 1. WEBGL SHADER IMPLEMENTATION ---
  if (gl) {
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      // High quality 2D hash
      float hash(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      // Smooth 2D value noise with quintic interpolation
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      // Rotation matrix to prevent coordinate grid alignment
      const mat2 m2 = mat2(0.80, 0.60, -0.60, 0.80);

      // 6-Octave Fractal Brownian Motion (fBm)
      float fbm(vec2 p) {
        float f = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 6; i++) {
          f += amp * noise(p);
          p = m2 * p * 2.02 + vec2(1.7, 3.2);
          amp *= 0.5;
        }
        return f;
      }

      // Fully organic non-uniform cloud density with domain warping
      float cloudMap(vec2 p, float t) {
        // Natural wind drift
        vec2 wind = vec2(t * 0.05, t * 0.012);
        
        // 1st Domain Warp
        vec2 q = vec2(
          fbm(p + wind),
          fbm(p + vec2(5.2, 1.3) + wind * 0.85)
        );
        
        // 2nd Domain Warp for organic billows and swirls
        vec2 r = vec2(
          fbm(p + 2.4 * q + vec2(1.7, 9.2) + wind * 1.2),
          fbm(p + 2.4 * q + vec2(8.3, 2.8) - wind * 0.7)
        );
        
        // Base organic cloud density
        float f = fbm(p + 2.0 * r + wind * 0.4);
        
        // Add fine billowy detail
        float detail = fbm(p * 2.4 + wind * 1.3);
        f = mix(f, f * detail * 1.35, 0.35);
        
        return f;
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        
        float time = u_time;
        
        // Vibrant Royal / Sapphire Blue Sky Gradient
        vec3 skyZenith  = vec3(0.00, 0.32, 0.88); // Deep sapphire top
        vec3 skyMid     = vec3(0.02, 0.46, 0.95); // Vibrant royal azure mid
        vec3 skyHorizon = vec3(0.10, 0.64, 0.99); // Luminous bright sky blue lower
        
        float skyT = clamp(st.y, 0.0, 1.0);
        vec3 sky = mix(skyHorizon, skyMid, smoothstep(0.0, 0.55, skyT));
        sky = mix(sky, skyZenith, smoothstep(0.45, 1.0, skyT));
        
        // Projected cloud coordinates (stable in place)
        vec2 p = uv * 1.8;
        p.y *= 1.15;
        p += vec2(0.3, 0.1);
        
        // Calculate organic cloud noise
        float c = cloudMap(p, time);
        
        // Shape cloud density: organic, non-uniform clusters with fluffy centers and wispy edges
        float density = smoothstep(0.36, 0.72, c);
        density = pow(density, 1.25);
        
        // Secondary soft wisps in open sky
        float wisps = fbm(p * 1.5 + vec2(time * 0.03, 0.0));
        float wispDensity = smoothstep(0.48, 0.78, wisps) * 0.25;
        density = clamp(density + wispDensity, 0.0, 1.0);
        
        // Sunlight highlights and soft sky-tinted underside
        vec3 cloudSun   = vec3(1.0, 1.0, 1.0);
        vec3 cloudWhite = vec3(0.96, 0.98, 1.0);
        vec3 cloudShade = mix(vec3(0.68, 0.82, 0.96), skyMid, 0.25);
        
        float light = smoothstep(0.30, 0.80, c);
        vec3 cloudColor = mix(cloudShade, cloudWhite, light);
        cloudColor = mix(cloudColor, cloudSun, smoothstep(0.68, 1.0, light));
        
        // Blend clouds seamlessly over the vibrant sky
        vec3 finalColor = mix(sky, cloudColor, density * 0.96);
        
        // Subtle film grain
        float grain = (hash(gl_FragCoord.xy + fract(time * 0.03)) - 0.5) * 0.012;
        finalColor += grain;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const aPositionLocation = gl.getAttribLocation(program, 'a_position');
    const uResolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const uTimeLocation = gl.getUniformLocation(program, 'u_time');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const displayWidth = Math.floor(canvas.offsetWidth * dpr);
      const displayHeight = Math.floor(canvas.offsetHeight * dpr);
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      }
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function renderGL(now) {
      if (!isVisible) {
        animId = null;
        return;
      }

      const elapsed = ((now || performance.now()) - startTime) * 0.001;
      lastElapsed = elapsed;

      gl.useProgram(program);
      gl.enableVertexAttribArray(aPositionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(uTimeLocation, elapsed);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(renderGL);
    }
    renderGL();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }

  // --- 2. 2D CANVAS FALLBACK ---
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let W, H;
  const resize2D = () => {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  resize2D();
  window.addEventListener('resize', resize2D, { passive: true });

  function render2D(now) {
    if (!isVisible) {
      animId = null;
      return;
    }
    const t = ((now || performance.now()) - startTime) * 0.001;

    // Vibrant Royal Blue Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#0052db');
    skyGrad.addColorStop(0.5, '#0070f3');
    skyGrad.addColorStop(1, '#1890ff');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Procedural fluffy organic cloud puffs
    const puffs = [
      { x: 0.25, y: 0.40, r: 240, spd: 30 },
      { x: 0.45, y: 0.30, r: 190, spd: 35 },
      { x: 0.15, y: 0.55, r: 260, spd: 25 },
      { x: 0.60, y: 0.45, r: 180, spd: 32 },
      { x: 0.75, y: 0.25, r: 150, spd: 38 },
      { x: 0.35, y: 0.60, r: 220, spd: 28 },
      { x: 0.85, y: 0.50, r: 190, spd: 34 },
    ];

    puffs.forEach((p, idx) => {
      const cx = ((p.x * W + t * p.spd + idx * 50) % (W + 600)) - 300;
      const cy = p.y * H + Math.sin(idx + t * 0.8) * 20;
      const rad = p.r;

      const grad = ctx.createRadialGradient(cx - rad * 0.2, cy - rad * 0.2, 10, cx, cy, rad);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, 'rgba(245, 250, 255, 0.90)');
      grad.addColorStop(0.8, 'rgba(180, 215, 255, 0.45)');
      grad.addColorStop(1, 'rgba(0, 80, 220, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    });

    animId = requestAnimationFrame(render2D);
  }
  render2D();
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
  // Disabled to keep hero section static
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
  const hamburger = document.querySelector('.nav-hamburger, .nav-hamburger-btn');
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link, .nav-cta, .nav-talk-btn');

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
          const bonusTag = cardEl.querySelector('.yearly-bonus-tag');
          if (isYearlyBilling) {
            priceEl.textContent = cardEl.getAttribute('data-yearly-display');
            periodEl.textContent = cardEl.getAttribute('data-yearly-period');
            if (bonusTag) bonusTag.style.display = 'block';
          } else {
            priceEl.textContent = cardEl.getAttribute('data-monthly-display');
            periodEl.textContent = cardEl.getAttribute('data-monthly-period');
            if (bonusTag) bonusTag.style.display = 'none';
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

            let giftImgSrc = 'assets/images/giftbox-beginner.png';
            const planUpper = (sub.plan || '').toUpperCase();
            if (planUpper.includes('PRO')) giftImgSrc = 'assets/images/giftbox-pro.png';
            else if (planUpper.includes('LEGEND')) giftImgSrc = 'assets/images/giftbox-legend.png';

            activeView.innerHTML = `
              <span class="active-sub-badge">ACTIVE SUBSCRIPTION FOUND</span>
              <div class="active-sub-giftbox-container">
                <img src="${giftImgSrc}" alt="${sub.plan} Gift" class="active-sub-giftbox-img" />
              </div>
              <div class="active-sub-row"><span class="label">Gmail Address:</span><span class="value">${sub.email}</span></div>
              <div class="active-sub-row"><span class="label">Active Plan:</span><span class="value">${sub.plan}</span></div>
              <div class="active-sub-row"><span class="label">Plan Price:</span><span class="value">${sub.price || '₹999 / month'}</span></div>
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


/* ============================================================
   FEATURED PROJECTS INFINITE LOOPING 3-CARD CAROUSEL CONTROLLER
   ============================================================ */
function initFeaturedProjectsCarousel() {
  const container = document.getElementById('projects-carousel-container');
  const track = document.getElementById('projects-slider-track');
  const nextBtn = document.getElementById('proj-next');
  const prevBtn = document.getElementById('proj-prev');
  const dots = document.querySelectorAll('.proj-dot');
  
  if (!container || !track || !nextBtn || !prevBtn) return;

  let isAnimating = false;
  let activeDotIndex = 0;
  const totalOriginalCards = 4;

  function setCardWidths() {
    const containerWidth = container.offsetWidth;
    let visibleCards = 3;
    if (window.innerWidth <= 860) {
      visibleCards = 1;
    } else if (window.innerWidth <= 1100) {
      visibleCards = 2;
    }

    const gap = 20;
    const cardWidth = (containerWidth - (gap * (visibleCards - 1))) / visibleCards;
    
    const allCards = track.querySelectorAll('.project-showcase-card');
    allCards.forEach(card => {
      card.style.width = `${cardWidth}px`;
      card.style.flex = `0 0 ${cardWidth}px`;
    });

    return { cardWidth, gap };
  }

  function updateDots(index) {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function playCircleAnimation(btn) {
    btn.classList.remove('clicked');
    void btn.offsetWidth;
    btn.classList.add('clicked');
  }

  function slideNext() {
    if (isAnimating) return;
    isAnimating = true;
    playCircleAnimation(nextBtn);

    const { cardWidth, gap } = setCardWidths();
    const distance = cardWidth + gap;

    track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = `translateX(-${distance}px)`;

    activeDotIndex = (activeDotIndex + 1) % totalOriginalCards;
    updateDots(activeDotIndex);

    setTimeout(() => {
      const firstCard = track.firstElementChild;
      track.appendChild(firstCard);
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
      isAnimating = false;
    }, 460);
  }

  function slidePrev() {
    if (isAnimating) return;
    isAnimating = true;
    playCircleAnimation(prevBtn);

    const { cardWidth, gap } = setCardWidths();
    const distance = cardWidth + gap;

    const lastCard = track.lastElementChild;
    track.insertBefore(lastCard, track.firstElementChild);
    track.style.transition = 'none';
    track.style.transform = `translateX(-${distance}px)`;

    void track.offsetWidth; // Force layout recalculation

    track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = 'translateX(0)';

    activeDotIndex = (activeDotIndex - 1 + totalOriginalCards) % totalOriginalCards;
    updateDots(activeDotIndex);

    setTimeout(() => {
      isAnimating = false;
    }, 460);
  }

  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    slideNext();
  });

  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    slidePrev();
  });

  // Touch Swipe Support
  let startX = 0;
  let endX = 0;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    endX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    const diff = startX - endX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) slideNext();
      else slidePrev();
    }
    startX = 0;
    endX = 0;
  });

  window.addEventListener('resize', () => {
    setCardWidths();
  });

  // Run on start
  setCardWidths();
  updateDots(0);
}

document.addEventListener('DOMContentLoaded', initFeaturedProjectsCarousel);


/* ============================================================
   ANIMATE-UI GLOBAL CURSOR & CURSOR-FOLLOW (Ultra-Fast 0-Lag Engine)
   ============================================================ */
function initAnimateUiCursor() {
  if (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) {
    return;
  }

  const root = document.getElementById('animate-cursor-root');
  const pointer = document.getElementById('animate-cursor-pointer');
  const follow = document.getElementById('animate-cursor-follow');
  const badgeText = document.getElementById('animate-cursor-badge-text');

  if (!root || !pointer || !follow || !badgeText) return;

  const sideOffset = 15;
  const alignOffset = 5;

  let mouseX = -100;
  let mouseY = -100;
  let followX = -100;
  let followY = -100;
  let isVisible = false;

  // 1. Instantaneous Direct Mouse Tracker (Zero latency)
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      root.classList.add('visible');
      followX = mouseX + alignOffset;
      followY = mouseY + sideOffset;
    }

    pointer.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  }, { passive: true });

  // 2. Smooth Spring Physics for Trailing Badge (LERP = 0.28 for snappy natural follow)
  const lerp = 0.28;

  function renderFollow() {
    if (isVisible) {
      const targetX = mouseX + alignOffset;
      const targetY = mouseY + sideOffset;

      followX += (targetX - followX) * lerp;
      followY += (targetY - followY) * lerp;

      follow.style.transform = `translate3d(${followX}px, ${followY}px, 0)`;
    }
    requestAnimationFrame(renderFollow);
  }
  requestAnimationFrame(renderFollow);

  // 3. Fast Click State
  window.addEventListener('mousedown', () => {
    pointer.classList.add('clicking');
    follow.classList.add('clicking');
  }, { passive: true });

  window.addEventListener('mouseup', () => {
    pointer.classList.remove('clicking');
    follow.classList.remove('clicking');
  }, { passive: true });

  // 4. Window Focus / Boundary
  document.addEventListener('mouseleave', () => {
    isVisible = false;
    root.classList.remove('visible');
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    root.classList.add('visible');
  });

  // 5. Zero-Overhead Event Delegation for Hover State & Contextual Badge
  document.body.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, input, textarea, select, [role="button"], .project-showcase-card, .plan-card, .testimonial-glass-card, .service-col-card');
    if (target) {
      follow.classList.add('hovering');
      if (target.closest('.project-showcase-card')) {
        badgeText.textContent = 'Explore ↗';
      } else if (target.closest('.plan-card') || target.classList.contains('plan-cta')) {
        badgeText.textContent = 'Select ↗';
      } else if (target.classList.contains('cta-golden-btn') || target.classList.contains('nav-cta-btn')) {
        badgeText.textContent = "Let's Talk ↗";
      } else if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        badgeText.textContent = 'Type ✍';
      } else {
        badgeText.textContent = 'Designer';
      }
    }
  }, { passive: true });

  document.body.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a, button, input, textarea, select, [role="button"], .project-showcase-card, .plan-card, .testimonial-glass-card, .service-col-card');
    if (target) {
      follow.classList.remove('hovering');
      badgeText.textContent = 'Designer';
    }
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', initAnimateUiCursor);
