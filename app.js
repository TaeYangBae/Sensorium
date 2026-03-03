const menuButton = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
const revealElements = document.querySelectorAll('.reveal');
const counterElement = document.querySelector('.big-number');

menuButton.addEventListener('click', () => {
  menu.classList.toggle('open');
});

menu.addEventListener('click', (event) => {
  if (event.target.tagName !== 'A') return;
  if (window.innerWidth <= 720) menu.classList.remove('open');
});

const animateCounter = (el) => {
  const target = Number(el?.dataset?.count || 0);
  if (!target || Number.isNaN(target)) return;
  const duration = 1200;
  const start = performance.now();

  const step = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = `${value}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = `${target}`;
    }
  };

  requestAnimationFrame(step);
};

const reveal = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('show');
      reveal.unobserve(entry.target);

      if (entry.target.querySelector('.big-number')) {
        animateCounter(entry.target.querySelector('.big-number'));
      }
    }
  },
  {
    threshold: 0.16,
    rootMargin: '0px 0px -10% 0px',
  }
);

for (const item of revealElements) {
  reveal.observe(item);
}

const studioSection = document.getElementById('studio');
if (studioSection && counterElement) {
  const studioObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animateCounter(counterElement);
        studioObserver.disconnect();
      }
    },
    { threshold: 0.4 }
  );
  studioObserver.observe(studioSection);
}

const floatingCards = () => {
  const cards = document.querySelectorAll('.project');
  cards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.08}s`;
  });
};

floatingCards();

window.addEventListener('resize', () => {
  if (window.innerWidth > 720) {
    menu.classList.remove('open');
  }
});
