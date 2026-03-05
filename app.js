(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const overlay = $('#overlay');
  const nav = $('#primaryNav');
  const menuButton = $('#menuButton');
  const modals = $$('.modal');
  const yearNode = $('#year');
  const isMenuOpen = () => !!(nav && nav.classList.contains('show'));

  const setYear = () => {
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }
  };

  const closeModal = () => {
    document.body.classList.remove('no-scroll');
    modals.forEach((modal) => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    });

    if (overlay) {
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
    }
  };

  const openModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    if (overlay) {
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('no-scroll');

    const firstInput = modal.querySelector('input, textarea, button');
    if (firstInput) firstInput.focus({ preventScroll: true });
  };

  const bindMenu = () => {
    if (!menuButton || !nav) return;

    const focusFirstLink = () => {
      const first = nav.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    };

    const closeMenu = () => {
      nav.classList.remove('show');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    };

    menuButton.addEventListener('click', () => {
      const next = !(nav.classList.contains('show'));
      nav.classList.toggle('show', next);
      menuButton.setAttribute('aria-expanded', String(next));
      document.body.classList.toggle('no-scroll', next);
      if (next) {
        focusFirstLink();
      }
    });

    $$('a[href^="#"]', nav).forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        if (isMenuOpen()) {
          closeMenu();
        }
      });
    }
  };

  const bindModals = () => {
    $$('[data-open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-open');
        openModal(target);
      });
    });

    $$('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', closeModal);
    });

    if (overlay) {
      overlay.addEventListener('click', closeModal);
    }

    document.addEventListener('keyup', (event) => {
      if (event.key === 'Escape') {
        if (isMenuOpen()) {
          nav.classList.remove('show');
          menuButton.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('no-scroll');
          return;
        }
        closeModal();
      }
    });
  };

  const bindForm = () => {
    const form = $('#inquiryForm');
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const message = `${data.company} / ${data.name} 님\n` +
        `${data.email}\n\n${data.message}`;
      alert(`상담 신청이 접수되었습니다.\n\n${message}`);
      form.reset();
      closeModal();
    });
  };

  const initReveal = () => {
    const nodes = $$('.reveal');
    if (!nodes.length) return;

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    nodes.forEach((node) => observer.observe(node));
  };

  const initAnchors = () => {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const target = $(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const init = () => {
    setYear();
    bindMenu();
    bindModals();
    bindForm();
    initReveal();
    initAnchors();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
