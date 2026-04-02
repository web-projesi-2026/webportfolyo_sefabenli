/* ============================================================
   SEFA BENLİ PORTFOLIO — main.js
   ============================================================ */

/* ---------- NAVBAR: Scroll efekti ---------- */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

/* ---------- HAMBURGER MENÜ ---------- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    const isOpen = navLinks.classList.contains('open');
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    spans[1].style.opacity   = isOpen ? '0' : '';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    });
  });
}

/* ---------- TYPED TEXT ANIMASYONU (sadece index.html'de) ---------- */
const typedEl = document.getElementById('typedText');
if (typedEl) {
  const typedWords = [
    'Bilgisayar Programcısı',
    'Web Geliştirici',
    'Python Geliştiricisi',
    'Yazılım Öğrencisi',
    'Problem Çözücü'
  ];
  let wordIndex = 0, charIndex = 0, isDeleting = false;

  function typeEffect() {
    const currentWord = typedWords[wordIndex];
    if (!isDeleting) {
      typedEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(typeEffect, 1800);
        return;
      }
    } else {
      typedEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % typedWords.length;
      }
    }
    setTimeout(typeEffect, isDeleting ? 60 : 100);
  }
  setTimeout(typeEffect, 800);
}

/* ---------- SKILL BAR ANİMASYONU ---------- */
const skillsSection = document.querySelector('.skills');
if (skillsSection) {
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-fill').forEach(fill => {
          fill.style.width = fill.getAttribute('data-width') + '%';
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  skillObserver.observe(skillsSection);
}

/* ---------- SAYAÇ ANİMASYONU ---------- */
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target + '+'; clearInterval(timer); }
    else el.textContent = Math.floor(start);
  }, 16);
}

const aboutSection = document.querySelector('.about');
if (aboutSection) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach(counter => {
          animateCounter(counter, parseInt(counter.getAttribute('data-target')));
        });
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  counterObserver.observe(aboutSection);
}

/* ---------- FADE-IN ANİMASYONU ---------- */
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
  .fade-in-el { opacity:0; transform:translateY(30px); transition:opacity 0.6s ease,transform 0.6s ease; }
  .fade-in-visible { opacity:1 !important; transform:translateY(0) !important; }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
`;
document.head.appendChild(fadeStyle);

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('fade-in-visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card, .skills-category, .contact-item, .about-card-visual, .about-text').forEach(el => {
  el.classList.add('fade-in-el');
  fadeObserver.observe(el);
});

/* ---------- PROJE FİLTRELEME ---------- */
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('hidden', !match);
        if (match) card.style.animation = 'fadeInUp 0.4s ease forwards';
      });
    });
  });
}

/* ---------- İLETİŞİM FORMU ---------- */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gönder';
      btn.disabled = false;
      if (formSuccess) { formSuccess.classList.add('show'); setTimeout(() => formSuccess.classList.remove('show'), 5000); }
      contactForm.reset();
    }, 1500);
  });
}

/* ---------- SCROLL TO TOP ---------- */
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('visible', window.scrollY > 400));
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- PARALLAX: Arka plan şekilleri ---------- */
window.addEventListener('mousemove', (e) => {
  const shapes = document.querySelectorAll('.shape');
  if (!shapes.length) return;
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
  shapes.forEach((shape, i) => {
    const depth = (i + 1) * 12;
    shape.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
  });
});

/* ---------- SECTION BAŞLIK OBSERVER ---------- */
const headerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('anim-ready'); headerObserver.unobserve(entry.target); } });
}, { threshold: 0.4 });
document.querySelectorAll('.section-header').forEach(h => headerObserver.observe(h));

/* ---------- PROJE KARTI: 3D TILT ---------- */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const rotX = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    const rotY = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    card.style.transform = `translateY(-8px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    card.style.transition = 'transform 0.1s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease';
  });
});

/* ---------- SKILL TAG STAGGER ---------- */
const tagObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-tag').forEach((tag, i) => setTimeout(() => tag.classList.add('tag-visible'), i * 80));
      tagObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.skills-category').forEach(cat => tagObserver.observe(cat));

/* ---------- CONTACT ITEM SLIDE-IN ---------- */
const ciObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.contact-item').forEach((item, i) => setTimeout(() => item.classList.add('ci-visible'), i * 120));
      ciObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
const contactSection = document.querySelector('.contact');
if (contactSection) ciObserver.observe(contactSection);

/* ---------- STAT STAGGER ---------- */
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-item').forEach((item, i) => setTimeout(() => item.classList.add('stat-visible'), i * 100));
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
const aboutSec = document.querySelector('.about');
if (aboutSec) statObserver.observe(aboutSec);

/* ---------- BTN GLINT ---------- */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--gx', ((e.clientX - rect.left) / rect.width * 100) + '%');
    btn.style.setProperty('--gy', ((e.clientY - rect.top) / rect.height * 100) + '%');
  });
});

/* ---------- NAV LOGO HOVER ---------- */
const navLogo = document.querySelector('.nav-logo');
if (navLogo) {
  navLogo.addEventListener('mouseenter', () => { navLogo.style.transform = 'scale(1.08) rotate(-2deg)'; navLogo.style.transition = 'transform 0.3s cubic-bezier(.2,.8,.3,1)'; });
  navLogo.addEventListener('mouseleave', () => { navLogo.style.transform = ''; });
}

/* ---------- INFO ITEM HOVER ---------- */
document.querySelectorAll('.info-item').forEach(item => {
  item.addEventListener('mouseenter', () => { item.style.transform = 'translateY(-3px)'; item.style.boxShadow = '0 8px 24px rgba(110,64,201,0.12)'; item.style.borderColor = 'rgba(110,64,201,0.3)'; item.style.transition = 'all 0.3s ease'; });
  item.addEventListener('mouseleave', () => { item.style.transform = ''; item.style.boxShadow = ''; item.style.borderColor = ''; });
});

/* ===== SAYFA GEÇİŞ ANİMASYONU ===== */
const PageTransition = {
  init() {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || link.target === '_blank') return;
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const dest = this.href;
        document.body.classList.add('page-exit');
        setTimeout(() => { window.location.href = dest; }, 380);
      });
    });
  }
};

PageTransition.init();

/* ---------- NAVBAR: Oturum durumu ---------- */
(function () {
  const navAuth = document.querySelector('.nav-auth');
  if (!navAuth) return;

  // PHP endpoint'e göre yolu belirle (index.html = kök, pages/ = bir üst)
  const isPages = window.location.pathname.includes('/pages/');
  const base    = isPages ? '../backend/php/' : 'backend/php/';

  fetch(base + 'nav_session.php')
    .then(r => r.json())
    .then(data => {
      if (!data.logged_in) return; // Giriş yapılmamışsa default butonlar kalır

      // Çıkış formu action yolu
      const authPath = isPages ? '../backend/php/auth.php' : 'backend/php/auth.php';

      navAuth.innerHTML = `
        <div class="nav-user">
          <span class="nav-user-name">
            <i class="fas fa-user-circle"></i>
            ${data.name}
          </span>
          <form method="POST" action="${authPath}" style="margin:0">
            <input type="hidden" name="action" value="logout">
            <button type="submit" class="nav-btn-logout">
              <i class="fas fa-sign-out-alt"></i> Çıkış
            </button>
          </form>
        </div>
      `;
    })
    .catch(() => {}); // Hata olursa default butonlar kalır
})();
