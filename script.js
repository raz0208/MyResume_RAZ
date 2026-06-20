/* =========================================================================
   REZA AZARI AGHOUIEH — PORTFOLIO SCRIPT
   ========================================================================= */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     1. Footer year
  --------------------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     2. Mobile nav toggle
  --------------------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu after a link is tapped (mobile)
    primaryNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        primaryNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------------------
     3. Scroll-reveal
  --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => revealObserver.observe(el));

    // Language bars fill once their section scrolls into view
    const langList = document.querySelector('.lang-list');
    if (langList) {
      const langObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              langObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      langObserver.observe(langList);
    }
  } else {
    // No IntersectionObserver support, or motion is reduced: show everything immediately
    revealEls.forEach((el) => el.classList.add('is-visible'));
    const langList = document.querySelector('.lang-list');
    if (langList) langList.classList.add('is-visible');
  }

  /* ---------------------------------------------------------------------
     4. Hero semantic-graph canvas
  --------------------------------------------------------------------- */
  const canvas = document.getElementById('graph-canvas');

  if (canvas) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.closest('.hero');

    const LABELS = ['RAG', 'Embeddings', 'Neo4j', 'Transformers', 'Vector DB', 'NLP', 'PyTorch', 'Docker'];
    const NODE_COUNT = 22;
    const LINK_DISTANCE = 170;
    const SPEED = prefersReducedMotion ? 0 : 0.18;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes = [];
    let rafId = null;
    let running = true;

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function buildNodes() {
      nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-SPEED, SPEED),
        vy: rand(-SPEED, SPEED),
        r: rand(1.6, 3.2),
        label: i < LABELS.length ? LABELS[i] : null,
      }));
    }

    function resize() {
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      // Update positions
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      // Draw links between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DISTANCE) {
            const opacity = (1 - dist / LINK_DISTANCE) * 0.35;
            ctx.strokeStyle = `rgba(94, 234, 212, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes + labels
      ctx.font = '500 11px "JetBrains Mono", monospace';
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.label ? 'rgba(240, 180, 41, 0.9)' : 'rgba(94, 234, 212, 0.55)';
        ctx.fill();

        if (n.label) {
          ctx.fillStyle = 'rgba(232, 237, 242, 0.55)';
          ctx.fillText(n.label, n.x + 8, n.y + 4);
        }
      });

      if (running) rafId = requestAnimationFrame(step);
    }

    resize();
    step();

    window.addEventListener('resize', () => {
      cancelAnimationFrame(rafId);
      resize();
      if (running) rafId = requestAnimationFrame(step);
    });

    // Pause the animation when the hero is off-screen to save CPU/battery
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver(([entry]) => {
        running = entry.isIntersecting;
        if (running) {
          rafId = requestAnimationFrame(step);
        } else {
          cancelAnimationFrame(rafId);
        }
      });
      heroObserver.observe(hero);
    }
  }

  /* ---------------------------------------------------------------------
     5. Call-me modal
  --------------------------------------------------------------------- */
  const callBtn = document.getElementById('call-btn');
  const callModalBackdrop = document.getElementById('call-modal-backdrop');
  const callModalClose = document.getElementById('call-modal-close');
  const copyNumberBtn = document.getElementById('copy-number-btn');
  const copyConfirm = document.getElementById('copy-confirm');
  const PHONE_NUMBER = '+39 375 191 4767';

  function openCallModal() {
    callModalBackdrop.hidden = false;
    callModalClose.focus();
    document.addEventListener('keydown', onModalKeydown);
  }

  function closeCallModal() {
    callModalBackdrop.hidden = true;
    copyConfirm.textContent = '';
    callBtn.focus();
    document.removeEventListener('keydown', onModalKeydown);
  }

  function onModalKeydown(e) {
    if (e.key === 'Escape') closeCallModal();
  }

  if (callBtn && callModalBackdrop) {
    callBtn.addEventListener('click', openCallModal);
    callModalClose.addEventListener('click', closeCallModal);
    callModalBackdrop.addEventListener('click', (e) => {
      if (e.target === callModalBackdrop) closeCallModal();
    });
  }

  if (copyNumberBtn) {
    copyNumberBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(PHONE_NUMBER);
        copyConfirm.textContent = 'Copied to clipboard.';
      } catch (err) {
        copyConfirm.textContent = PHONE_NUMBER; // fallback: show the number to copy manually
      }
    });
  }

  /* ---------------------------------------------------------------------
     6. Contact form
  --------------------------------------------------------------------- */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const TARGET_EMAIL = 'raz0208@gmail.com';

  function setFieldError(fieldId, message) {
    const row = document.getElementById(fieldId).closest('.form-row');
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (message) {
      row.classList.add('has-error');
      errorEl.textContent = message;
    } else {
      row.classList.remove('has-error');
      errorEl.textContent = '';
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      let valid = true;

      if (!name) {
        setFieldError('name', 'Add your name.');
        valid = false;
      } else {
        setFieldError('name', '');
      }

      if (!email) {
        setFieldError('email', 'Add your email.');
        valid = false;
      } else if (!isValidEmail(email)) {
        setFieldError('email', 'That email address doesn\'t look right.');
        valid = false;
      } else {
        setFieldError('email', '');
      }

      if (!message) {
        setFieldError('message', 'Add a short message.');
        valid = false;
      } else {
        setFieldError('message', '');
      }

      if (!valid) {
        status.textContent = '';
        return;
      }

      const subject = encodeURIComponent(`Portfolio contact from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      const mailtoLink = `mailto:${TARGET_EMAIL}?subject=${subject}&body=${body}`;

      status.textContent = 'Opening your email client…';
      window.location.href = mailtoLink;

      form.reset();
      window.setTimeout(() => {
        status.textContent = 'If nothing opened, email raz0208@gmail.com directly.';
      }, 1800);
    });
  }
})();
