/* Kestrel Air prototype: vanilla JavaScript, no libraries. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* 1. Mobile menu: toggles aria-expanded so screen readers hear the state */
  const menuBtn = $('#menuBtn'), nav = $('#mainNav');
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  /* 2. Dropdown panels: one open at a time, Esc closes and returns focus */
  const panelBtns = $$('.panel-btn');
  const closePanels = (except) => panelBtns.forEach(b => {
    if (b !== except) { b.setAttribute('aria-expanded', 'false'); $('#' + b.getAttribute('aria-controls')).hidden = true; }
  });
  panelBtns.forEach(btn => btn.addEventListener('click', () => {
    const panel = $('#' + btn.getAttribute('aria-controls'));
    const open = btn.getAttribute('aria-expanded') === 'true';
    closePanels(btn);
    btn.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const openBtn = panelBtns.find(b => b.getAttribute('aria-expanded') === 'true');
      if (openBtn) { closePanels(); openBtn.focus(); }
    }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.has-panel')) closePanels(); });

  /* 3. Tabs: arrow-key navigation (WAI-ARIA tabs pattern) */
  const tabs = $$('[role="tab"]');
  const selectTab = (tab) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length]);
      if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length]);
    });
  });

  /* Shared helper: show/clear an error and keep ARIA state in sync */
  const setError = (id, msg) => {
    const input = $('#' + id), err = $('#' + id + '-err');
    err.textContent = msg;                       // textContent, never innerHTML: prevents XSS
    input.closest('.field').classList.toggle('invalid', !!msg);
    input.setAttribute('aria-invalid', String(!!msg));
    if (msg) input.setAttribute('aria-describedby', id + '-err'); else input.removeAttribute('aria-describedby');
    return !msg;
  };

  /* 4. Flight search: validation + trip type + Book with points */
  const form = $('#searchForm'), trip = $('#trip'), retField = $('#returnField');
  const depart = $('#depart'), ret = $('#ret'), points = $('#points'), btn = $('#searchBtn');
  const today = new Date().toISOString().split('T')[0];
  depart.min = ret.min = today;

  trip.addEventListener('change', () => { retField.hidden = trip.value === 'oneway'; });

  points.addEventListener('click', () => {
    const on = points.getAttribute('aria-checked') !== 'true';
    points.setAttribute('aria-checked', String(on));
    btn.textContent = on ? 'Search with points' : 'Search flights';
    document.dispatchEvent(new CustomEvent('pointsmode', { detail: on }));   // lets other components react
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const from = $('#from').value, to = $('#to').value, pax = Number($('#pax').value);
    const oneWay = trip.value === 'oneway';
    const results = [
      setError('from', from ? '' : 'Choose where you are flying from.'),
      setError('to', !to ? 'Choose where you are flying to.' : (to === from ? 'Choose a different airport to fly to.' : '')),
      setError('depart', !depart.value ? 'Choose a departure date.' : (depart.value < today ? 'Departure date cannot be in the past.' : '')),
      setError('ret', oneWay ? '' : (!ret.value ? 'Choose a return date.' : (ret.value < depart.value ? 'Return date must be after departure.' : ''))),
      setError('pax', Number.isInteger(pax) && pax >= 1 && pax <= 9 ? '' : 'Enter between 1 and 9 adults.')
    ];
    const out = $('#searchResult');
    if (results.every(Boolean)) {
      // Prototype only: a real build would POST to the server, which must re-validate (A1).
      out.textContent = `Searching ${from} to ${to} for ${pax} adult${pax > 1 ? 's' : ''}${points.getAttribute('aria-checked') === 'true' ? ' using points' : ''}.`;
    } else {
      out.textContent = '';
      $('.invalid input, .invalid select', form).focus();   // move focus to first error
    }
  });

  /* 5. Contact form */
  const cform = $('#contactForm');
  cform.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#cname').value.trim(), email = $('#cemail').value.trim(), msg = $('#cmsg').value.trim();
    const ok = [
      setError('cname', name.length >= 2 ? '' : 'Enter your full name.'),
      setError('cemail', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Enter an email like name@example.com.'),
      setError('cmsg', msg.length >= 10 ? '' : 'Write at least 10 characters.')
    ];
    const out = $('#contactResult');
    if (ok.every(Boolean)) { out.textContent = 'Message sent. We will reply within two business days.'; cform.reset(); }
    else { out.textContent = ''; $('.invalid input, .invalid textarea', cform).focus(); }
  });

  /* 6. Login dialog (A1 security points) */
  const dlg = $('#loginDialog');
  const lform = $('#loginForm'), lpass = $('#lpass');
  // Native <dialog> traps focus, closes on Esc and returns focus. Older browsers get a simple fallback.
  const canModal = typeof dlg.showModal === 'function';
  const openDlg = () => {
    if (canModal) dlg.showModal();
    else { dlg.classList.add('fallback'); dlg.setAttribute('open', ''); $('#lemail').focus(); }
  };
  const closeDlg = () => {
    if (canModal) dlg.close();
    else { dlg.removeAttribute('open'); dlg.dispatchEvent(new Event('close')); $('#loginBtn').focus(); }
  };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !canModal && dlg.hasAttribute('open')) closeDlg(); });
  $('#loginBtn').addEventListener('click', () => {
    nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false');
    openDlg();
  });
  $('#loginClose').addEventListener('click', closeDlg);
  dlg.addEventListener('click', e => { if (e.target === dlg) closeDlg(); });   // backdrop click
  dlg.addEventListener('close', () => {      // clear sensitive data whenever the dialog closes
    lform.reset(); lpass.type = 'password';
    ['lemail', 'lpass'].forEach(id => setError(id, ''));
    $('#loginResult').textContent = '';
  });
  $('#showPass').addEventListener('change', e => { lpass.type = e.target.checked ? 'text' : 'password'; });

  lform.addEventListener('submit', e => {
    e.preventDefault();
    const user = $('#lemail').value.trim(), pass = lpass.value;
    const ok = [
      setError('lemail', user ? '' : 'Enter your email or member number.'),
      setError('lpass', pass.length >= 8 ? '' : 'Enter your password (at least 8 characters).')
    ];
    const out = $('#loginResult');
    if (ok.every(Boolean)) {
      // Client-side checks only improve feedback; the server must validate again.
      // Real failures should use one generic message so account details are not revealed (OWASP).
      out.textContent = 'Checks passed. A live site would now send your details securely to the server.';
      lpass.value = '';                      // never keep the password in the page
    } else { out.textContent = ''; $('.invalid input', lform).focus(); }
  });

  /* 7. Hero background video: respects reduced-motion and has a pause control (WCAG 2.2.2) */
  const vid = $('#heroVideo'), vbtn = $('#videoToggle');
  const showState = (playing) => { vbtn.textContent = playing ? 'Pause background video' : 'Play background video'; };
  // Upgrade to the 4K file only when the screen can show it and the connection can afford it
  const conn = navigator.connection || {};
  const wantsHD = !conn.saveData && !/(^|-)[23]g$/.test(conn.effectiveType || '') &&
                  window.innerWidth * (window.devicePixelRatio || 1) >= 2560;
  if (wantsHD) { $('source', vid).src = 'assets/hero-loop-4k.mp4'; vid.load(); }
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const p = vid.play();                    // may be blocked by the browser: fall back to paused state
    if (p && p.then) p.then(() => showState(true)).catch(() => showState(false));
  }
  vbtn.addEventListener('click', () => {
    if (vid.paused) { vid.play(); showState(true); } else { vid.pause(); showState(false); }
  });

  /* 8. Toast: short live message, also used by placeholder links */
  const toast = $('#toast'); let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;                 // textContent: safe from XSS
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  };
  document.addEventListener('click', e => {
    const link = e.target.closest('a[data-placeholder]');
    if (!link) return;
    e.preventDefault();                      // stay on the page instead of jumping to the top
    showToast(`"${link.textContent.trim()}" is outside this prototype's scope.`);
  });

  /* 9. Swap From and To */
  $('#swap').addEventListener('click', () => {
    const f = $('#from'), t = $('#to');
    const keep = f.value; f.value = t.value; t.value = keep;
  });

  /* 10. Popular routes: budget slider, cash/points display, route prefill */
  const routes = $$('.route'), budget = $('#budget');
  const modes = {
    cash:   { min: 80,   max: 300,   step: 10,  attr: 'price',  fmt: v => `$${v}` },
    points: { min: 5000, max: 20000, step: 500, attr: 'points', fmt: v => `${v.toLocaleString('en-AU')} pts` }
  };
  let mode = modes.cash;
  const updateRoutes = () => {
    const limit = Number(budget.value);
    let shown = 0;
    routes.forEach(r => {
      const value = Number(r.dataset[mode.attr]);
      $('.amount', r).textContent = mode.fmt(value);
      r.hidden = value > limit;
      if (!r.hidden) shown++;
    });
    $('#budgetOut').textContent = mode.fmt(limit);
    $('#routeCount').textContent = `${shown} route${shown === 1 ? '' : 's'} shown`;
    $('#noRoutes').hidden = shown > 0;
  };
  budget.addEventListener('input', updateRoutes);
  document.addEventListener('pointsmode', e => {      // the "Book with points" switch changes prices to points
    mode = e.detail ? modes.points : modes.cash;
    Object.assign(budget, { min: mode.min, max: mode.max, step: mode.step, value: mode.max });
    updateRoutes();
  });
  routes.forEach(r => $('button', r).addEventListener('click', () => {
    $('#from').value = r.dataset.from; $('#to').value = r.dataset.to;
    trip.value = 'return'; retField.hidden = false;
    ['from', 'to'].forEach(id => setError(id, ''));
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('#search').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
    depart.focus({ preventScroll: true });
    showToast(`Route filled in: ${$('h3', r).textContent}. Choose your dates.`);
  }));
})();
