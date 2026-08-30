(function () {
  "use strict";

  /* ── UTILS ── */
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  /* ── NAV ── */
  function initNav() {
    var nav = $("#nav");
    var burger = $("#navBurger");
    var links = $("#navLinks");
    if (!nav) return;

    function onScroll() {
      if (window.scrollY > 30) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (burger && links) {
      burger.addEventListener("click", function () {
        links.classList.toggle("is-open");
      });
      links.addEventListener("click", function (e) {
        if (e.target.tagName === "A") links.classList.remove("is-open");
      });
    }
  }

  /* ── SMOOTH ANCHOR SCROLL ── */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var offset = 80;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset,
        behavior: "smooth"
      });
    });
  }

  /* ── MOUSE-REACTIVE GRADIENT (hero + contact) ── */
  function initMouseGradient() {
    var hero = $(".hero");
    if (!hero) return;

    document.addEventListener("mousemove", function (e) {
      var x = (e.clientX / window.innerWidth * 100).toFixed(1);
      var y = (e.clientY / window.innerHeight * 100).toFixed(1);
      document.documentElement.style.setProperty("--mx", x + "%");
      document.documentElement.style.setProperty("--my", y + "%");

      // contact section gradient follows scroll-relative position
      var contactGrad = $("#contactGradient");
      if (contactGrad) {
        contactGrad.style.setProperty("--cx", x + "%");
        contactGrad.style.setProperty("--cy", y + "%");
      }
    });
  }

  /* ── SCROLL REVEALS ── */
  function initReveals() {
    var items = $$(".reveal");
    if (!items.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var delay = el.dataset.delay || 0;
        setTimeout(function () {
          el.classList.add("is-visible");
        }, parseFloat(delay) * 1000);
        io.unobserve(el);
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -4% 0px" });

    items.forEach(function (el, i) {
      // stagger siblings in same parent
      var siblings = $$(".reveal", el.parentElement);
      var idx = siblings.indexOf(el);
      if (!el.dataset.delay && idx > 0) {
        el.dataset.delay = (idx * 0.12).toFixed(2);
      }
      io.observe(el);
    });

    // safety net: reveal anything still hidden after 6s
    setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ── COUNT-UP ── */
  function initCountUp() {
    var nums = $$("[data-count]");
    if (!nums.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseInt(el.dataset.count, 10);
        var duration = 1800;
        var start = performance.now();
        io.unobserve(el);

        function step(now) {
          var progress = Math.min((now - start) / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(ease * target);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    nums.forEach(function (el) { io.observe(el); });
  }

  /* ── GSAP SCROLL ANIMATIONS (if available) ── */
  function initGsap() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // Hero title parallax
    var heroTitle = $(".hero-title");
    if (heroTitle) {
      gsap.to(heroTitle, {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.6
        }
      });
    }

    // Service cards stagger
    $$(".service-card").forEach(function (card, i) {
      gsap.fromTo(card,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: .7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none none"
          },
          delay: i * 0.1
        }
      );
      // Override reveal class since GSAP handles it
      card.classList.remove("reveal");
      card.style.opacity = "";
    });

    // Process steps stagger
    var steps = $$(".process-step");
    if (steps.length) {
      gsap.fromTo(steps,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: .65,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".process-steps",
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
      steps.forEach(function (s) { s.classList.remove("reveal"); s.style.opacity = ""; });
    }
  }

  /* ── SERVICE CARD HOVER (border glow pulse) ── */
  function initServiceCards() {
    $$(".service-card").forEach(function (card) {
      card.addEventListener("mouseover", function (e) {
        if (!card.contains(e.relatedTarget)) {
          card.style.boxShadow = "0 0 40px rgba(168,255,0,.12)";
        }
      });
      card.addEventListener("mouseout", function (e) {
        if (!card.contains(e.relatedTarget)) {
          card.style.boxShadow = "";
        }
      });
    });
  }

  /* ── BOOT ── */
  function boot() {
    safe(initNav,           "initNav");
    safe(initSmoothScroll,  "initSmoothScroll");
    safe(initMouseGradient, "initMouseGradient");
    safe(initReveals,       "initReveals");
    safe(initCountUp,       "initCountUp");
    safe(initServiceCards,  "initServiceCards");
    safe(initGsap,          "initGsap");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
