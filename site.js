// RoadDesk site script: theme toggle, scroll reveal, animated counters, aurora canvas, chatbot widget.
(function () {
  var CHATBOT_URL = "https://share.chatling.ai/s/TAP2TpmTiHuBcFS";
  var root = document.documentElement;

  /* ---------- Theme toggle ---------- */
  var toggle = document.querySelector(".theme-toggle");
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    if (toggle) {
      toggle.textContent = t === "light" ? "☾" : "☀";
      toggle.setAttribute("aria-label", t === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
  }
  var saved = null;
  try { saved = localStorage.getItem("roaddesk-theme"); } catch (e) {}
  setTheme(saved === "light" ? "light" : "dark");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      setTheme(next);
      try { localStorage.setItem("roaddesk-theme", next); } catch (e) {}
    });
  }

  /* ---------- Hero video: force autoplay + loop ---------- */
  var video = document.querySelector(".hero-media video");
  if (video) {
    video.muted = true;
    video.loop = true;
    var tryPlay = function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); };
    tryPlay();
    document.addEventListener("visibilitychange", function () { if (!document.hidden) tryPlay(); });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var start = null, dur = 1600;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = (el.getAttribute("data-prefix") || "") + el.getAttribute("data-count") + (el.getAttribute("data-suffix") || ""); });
  }

  /* ---------- Aurora canvas background ---------- */
  var canvas = document.getElementById("aurora");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var w, h, t = 0;
    var bands = [
      { hue: 158, y: 0.30, amp: 0.10, speed: 0.6 },
      { hue: 255, y: 0.48, amp: 0.13, speed: 0.4 },
      { hue: 190, y: 0.66, amp: 0.09, speed: 0.8 }
    ];
    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      bands.forEach(function (b, i) {
        var grad = ctx.createLinearGradient(0, 0, 0, h);
        var mid = b.y;
        grad.addColorStop(Math.max(mid - 0.25, 0), "hsla(" + b.hue + ",90%,60%,0)");
        grad.addColorStop(mid, "hsla(" + b.hue + ",90%,60%,0.22)");
        grad.addColorStop(Math.min(mid + 0.25, 1), "hsla(" + b.hue + ",90%,60%,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (var x = 0; x <= w; x += 24) {
          var y = h * (b.y - 0.25) + Math.sin(x * 0.0022 + t * b.speed + i * 2) * h * b.amp + Math.sin(x * 0.006 - t * b.speed * 0.7) * h * b.amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
      });
      t += 0.012;
      if (!reduce) requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  /* ---------- Chatbot widget (Chatling) ---------- */
  var launcher = document.createElement("button");
  launcher.className = "chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.innerHTML = "<span aria-hidden='true'>💬</span><span class='chat-label'>Ask RoadDesk</span>";
  var panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "RoadDesk chatbot");
  var frame = document.createElement("iframe");
  frame.title = "RoadDesk tour crew assistant chatbot";
  frame.src = CHATBOT_URL;
  frame.loading = "eager";
  panel.appendChild(frame);
  document.body.appendChild(panel);
  document.body.appendChild(launcher);
  function setChat(open) {
    panel.classList.toggle("open", open);
    launcher.setAttribute("aria-expanded", String(open));
    launcher.querySelector(".chat-label").textContent = open ? "Close chat" : "Ask RoadDesk";
  }
  launcher.addEventListener("click", function () { setChat(!panel.classList.contains("open")); });
  document.querySelectorAll("[data-open-chat]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); setChat(true); });
  });
})();
