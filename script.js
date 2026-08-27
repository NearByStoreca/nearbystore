/* NearbyStore marketing site — progressive enhancement only.
   Everything here is optional: the page is fully readable, navigable and
   the contact form submits natively if this file never loads. */
(function () {
  'use strict';

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var header = document.querySelector('.site-header');

  function setNav(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(nav.classList.contains('is-open') === false);
    });

    // Following an in-page link should put the menu away.
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setNav(false);
        toggle.focus();
      }
    });

    // Tapping anywhere outside the header closes it too.
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (header && !header.contains(e.target)) setNav(false);
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealables = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduceMotion) {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add('is-visible'); }, (i % 4) * 70);
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (el) { observer.observe(el); });
  }

  /* =========================================================
     Contact form
     The form posts natively to FormSubmit, which redirects to
     /thanks.html. We do NOT submit it over fetch: the endpoint
     returns no Access-Control-Allow-Origin header, so the browser
     cannot read the response even though the message is delivered —
     which would show a false failure and invite a duplicate send. So
     this code only adds inline validation, then lets the browser do
     the submit it was always going to do.
     ========================================================= */
  var form = document.getElementById('contact-form');
  if (!form) return;

  // Take validation off the browser only now that we're here to do it
  // ourselves. Without JS the attribute is absent and native validation
  // still guards the plain POST.
  form.setAttribute('novalidate', '');

  var status = form.querySelector('.form-status');
  var submitBtn = form.querySelector('button[type="submit"]');

  var MESSAGES = {
    'cf-name': 'Please tell us your name.',
    'cf-email': 'Please enter an email address we can reply to.',
    'cf-message': 'Please write a message.'
  };

  function say(text, state) {
    if (!status) return;
    status.textContent = text || '';
    if (state) status.setAttribute('data-state', state);
    else status.removeAttribute('data-state');
  }

  function showFieldError(field, message) {
    var errorEl = document.getElementById(field.id + '-error');
    if (errorEl) errorEl.textContent = message || '';
    if (message) {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', field.id + '-error');
    } else {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  }

  function validate() {
    var required = form.querySelectorAll('[required]');
    var firstInvalid = null;

    Array.prototype.forEach.call(required, function (field) {
      var ok = field.checkValidity();
      showFieldError(field, ok ? '' : (MESSAGES[field.id] || 'This field is required.'));
      if (!ok && !firstInvalid) firstInvalid = field;
    });

    return firstInvalid;
  }

  // Clear a field's error as soon as the visitor fixes it.
  form.addEventListener('input', function (e) {
    var field = e.target;
    if (field.hasAttribute('aria-invalid') && field.checkValidity()) {
      showFieldError(field, '');
    }
  });

  form.addEventListener('submit', function (e) {
    var invalid = validate();

    if (invalid) {
      // Only here do we take over — to keep the visitor on the page and
      // point them at the field that needs fixing.
      e.preventDefault();
      say('Please check the highlighted fields.', 'error');
      invalid.focus();
      return;
    }

    // Valid: stand back and let the browser post the form.
    say('Sending your message…', 'sending');
    if (submitBtn) {
      submitBtn.textContent = 'Sending…';
      // Guard against a double-tap queuing a second message. Deferred so the
      // button is still enabled at the moment the browser serializes the form
      // — a disabled control is omitted from the submission.
      setTimeout(function () { submitBtn.disabled = true; }, 0);
    }
  });

  /* Come back to the page after sending — via the browser Back button, the
     "Back to the homepage" link, or a reload — and the form must be blank.
     Two things would otherwise leave it filled in:
       - the bfcache, which restores the whole page in the exact state it was
         left in, "Sending…" button and all;
       - session form restoration, which browsers apply on a plain reload.
     `pageshow` covers both, because it fires on a normal load *and* on a
     bfcache restore, which `load` does not. */
  function resetForm() {
    form.reset();
    say('', null);
    Array.prototype.forEach.call(form.querySelectorAll('[aria-invalid]'), function (field) {
      showFieldError(field, '');
    });
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  }

  window.addEventListener('pageshow', resetForm);
})();
