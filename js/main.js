/* NUADOR — site interactions */
(function () {
  "use strict";

  var lang = (document.documentElement.lang || "en").slice(0, 2).toLowerCase();
  var isJa = lang === "ja";
  var T = {
    countAll: isJa ? "ブレンド" : "blends",
    countShown: isJa ? "ブレンドを表示" : "blends shown",
    countNote: isJa ? "ニコチン・タバコ不使用" : "nicotine-free & tobacco-free",
    fill: isJa ? "お名前、メールアドレス、メッセージをご入力ください。" : "Please fill in your name, email and message.",
    sending: isJa ? "送信中…" : "Sending…",
    send: isJa ? "送信する" : "Send Message",
    success: isJa ? "ありがとうございます。送信しました。2営業日以内にお返事します。" : "Thank you — your message has been sent. We'll reply within two business days.",
    error: isJa ? "送信できませんでした。hello@nuador.com まで直接ご連絡ください。" : "Something went wrong. Please email hello@nuador.com directly.",
    network: isJa ? "通信エラーです。hello@nuador.com まで直接ご連絡ください。" : "Network error. Please email hello@nuador.com directly."
  };

  /* ---- Sticky header state ---- */
  var header = document.getElementById("header");
  var onScroll = function () {
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 24);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav ---- */
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      burger.classList.toggle("open", open);
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        burger.classList.remove("open");
      }
    });
  }

  /* ---- Catalog filter ---- */
  var filters = document.getElementById("filters");
  var grid = document.getElementById("grid");
  var count = document.getElementById("count");
  if (filters && grid) {
    var tiles = grid.querySelectorAll(".tile");
    var total = tiles.length;
    filters.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      filters.querySelectorAll("button").forEach(function (b) { b.classList.remove("on"); });
      btn.classList.add("on");
      var f = btn.getAttribute("data-filter");
      var visible = 0;
      tiles.forEach(function (t) {
        var show = f === "all" || t.getAttribute("data-cat") === f;
        t.classList.toggle("hide", !show);
        if (show) visible++;
      });
      if (count) {
        count.textContent = visible + (visible === total ? " " + T.countAll : " " + T.countShown) + " · " + T.countNote;
      }
    });
  }

  /* ---- Contact form → POST /api/contact ---- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("formStatus");
      var btn = document.getElementById("sendBtn");
      var fd = new FormData(form);
      var name = (fd.get("name") || "").toString().trim();
      var email = (fd.get("email") || "").toString().trim();
      var topic = (fd.get("topic") || "").toString();
      var message = (fd.get("message") || "").toString().trim();

      if (!name || !email || !message) {
        status.textContent = T.fill;
        status.style.color = "#e08c7c";
        return;
      }

      btn.disabled = true;
      btn.textContent = T.sending;
      status.textContent = "";
      status.style.color = "";

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, email: email, topic: topic, message: message })
      })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (d) {
          btn.disabled = false;
          btn.textContent = T.send;
          if (d && d.ok) {
            status.textContent = T.success;
            status.style.color = "#a9d6a0";
            form.reset();
          } else {
            status.textContent = (d && d.error) || T.error;
            status.style.color = "#e08c7c";
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = T.send;
          status.textContent = T.network;
          status.style.color = "#e08c7c";
        });
    });
  }

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }
})();
