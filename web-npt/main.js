/* NPT — Neuro Physical Training. Vanilla JS, no modules. */
(function () {
  "use strict";

  var WA = "51925676580";

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[NPT] " + name + " failed:", e); }
  }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  /* WhatsApp links with prefilled message */
  function initWhatsApp() {
    $$(".js-wa").forEach(function (a) {
      var msg = a.getAttribute("data-msg");
      if (msg) a.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
    });
  }

  /* Header background on scroll */
  function initHeader() {
    var h = $(".header");
    function onScroll() { h.classList.toggle("is-scrolled", window.scrollY > 40); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu */
  function initMenu() {
    var burger = $("#burger"), nav = $("#nav");
    function set(open) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    }
    burger.addEventListener("click", function () { set(!nav.classList.contains("is-open")); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
  }

  /* Booking overlay */
  function initBooking() {
    var box = $("#booking");
    function set(open) {
      box.classList.toggle("is-open", open);
      box.setAttribute("aria-hidden", open ? "false" : "true");
      document.body.style.overflow = open ? "hidden" : "";
    }
    $$(".js-open-book").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); set(true); });
    });
    $$(".js-close-book").forEach(function (b) { b.addEventListener("click", function () { set(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  }

  /* Reasons slider */
  function initReasons() {
    var track = $("#reasonsTrack");
    var slides = $$(".reason", track);
    var prev = $("#reasonPrev"), next = $("#reasonNext");
    var now = $("#reasonNow"), bar = $("#reasonBar");
    var idx = 0;

    function current() { return Math.round(track.scrollLeft / track.clientWidth); }
    function update() {
      idx = Math.max(0, Math.min(slides.length - 1, current()));
      now.textContent = idx + 1;
      bar.style.width = ((idx + 1) / slides.length * 100) + "%";
      prev.disabled = idx === 0;
      next.innerHTML = idx === slides.length - 1 ? "Ver servicios <span>↓</span>" : "Siguiente razón <span>→</span>";
      slides.forEach(function (s, i) { s.classList.toggle("is-current", i === idx); });
    }
    function go(i) { track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" }); }

    prev.addEventListener("click", function () { go(idx - 1); });
    next.addEventListener("click", function () {
      if (idx === slides.length - 1) { $("#servicios").scrollIntoView({ behavior: "smooth" }); return; }
      go(idx + 1);
    });
    var t;
    track.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(update, 60); }, { passive: true });
    window.addEventListener("resize", function () { go(idx); });
    update();
  }

  /* Services accordion */
  function initServices() {
    $$(".service").forEach(function (item) {
      var head = $(".service__head", item);
      head.addEventListener("click", function () {
        var open = !item.classList.contains("is-open");
        $$(".service.is-open").forEach(function (o) {
          o.classList.remove("is-open");
          $(".service__head", o).setAttribute("aria-expanded", "false");
        });
        item.classList.toggle("is-open", open);
        head.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
    var first = $(".service");
    if (first) $(".service__head", first).click();
  }

  /* Process dial + steps */
  var STEPS = [
    ["Definir objetivos", "Evaluamos tu punto de partida y fijamos qué quieres conseguir. Sin esto, nada de lo demás tiene dirección."],
    ["Calentamiento general", "Subimos la temperatura del cuerpo y la frecuencia cardiaca para preparar músculos y articulaciones."],
    ["Calentamiento específico", "Activamos los patrones de movimiento que vas a trabajar ese día, con cargas progresivas."],
    ["Sesión", "El bloque principal: fuerza, técnica y acondicionamiento según tu programa personalizado."],
    ["Estiramiento", "Recuperamos rango de movimiento y liberamos tensión en los grupos musculares trabajados."],
    ["Cool down", "Bajamos pulsaciones de forma gradual para que el cuerpo vuelva a su estado de reposo."],
    ["Feedback", "Revisamos cómo te sentiste y ajustamos la siguiente sesión. Tu respuesta guía el programa."]
  ];

  function initProcess() {
    var svg = $("#dialSvg");
    var stepsEl = $$(".step");
    var label = $("#stepLabel"), title = $("#stepTitle"), text = $("#stepText"), detail = $("#stepDetail");
    var NS = "http://www.w3.org/2000/svg";
    var n = STEPS.length, cx = 100, cy = 100, r = 84, gap = 3;
    var paths = [];

    if (svg.children.length === 0) {
      for (var i = 0; i < n; i++) {
        var a0 = (i / n) * 360 + gap / 2, a1 = ((i + 1) / n) * 360 - gap / 2;
        var p = document.createElementNS(NS, "path");
        p.setAttribute("d", arc(a0, a1));
        p.setAttribute("data-i", i);
        p.addEventListener("click", function () { select(+this.getAttribute("data-i")); });
        svg.appendChild(p);
        paths.push(p);
      }
      for (var k = 0; k < 60; k++) {
        var ang = k * 6 * Math.PI / 180, r1 = 66, r2 = k % 5 === 0 ? 60 : 63;
        var l = document.createElementNS(NS, "line");
        l.setAttribute("x1", cx + r1 * Math.cos(ang)); l.setAttribute("y1", cy + r1 * Math.sin(ang));
        l.setAttribute("x2", cx + r2 * Math.cos(ang)); l.setAttribute("y2", cy + r2 * Math.sin(ang));
        l.setAttribute("class", "tick");
        svg.appendChild(l);
      }
    }

    function arc(a0, a1) {
      var s = pt(a0), e = pt(a1), large = a1 - a0 > 180 ? 1 : 0;
      return "M" + s[0] + " " + s[1] + " A" + r + " " + r + " 0 " + large + " 1 " + e[0] + " " + e[1];
    }
    function pt(a) { var rad = a * Math.PI / 180; return [(cx + r * Math.cos(rad)).toFixed(2), (cy + r * Math.sin(rad)).toFixed(2)]; }

    var active = 0;
    function select(i) {
      active = i;
      paths.forEach(function (p, j) { p.classList.toggle("is-active", j === i); });
      stepsEl.forEach(function (b, j) { b.classList.toggle("is-active", j === i); });
      label.textContent = "Paso " + ("0" + (i + 1)).slice(-2);
      title.textContent = STEPS[i][0];
      text.textContent = STEPS[i][1];
      detail.classList.remove("is-swapping"); void detail.offsetWidth; detail.classList.add("is-swapping");
    }
    stepsEl.forEach(function (b) {
      b.addEventListener("click", function () { stop(); select(+b.getAttribute("data-i")); });
    });
    paths.forEach(function (p) { p.addEventListener("click", stop); });

    // Gentle autoplay until the user interacts
    var timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting && timer === null && !svg.dataset.touched) {
          timer = setInterval(function () { select((active + 1) % n); }, 3200);
        } else if (!e.isIntersecting) stop();
      });
    }, { threshold: 0.05 });
    io.observe(svg);
    svg.addEventListener("click", function () { svg.dataset.touched = "1"; });
    stepsEl.forEach(function (b) { b.addEventListener("click", function () { svg.dataset.touched = "1"; }); });

    select(0);
  }

  /* Reveal on scroll */
  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
    setTimeout(function () { els.forEach(function (e) { e.classList.add("is-in"); }); }, 6000);
  }

  function initYear() { var y = $("#year"); if (y) y.textContent = new Date().getFullYear(); }

  function boot() {
    safe(initWhatsApp, "whatsapp");
    safe(initHeader, "header");
    safe(initMenu, "menu");
    safe(initBooking, "booking");
    safe(initReasons, "reasons");
    safe(initServices, "services");
    safe(initProcess, "process");
    safe(initReveal, "reveal");
    safe(initYear, "year");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
