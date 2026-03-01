/* =====================================================
   JARIN RAKSA OY – MAIN.JS
   ===================================================== */

'use strict';

/* ---------- NAVIGAATIO: SCROLLED-TILA ---------- */
(function initScrolledHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ---------- HAMPURILAISVALIKKO ---------- */
(function initHamburger() {
  const btn  = document.querySelector('.hamburger');
  const menu = document.querySelector('.nav-menu');
  if (!btn || !menu) return;

  function openMenu() {
    btn.classList.add('open');
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Sulje valikko');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    btn.classList.remove('open');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Avaa valikko');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function () {
    const isOpen = btn.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Sulje kun klikataan linkkiä
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Sulje Escape-näppäimellä
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.classList.contains('open')) {
      closeMenu();
      btn.focus();
    }
  });

  // Sulje kun klikataan ulkopuolelle
  document.addEventListener('click', function (e) {
    if (
      btn.classList.contains('open') &&
      !menu.contains(e.target) &&
      !btn.contains(e.target)
    ) {
      closeMenu();
    }
  });
})();


/* ---------- SMOOTH SCROLL ANKKURILINKEILLE ---------- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = document.querySelector('.site-header')
        ? document.querySelector('.site-header').offsetHeight
        : 70;

      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();


/* ---------- SCROLL-ANIMAATIOT (IntersectionObserver) ---------- */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  // Kunnioita käyttäjän liikeasetuksia
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReduced) {
    elements.forEach(function (el) {
      el.classList.add('in-view');
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Porrastettu animaatio korttiryhmissä
          const siblings = Array.from(
            entry.target.parentElement.querySelectorAll('[data-animate]')
          );
          const index = siblings.indexOf(entry.target);
          const delay = Math.min(index * 80, 320);

          setTimeout(function () {
            entry.target.classList.add('in-view');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ---------- AKTIIVINEN NAV-LINKKI SCROLLIN MUKAAN ---------- */
(function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const headerHeight = document.querySelector('.site-header')
    ? document.querySelector('.site-header').offsetHeight
    : 70;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      });
    },
    {
      rootMargin: '-' + (headerHeight + 20) + 'px 0px -60% 0px',
      threshold: 0,
    }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();


/* ---------- TARJOUSPYYNTÖLOMAKE ---------- */
(function initForm() {
  const form      = document.getElementById('tarjouspyynto-lomake');
  const viesti    = document.getElementById('form-viesti');
  const submitBtn = document.getElementById('submit-btn');
  if (!form || !viesti || !submitBtn) return;

  const btnText = submitBtn.querySelector('.btn-text');

  function setLoading(loading) {
    submitBtn.disabled = loading;
    if (btnText) {
      btnText.textContent = loading ? 'Lähetetään...' : 'Lähetä tarjouspyyntö';
    }
    submitBtn.style.opacity = loading ? '0.7' : '1';
    submitBtn.style.cursor  = loading ? 'not-allowed' : 'pointer';
  }

  function showViesti(type, text) {
    viesti.textContent = text;
    viesti.className   = 'form-viesti ' + type;

    // Scroll viestin luo
    setTimeout(function () {
      viesti.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    // Piilota onnistumisviesti 8 sekunnin kuluttua
    if (type === 'success') {
      setTimeout(function () {
        viesti.className = 'form-viesti';
        viesti.textContent = '';
      }, 8000);
    }
  }

  // Kenttäkohtainen validointi
  function validateField(field) {
    const value = field.value.trim();
    field.classList.remove('field-error');

    if (field.hasAttribute('required') && !value) {
      field.classList.add('field-error');
      return false;
    }

    if (field.type === 'email' && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        field.classList.add('field-error');
        return false;
      }
    }

    if (field.type === 'tel' && value) {
      const telPattern = /^[\d\s\+\-\(\)]{7,}$/;
      if (!telPattern.test(value)) {
        field.classList.add('field-error');
        return false;
      }
    }

    return true;
  }

  // Live-validointi blur-tapahtumat
  form.querySelectorAll('.form-input').forEach(function (field) {
    field.addEventListener('blur', function () {
      validateField(field);
    });

    field.addEventListener('input', function () {
      if (field.classList.contains('field-error')) {
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Validoi kaikki pakolliset kentät
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(function (field) {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    if (!isValid) {
      showViesti('error', 'Täytä kaikki pakolliset kentät ennen lähettämistä.');
      // Scroll ensimmäiseen virhekenttään
      const firstError = form.querySelector('.field-error');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    setLoading(true);
    viesti.className   = 'form-viesti';
    viesti.textContent = '';

    try {
      const data     = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        showViesti(
          'success',
          'Tarjouspyyntö lähetetty. Otamme yhteyttä pian.'
        );
        form.reset();
        form.querySelectorAll('.field-error').forEach(function (el) {
          el.classList.remove('field-error');
        });
      } else {
        const json = await response.json().catch(function () { return {}; });
        if (json.errors) {
          const msg = json.errors.map(function (err) { return err.message; }).join(', ');
          showViesti('error', 'Lähetys epäonnistui: ' + msg);
        } else {
          showViesti(
            'error',
            'Lähetys epäonnistui. Soita meille: 040 0450902'
          );
        }
      }
    } catch (err) {
      showViesti(
        'error',
        'Verkkovirhe. Tarkista yhteytesi ja yritä uudelleen.'
      );
    } finally {
      setLoading(false);
    }
  });
})();


/* ---------- KENTTÄVIRHE-TYYLI (CSS lisäys JS:stä) ---------- */
(function injectFieldErrorStyle() {
  const style = document.createElement('style');
  style.textContent =
    '.form-input.field-error {' +
    '  border-color: #ef4444;' +
    '  box-shadow: 0 0 0 3px rgba(239,68,68,.15);' +
    '}';
  document.head.appendChild(style);
})();


/* ---------- GALLERIARUUDUKKO: HOVER-VALOTUS ---------- */
(function initGalleryHover() {
  const grid = document.querySelector('.galleria-grid');
  if (!grid) return;

  const items = grid.querySelectorAll('.galleria-item');

  items.forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      items.forEach(function (other) {
        if (other !== item) {
          other.style.opacity = '0.75';
          other.style.transition = 'opacity 280ms ease';
        }
      });
    });

    item.addEventListener('mouseleave', function () {
      items.forEach(function (other) {
        other.style.opacity = '';
      });
    });
  });
})();


/* ---------- NAV-LINKIN AKTIIVINEN TILA (CSS) ---------- */
(function injectActiveLinkStyle() {
  const style = document.createElement('style');
  style.textContent =
    '.nav-link.active {' +
    '  color: #ffffff;' +
    '  background: rgba(255,255,255,0.1);' +
    '}';
  document.head.appendChild(style);
})();