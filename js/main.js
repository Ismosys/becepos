/* Becepos - reputation management
   Single script. No dependencies.
*/
(function () {
  'use strict';

  /* Header scroll state */
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero, .page-hero');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 20) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  if (header && !hero) {
    header.classList.add('is-solid');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile drawer */
  var toggleBtn = document.querySelector('.nav-toggle');
  var drawer = document.querySelector('.mobile-drawer');
  var closeBtn = document.querySelector('.mobile-drawer__close');
  var drawerLinks = drawer ? drawer.querySelectorAll('a') : [];
  var lastFocus = null;

  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    if (closeBtn) closeBtn.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  drawerLinks.forEach(function (a) { a.addEventListener('click', closeDrawer); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) closeDrawer();
  });

  /* FAQ accordion */
  var faqs = document.querySelectorAll('.faq');
  faqs.forEach(function (faq) {
    var btn = faq.querySelector('.faq__q');
    var panel = faq.querySelector('.faq__a');
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      var isOpen = faq.classList.contains('is-open');
      faqs.forEach(function (f) {
        f.classList.remove('is-open');
        var b = f.querySelector('.faq__q');
        var p = f.querySelector('.faq__a');
        if (b) b.setAttribute('aria-expanded', 'false');
        if (p) p.style.maxHeight = '';
      });
      if (!isOpen) {
        faq.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-revealed'); });
  }

  /* Active nav link */
  var path = window.location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (path === '') path = '/';
  document.querySelectorAll('.nav-menu a, .mobile-drawer a').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    var clean = href.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/#.*$/, '');
    if (clean === '/') clean = '/';
    if (clean === path) a.classList.add('is-active');
    if (path.indexOf('/services/') === 0 && clean === '/services') a.classList.add('is-active');
  });

  /* Smooth anchor scroll (extra reliability beyond CSS) */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

  /* Contact form mailto */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var business = (data.get('business') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var phone = (data.get('phone') || '').toString().trim();
      var message = (data.get('message') || '').toString().trim();

      var subject = 'Becepos inquiry from ' + (name || 'website visitor');
      var body =
        'Name: ' + name + '\n' +
        'Business: ' + business + '\n' +
        'Email: ' + email + '\n' +
        'Phone: ' + phone + '\n\n' +
        'Message:\n' + message + '\n';

      var mailto = 'mailto:bescepos@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      var msg = document.querySelector('.form-msg');
      if (msg) {
        msg.classList.add('is-visible');
        msg.innerHTML = 'Opening your email app. If nothing happens, send your message directly to <a href="mailto:bescepos@gmail.com">bescepos@gmail.com</a>.';
      }
      window.location.href = mailto;
    });
  }

  /* Year stamp */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Chart tooltips */
  var chartPoints = document.querySelectorAll('.case__chart [data-value]');
  if (chartPoints.length) {
    var tip = document.createElement('div');
    tip.className = 'chart-tooltip';
    tip.innerHTML = '<span class="chart-tooltip__label"></span><span class="chart-tooltip__value"></span>';
    document.body.appendChild(tip);
    var tipLabel = tip.querySelector('.chart-tooltip__label');
    var tipValue = tip.querySelector('.chart-tooltip__value');

    function showTip(el) {
      tipLabel.textContent = el.getAttribute('data-label') || '';
      tipValue.textContent = el.getAttribute('data-value') || '';
      var box = el.getBoundingClientRect();
      tip.style.left = (box.left + box.width / 2) + 'px';
      tip.style.top = box.top + 'px';
      tip.classList.add('is-visible');
    }
    function hideTip() { tip.classList.remove('is-visible'); }

    chartPoints.forEach(function (el) {
      el.addEventListener('mouseenter', function () { showTip(el); });
      el.addEventListener('mousemove', function () { showTip(el); });
      el.addEventListener('mouseleave', hideTip);
      el.addEventListener('focus', function () { showTip(el); });
      el.addEventListener('blur', hideTip);
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', (el.getAttribute('data-label') || '') + ': ' + (el.getAttribute('data-value') || ''));
    });

    window.addEventListener('scroll', hideTip, { passive: true });
  }
})();
