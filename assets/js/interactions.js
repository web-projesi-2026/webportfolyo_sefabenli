/* ================================================================
   interactions.js  —  v3  FULL REWRITE
   10 Somut Etkileşim:
   1.  Dark/Light Mode Toggle
   2.  Navbar 3D Perspective Hover
   3.  Magnetic Custom Cursor
   4.  Scroll Progress Bar
   5.  Particle Burst on Click
   6.  Smart Input Tooltip
   7.  Form Field Validation Glow
   8.  Card 3D Tilt
   9.  Staggered Section Reveal
   10. Scroll Spy (aktif nav link)
   ================================================================ */

(function () {
  'use strict';

  /* ===============================================================
     YARDIMCI
     =============================================================== */
  function qs(sel, ctx)  { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

  /* ===============================================================
     1. DARK / LIGHT MODE
     =============================================================== */
  var Theme = {
    KEY: 'sb-theme',
    init: function () {
      // Toggle butonu — nav-auth içine ekle (taşma olmaz)
      var navAuth = qs('.nav-auth');
      if (navAuth) {
        var btn = document.createElement('button');
        btn.id = 'themeToggle';
        btn.setAttribute('aria-label', 'Tema değiştir');
        btn.innerHTML =
          '<div class="toggle-track">' +
            '<div class="toggle-stars"></div>' +
            '<div class="toggle-clouds"></div>' +
            '<div class="toggle-orb"></div>' +
          '</div>';
        btn.addEventListener('click', function () { Theme.toggle(); });
        navAuth.appendChild(btn);   // ← appendChild: en sona ekle, taşmaz
      }
      // Kayıtlı tercih
      var saved = localStorage.getItem(this.KEY);
      if (saved === 'light') document.body.classList.add('light-mode');
    },
    toggle: function () {
      var isLight = document.body.classList.toggle('light-mode');
      localStorage.setItem(this.KEY, isLight ? 'light' : 'dark');
    }
  };

  /* ===============================================================
     2. NAVBAR 3D HOVER
     =============================================================== */
  var Nav3D = {
    init: function () {
      var navLinks = qs('#navLinks');
      if (!navLinks) return;

      navLinks.style.position = 'relative';
      var spotlight = document.createElement('div');
      spotlight.className = 'nav-3d-spotlight';
      navLinks.insertBefore(spotlight, navLinks.firstChild);

      var links = qsa('a', navLinks);
      links.forEach(function (link) {
        link.addEventListener('mouseenter', function () {
          navLinks.classList.add('spotlight-on');
          var nr = navLinks.getBoundingClientRect();
          var lr = link.getBoundingClientRect();
          spotlight.style.left  = (lr.left - nr.left - 12) + 'px';
          spotlight.style.width = (lr.width + 24) + 'px';
        });
        link.addEventListener('mousemove', function (e) {
          var r  = link.getBoundingClientRect();
          var dx = (e.clientX - r.left - r.width / 2)  / (r.width / 2);
          var dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
          link.style.transform  = 'perspective(380px) rotateX(' + (-dy*5) + 'deg) rotateY(' + (dx*9) + 'deg) translateZ(6px)';
          link.style.transition = 'color var(--transition)';
        });
        link.addEventListener('mouseleave', function () {
          navLinks.classList.remove('spotlight-on');
          link.style.transform  = '';
          link.style.transition = 'color var(--transition), transform 0.45s cubic-bezier(.2,.8,.3,1)';
        });
      });

      // Container hafif tilt — sadece desktop
      if (window.innerWidth > 768) {
        var nc = qs('.nav-container');
        if (nc) {
          nc.addEventListener('mousemove', function (e) {
            var r  = nc.getBoundingClientRect();
            var dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
            nc.style.transform  = 'perspective(1400px) rotateY(' + (dx * 1.2) + 'deg)';
            nc.style.transition = 'transform 0.12s ease';
          });
          nc.addEventListener('mouseleave', function () {
            nc.style.transform  = '';
            nc.style.transition = 'transform 0.45s cubic-bezier(.2,.8,.3,1)';
          });
        }
      }
    }
  };

  /* ===============================================================
     3. MAGNETIC CUSTOM CURSOR
     =============================================================== */
  var Cursor = {
    ring: null, dot: null,
    mx: 0, my: 0, rx: 0, ry: 0,
    init: function () {
      if (window.matchMedia('(hover: none)').matches) return;
      if (window.innerWidth <= 768) return;

      this.ring = document.createElement('div'); this.ring.id = 'cursorRing';
      this.dot  = document.createElement('div'); this.dot.id  = 'cursorDot';
      document.body.appendChild(this.ring);
      document.body.appendChild(this.dot);

      var self = this;
      document.addEventListener('mousemove', function (e) {
        self.mx = e.clientX; self.my = e.clientY;
        self.dot.style.transform = 'translate(calc(-50% + ' + e.clientX + 'px), calc(-50% + ' + e.clientY + 'px))';
      });
      document.addEventListener('mousedown', function () {
        self.ring.classList.add('cursor-click');
      });
      document.addEventListener('mouseup', function () {
        self.ring.classList.remove('cursor-click');
      });
      this.bindHover();
      this.animate();
    },
    bindHover: function () {
      var self = this;

      // Hover selector — hangi elementler ring'i büyütür
      var hoverSel = 'a, button, .btn, .filter-btn, .skill-tag, .social-btn, .scroll-top, .auth-submit, .social-auth-btn';

      // Magnetic selector — sadece küçük/tıklanabilir elementlerde manyetik efekt
      var magnetSel = 'a, button, .btn, .auth-submit, .social-auth-btn, .filter-btn';

      // Büyük kart sınıfları — sadece ring büyür, manyetik YOK
      var cardSel   = '.project-card, .service-card, .blog-card, .skills-category';

      // Event delegation: document'te dinle, DOM'a sonradan eklenen elementler de yakalanır
      document.addEventListener('mouseover', function (e) {
        var el = e.target;

        // Kart içinde mi?
        if (el.closest(cardSel)) {
          self.ring.classList.add('cursor-hover');
          return;
        }
        // Hover elementi mi?
        if (el.closest(hoverSel)) {
          self.ring.classList.add('cursor-hover');
        }
        // Input / textarea — ring gizle
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
          self.ring.style.opacity = '0';
        }
      });

      document.addEventListener('mouseout', function (e) {
        var el = e.target;
        if (el.closest(cardSel) || el.closest(hoverSel)) {
          self.ring.classList.remove('cursor-hover');
        }
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
          self.ring.style.opacity = '1';
        }
      });

      // Manyetik efekt — sadece magnetSel elementleri için, delegation ile
      document.addEventListener('mousemove', function (e) {
        var target = e.target.closest ? e.target.closest(magnetSel) : null;

        // Önceki elementi temizle
        if (self._lastMagnet && self._lastMagnet !== target) {
          self._lastMagnet.style.transform  = '';
          self._lastMagnet.style.transition = 'transform 0.35s cubic-bezier(.2,.8,.3,1)';
          self._lastMagnet = null;
        }

        if (target && !target.closest(cardSel)) {
          var r  = target.getBoundingClientRect();
          var dx = (e.clientX - r.left - r.width  / 2) * 0.18;
          var dy = (e.clientY - r.top  - r.height / 2) * 0.18;
          target.style.transform  = 'translate(' + dx + 'px,' + dy + 'px)';
          target.style.transition = 'transform 0.12s cubic-bezier(.2,.8,.3,1)';
          self._lastMagnet = target;
        }
      });
    },
    animate: function () {
      var self = this;
      var lerp = function (a, b, t) { return a + (b - a) * t; };
      (function tick() {
        self.rx = lerp(self.rx, self.mx, 0.11);
        self.ry = lerp(self.ry, self.my, 0.11);
        self.ring.style.transform = 'translate(calc(-50% + ' + self.rx + 'px), calc(-50% + ' + self.ry + 'px))';
        requestAnimationFrame(tick);
      })();
    }
  };

  /* ===============================================================
     4. SCROLL PROGRESS BAR
     =============================================================== */
  var ScrollBar = {
    bar: null,
    init: function () {
      this.bar = document.createElement('div');
      this.bar.id = 'scrollProgress';
      document.body.insertBefore(this.bar, document.body.firstChild);
      var self = this;
      window.addEventListener('scroll', function () { self.update(); }, { passive: true });
      this.update();
    },
    update: function () {
      var st  = window.scrollY;
      var max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (max <= 0) { this.bar.style.width = '0%'; return; }
      var pct = Math.min(st / max * 100, 100);
      this.bar.style.width = pct + '%';
      pct > 0.5 ? this.bar.classList.add('has-progress') : this.bar.classList.remove('has-progress');
    }
  };

  /* ===============================================================
     5. PARTICLE BURST
     =============================================================== */
  var Particles = {
    colors: ['#6e40c9','#a78bfa','#3b82f6','#8b5cf6','#c084fc','#60a5fa','#e879f9','#38bdf8'],
    init: function () {
      var self = this;
      document.addEventListener('click', function (e) {
        if (e.target.id === 'scrollProgress') return;
        self.burst(e.clientX, e.clientY);
        self.ripple(e.clientX, e.clientY);
      });
    },
    burst: function (x, y) {
      var N = 9;
      for (var i = 0; i < N; i++) {
        var p = document.createElement('div');
        p.className = 'click-particle';
        var sz = Math.random() * 7 + 3;
        p.style.cssText = [
          'width:'  + sz + 'px',
          'height:' + sz + 'px',
          'left:'   + x  + 'px',
          'top:'    + y  + 'px',
          'background:' + this.colors[Math.floor(Math.random() * this.colors.length)]
        ].join(';');
        var angle = (i / N) * 360 + Math.random() * 28;
        var dist  = Math.random() * 65 + 30;
        var rad   = angle * Math.PI / 180;
        var dur   = (Math.random() * 0.3 + 0.45).toFixed(2);
        p.style.setProperty('--vx', (Math.cos(rad) * dist) + 'px');
        p.style.setProperty('--vy', (Math.sin(rad) * dist) + 'px');
        p.style.setProperty('--dur', dur + 's');
        document.body.appendChild(p);
        setTimeout(function (el) { el.remove(); }, parseFloat(dur) * 1000 + 80, p);
      }
    },
    ripple: function (x, y) {
      var r = document.createElement('div');
      r.className = 'click-ripple';
      r.style.cssText = 'width:34px;height:34px;left:' + x + 'px;top:' + y + 'px';
      document.body.appendChild(r);
      setTimeout(function () { r.remove(); }, 560);
    }
  };

  /* ===============================================================
     6. SMART INPUT TOOLTIP
     Odaklandığında input üstünde ipucu balonu gösterir
     =============================================================== */
  var InputTooltip = {
    tips: {
      'email':     '📧 Geçerli bir e-posta adresi girin',
      'password':  '🔒 En az 8 karakter, büyük harf ve rakam',
      'password_confirm': '🔒 Şifrelerini eşleştir',
      'first_name':'👤 Adınızı girin',
      'last_name': '👤 Soyadınızı girin',
      'name':      '👤 Adınızı girin',
      'message':   '💬 Mesajınızı detaylı yazın',
      'subject':   '📌 Konu başlığı girin'
    },
    init: function () {
      var self = this;
      qsa('.input-wrap input, .form-group input, .form-group textarea').forEach(function (inp) {
        var name = inp.name || inp.type || inp.id || '';
        var tip  = self.tips[name] || null;
        if (!tip) return;

        var wrap = inp.closest('.input-wrap') || inp.parentElement;
        if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';

        var tt = document.createElement('span');
        tt.className = 'input-tooltip';
        tt.textContent = tip;
        wrap.appendChild(tt);

        inp.addEventListener('focus', function () { wrap.classList.add('tip-active'); });
        inp.addEventListener('blur',  function () { wrap.classList.remove('tip-active'); });
      });
    }
  };

  /* ===============================================================
     7. FORM FIELD VALIDATION GLOW
     Yazarken anlık renk geri bildirimi
     =============================================================== */
  var FieldValidation = {
    init: function () {
      // Email validation
      qsa('input[type="email"]').forEach(function (inp) {
        var wrap = inp.closest('.input-wrap') || inp.parentElement;
        FieldValidation.addCheck(wrap);
        inp.addEventListener('input', function () {
          var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value);
          wrap.classList.toggle('field-valid',   ok && inp.value.length > 0);
          wrap.classList.toggle('field-invalid', !ok && inp.value.length > 0);
          var chk = wrap.querySelector('.field-check');
          if (chk) chk.innerHTML = (ok && inp.value.length) ? '<i class="fas fa-check"></i>' : (inp.value.length ? '<i class="fas fa-times"></i>' : '');
        });
      });

      // Text/name inputs
      qsa('input[type="text"]').forEach(function (inp) {
        var wrap = inp.closest('.input-wrap') || inp.parentElement;
        FieldValidation.addCheck(wrap);
        inp.addEventListener('input', function () {
          var ok = inp.value.trim().length >= 2;
          wrap.classList.toggle('field-valid',   ok);
          wrap.classList.toggle('field-invalid', !ok && inp.value.length > 0);
          var chk = wrap.querySelector('.field-check');
          if (chk) chk.innerHTML = ok ? '<i class="fas fa-check"></i>' : (inp.value.length ? '<i class="fas fa-times"></i>' : '');
        });
      });

      // Password confirm match
      var pw1 = qs('#pwInput');
      var pw2 = qs('#pwConfirm');
      if (pw1 && pw2) {
        var wrap2 = pw2.closest('.input-wrap') || pw2.parentElement;
        FieldValidation.addCheck(wrap2);
        function checkMatch() {
          var ok = pw2.value.length > 0 && pw1.value === pw2.value;
          wrap2.classList.toggle('field-valid',   ok);
          wrap2.classList.toggle('field-invalid', !ok && pw2.value.length > 0);
          var chk = wrap2.querySelector('.field-check');
          if (chk) chk.innerHTML = (pw2.value.length > 0) ? (ok ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>') : '';
        }
        pw2.addEventListener('input', checkMatch);
        pw1.addEventListener('input', checkMatch);
      }
    },
    addCheck: function (wrap) {
      if (!wrap || wrap.querySelector('.field-check')) return;
      var span = document.createElement('span');
      span.className = 'field-check';
      wrap.appendChild(span);
    }
  };

  /* ===============================================================
     8. CARD 3D TILT
     Project, service, blog, skills kartları
     =============================================================== */
  var CardTilt = {
    init: function () {
      var sel = '.project-card, .service-card, .blog-card, .skills-category';
      qsa(sel).forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
          var r   = card.getBoundingClientRect();
          var rx  = ((e.clientY - r.top)  / r.height - 0.5) * -10;
          var ry  = ((e.clientX - r.left) / r.width  - 0.5) *  10;
          card.classList.remove('tilt-reset');
          card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(4px)';
        });
        card.addEventListener('mouseleave', function () {
          card.classList.add('tilt-reset');
          card.style.transform = '';
          setTimeout(function () { card.classList.remove('tilt-reset'); }, 500);
        });
      });
    }
  };

  /* ===============================================================
     9. STAGGERED SECTION REVEAL
     Elemanlara .reveal-el class'ı ekler, IntersectionObserver ile açar
     =============================================================== */
  var Reveal = {
    init: function () {
      var targets = qsa([
        '.project-card', '.service-card', '.blog-card',
        '.skills-category', '.contact-item', '.stat-item',
        '.info-item', '.section-header', '.step-item',
        '.asf-item', '.about-card-visual', '.about-text',
        '.auth-side-steps .step-item', '.auth-side-features .asf-item'
      ].join(','));

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      targets.forEach(function (el, i) {
        // Sadece daha önce reveal-el eklenmemişse
        if (!el.classList.contains('reveal-el')) {
          el.classList.add('reveal-el');
          // Stagger delay: her element biraz sonra açılır
          el.style.transitionDelay = (i % 8) * 0.07 + 's';
          io.observe(el);
        }
      });
    }
  };

  /* ===============================================================
     10. SCROLL SPY — Aktif bölüme göre nav link vurgular
     =============================================================== */
  var ScrollSpy = {
    init: function () {
      // Sadece index.html'de section'lar var
      var sections  = qsa('section[id]');
      var navLinks  = qsa('.nav-links a');
      if (!sections.length || !navLinks.length) return;

      // Animasyonlu alt çizgi pill
      var navList = qs('.nav-links');
      if (navList) {
        navList.style.position = 'relative';
        var pill = document.createElement('div');
        pill.className = 'nav-active-pill';
        navList.appendChild(pill);
      }

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id   = entry.target.id;
          navLinks.forEach(function (link) {
            var href = link.getAttribute('href') || '';
            var match = href === '#' + id || href.endsWith('index.html') && id === 'hero';
            link.classList.toggle('spy-active', match);
            // Pill konumlandır
            if (match && navList) {
              var nr = navList.getBoundingClientRect();
              var lr = link.getBoundingClientRect();
              pill.style.left  = (lr.left - nr.left) + 'px';
              pill.style.width = lr.width + 'px';
            }
          });
        });
      }, { threshold: 0.4 });

      sections.forEach(function (sec) { io.observe(sec); });
    }
  };

  /* ===============================================================
     BOOT
     =============================================================== */
  function boot() {
    Theme.init();
    Nav3D.init();
    Cursor.init();
    ScrollBar.init();
    Particles.init();
    InputTooltip.init();
    FieldValidation.init();
    CardTilt.init();
    Reveal.init();
    ScrollSpy.init();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();

})();
