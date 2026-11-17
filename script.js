
// Lightweight portfolio interactions. No frameworks or build step needed.
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const projectCards = [...document.querySelectorAll('.project-card[data-category]')];
const endcap = document.querySelector('.project-endcap');
filterButtons.forEach(button => button.addEventListener('click', () => {
  const chosen = button.dataset.filter;
  filterButtons.forEach(btn => {
    const active = btn === button;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  projectCards.forEach(card => {
    card.hidden = chosen !== 'all' && card.dataset.category !== chosen;
  });
  if (endcap) endcap.hidden = chosen !== 'all';
}));

const revealItems = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 30px 0px' });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

// An exported LinkedIn photo can be added later without redesigning the About section.
for (const photo of document.querySelectorAll('.about-photo')) {
  if (photo.complete && photo.naturalWidth > 0) photo.classList.add('is-loaded');
  photo.addEventListener('load', () => photo.classList.add('is-loaded'));
}

// Hash routes for a small, click-to-open portfolio. Works on GitHub Pages without a router.
const portfolioPages = new Set(['home', 'work', 'about']);
const viewSections = [...document.querySelectorAll('main > .page-view[data-page]')];
const portfolioNavLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
let linkedInFeedRequested = false;

function initializeLinkedInFeed() {
  // The Elfsight widget requires a visible container when its platform initializes.
  // Initialize only after the Home page (which contains Updates) is visible.
  if (linkedInFeedRequested) return;
  linkedInFeedRequested = true;
  const feed = document.getElementById('linkedin-live-feed');
  if (!feed || !feed.querySelector('.elfsight-app-2305277e-16cb-4b27-a288-168660fe93a8')) return;
  const script = document.createElement('script');
  script.src = 'https://elfsightcdn.com/platform.js';
  script.async = true;
  script.dataset.elfsightPlatform = 'true';
  script.onerror = () => { // Preserve the already visible LinkedIn fallback.
    feed.setAttribute('data-feed-status', 'unavailable');
  };
  document.head.append(script);
}

function navigateToPortfolioPage({focus = false} = {}) {
  let page = (window.location.hash || '#home').slice(1).toLowerCase();
  const scrollToUpdates = page === 'updates';
  if (scrollToUpdates) page = 'home';
  if (page === 'top' || page === 'main' || page === 'contact') page = 'home';
  if (page === 'experience' || page === 'education') { page = 'about'; history.replaceState(null, '', '#about'); }
  if (!portfolioPages.has(page)) page = 'home';
  for (const section of viewSections) {
    const visible = section.dataset.page === page;
    section.hidden = !visible;
    section.setAttribute('aria-hidden', String(!visible));
    if (visible) section.querySelectorAll('[data-reveal]').forEach(element => element.classList.add('is-visible'));
  }
  for (const link of portfolioNavLinks) {
    const active = link.getAttribute('href') === `#${page}`;
    link.classList.toggle('is-current', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  // Switching screens should begin at the top, instead of jumping to the section anchor.
  if (scrollToUpdates) document.getElementById('updates')?.scrollIntoView({behavior:'instant',block:'start'});
  else window.scrollTo({top:0,left:0,behavior:'instant'});
  if (page === 'home') initializeLinkedInFeed();
  if (focus) {
    const activeSection = document.querySelector(`main > .page-view[data-page="${page}"]`);
    if (activeSection) {
      if (!activeSection.hasAttribute('tabindex')) activeSection.tabIndex = -1;
      activeSection.focus({preventScroll:true});
    }
  }
  document.title = page === 'home' ? 'Umair Mahmood — Software, Data & Thoughtful Products' :
    `${page === 'work' ? 'Projects' : page[0].toUpperCase()+page.slice(1)} — Umair Mahmood`;
}

window.addEventListener('hashchange', () => navigateToPortfolioPage({focus:true}));
window.addEventListener('popstate', () => navigateToPortfolioPage({focus:true}));
// Intercept in-site links so the browser does not scroll down to hidden anchors.
for (const link of document.querySelectorAll('a[href^="#"]')) {
  link.addEventListener('click', event => {
    event.preventDefault();
    const target = link.getAttribute('href');
    if (window.location.hash !== target) history.pushState(null, '', target);
    navigateToPortfolioPage({focus:true});
  });
}
navigateToPortfolioPage();
