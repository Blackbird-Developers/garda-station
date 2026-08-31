/**
 * Conversion tracking data layer (task #123yxuagbeb).
 *
 * Pushes structured events to window.dataLayer for GTM -> GA4 (wiring table
 * in docs/TRACKING.md). Works with or without the GTM snippet present: with
 * no container the events simply queue on the dataLayer array.
 *
 * Events:
 *   call_click      every tel: link. Params: phone_number, cta_position.
 *   whatsapp_click  every wa.me link. Params: cta_position.
 *   form_submit     callback form submitted (before navigation).
 *   form_success    arrival on /contact/?sent=1 (server-confirmed send).
 *   form_error      arrival on /contact/?err=...
 *   faq_open        a <details class="faq"> opened. Params: faq_question.
 *   scroll_depth    25 / 50 / 75 / 90 percent, once each per page view.
 *
 * Every event carries: page_type, page_slug, hour_of_day, daypart,
 * out_of_hours. Arrests peak at night; out-of-hours call volume is the
 * leading indicator for the rota and the paid dayparting strategy, so the
 * time dimension is attached client-side rather than derived later.
 */
(function () {
  'use strict';
  window.dataLayer = window.dataLayer || [];

  var me = document.currentScript || document.querySelector('script[data-page-slug]');
  var PAGE = {
    page_type: (me && me.getAttribute('data-page-type')) || '',
    page_slug: (me && me.getAttribute('data-page-slug')) || '',
  };

  function timeParams() {
    var now = new Date();
    var h = now.getHours();
    var daypart = h >= 22 || h < 6 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
    var day = now.getDay(); // 0 Sun .. 6 Sat
    // Office hours Mon-Fri 09:00-17:30, mirroring lead.php's routing rule.
    var inHours = day >= 1 && day <= 5 && h >= 9 && (h < 17 || (h === 17 && now.getMinutes() < 30));
    return { hour_of_day: h, daypart: daypart, out_of_hours: !inHours };
  }

  function push(event, params) {
    var p = { event: event };
    var t = timeParams();
    var k;
    for (k in PAGE) p[k] = PAGE[k];
    for (k in t) p[k] = t[k];
    for (k in (params || {})) p[k] = params[k];
    window.dataLayer.push(p);
  }

  function positionOf(el) {
    if (el.closest('.emergency-bar')) return 'emergency_bar';
    if (el.closest('.mobile-call')) return 'mobile_bar';
    if (el.closest('.cta-band')) return 'cta_band';
    if (el.closest('.hero')) return 'hero';
    if (el.closest('footer')) return 'footer';
    if (el.closest('.urgent-box')) return 'urgent_box';
    return 'body';
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) {
      push('call_click', { phone_number: href.slice(4), cta_position: positionOf(a) });
    } else if (href.indexOf('wa.me') !== -1) {
      push('whatsapp_click', { cta_position: positionOf(a) });
    }
  }, true);

  // <details> toggle does not bubble; a capture-phase listener still sees it.
  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (d && d.matches && d.matches('details.faq') && d.open) {
      var q = d.querySelector('summary');
      push('faq_open', { faq_question: q ? q.textContent.trim().slice(0, 100) : '' });
    }
  }, true);

  var marks = [25, 50, 75, 90];
  var fired = {};
  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    var pct = (window.scrollY / max) * 100;
    for (var i = 0; i < marks.length; i++) {
      if (pct >= marks[i] && !fired[marks[i]]) {
        fired[marks[i]] = true;
        push('scroll_depth', { depth_percent: marks[i] });
      }
    }
    if (fired[90]) window.removeEventListener('scroll', throttled);
  }
  var pending = false;
  function throttled() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; onScroll(); });
  }
  window.addEventListener('scroll', throttled, { passive: true });

  var form = document.getElementById('lead-form');
  if (form) {
    var ts = document.getElementById('lead-ts');
    if (ts) ts.value = String(Date.now());
    form.addEventListener('submit', function () { push('form_submit', {}); });
  }

  var qs = new URLSearchParams(window.location.search);
  var status = document.getElementById('lead-status');
  if (qs.get('sent') === '1') {
    push('form_success', {});
    if (status) {
      status.hidden = false;
      status.textContent = 'Thank you. We have your details and a solicitor will ring you back. If the matter is urgent, please phone 087 122 3080 now.';
      status.style.cssText = 'padding:14px;border-radius:6px;background:#e8f4ec;color:#1d5c34;font-weight:600';
    }
  } else if (qs.get('err')) {
    push('form_error', { error_code: qs.get('err') });
    if (status) {
      status.hidden = false;
      status.textContent = 'Sorry, that did not go through. Please check your name and phone number and try again, or simply ring 087 122 3080.';
      status.style.cssText = 'padding:14px;border-radius:6px;background:#fdecec;color:#8a1f1f;font-weight:600';
    }
  }
  if (qs.get('sent') || qs.get('err')) {
    try {
      qs.delete('sent'); qs.delete('err');
      var clean = window.location.pathname + (qs.toString() ? '?' + qs.toString() : '') + window.location.hash;
      window.history.replaceState(null, '', clean);
    } catch (e) { /* no-op */ }
  }
})();
