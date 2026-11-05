/* HOLY // consent gate — asks before any non-essential third-party request.
   Essential-only by default: no Google Fonts, no external requests beyond
   what the page strictly needs. Choice is stored in localStorage (holy_consent)
   and can be reopened at any time via [data-consent-open] ("COOKIE SETTINGS").
   Styles are injected here so the banner works on pages with their own CSS. */
(function () {
  var KEY = "holy_consent", BAR = "consentBar", FONTS = "holy-fonts";
  var FONT_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700;800&display=swap";

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function fontsOn() {
    if (get() !== "all") return;
    if (document.getElementById(FONTS)) return;
    var l = document.createElement("link");
    l.id = FONTS; l.rel = "stylesheet"; l.href = FONT_URL;
    (document.head || document.documentElement).appendChild(l);
  }
  function fontsOff() {
    var l = document.getElementById(FONTS);
    if (l && l.parentNode) l.parentNode.removeChild(l);
  }

  var CSS = [
    "#" + BAR + "{position:fixed;left:0;right:0;bottom:0;z-index:600;background:rgba(5,7,10,.97);",
    "border-top:2px solid #FF3355;padding:16px 20px 18px;font-family:ui-monospace,Menlo,Consolas,monospace;",
    "box-shadow:0 -18px 50px rgba(0,0,0,.6);backdrop-filter:blur(8px)}",
    "#" + BAR + " .c-in{max-width:1000px;margin:0 auto;display:flex;gap:18px;align-items:center;flex-wrap:wrap}",
    "#" + BAR + " .c-txt{flex:1 1 420px;min-width:260px}",
    "#" + BAR + " .c-t{display:block;font-size:11px;letter-spacing:.2em;color:#FF3355;font-weight:700;margin-bottom:6px}",
    "#" + BAR + " .c-d{display:block;font-size:12.5px;line-height:1.65;color:#F5F7FA}",
    "#" + BAR + " .c-d a{color:#FF8FA3}",
    "#" + BAR + " .c-btns{display:flex;gap:10px;flex-wrap:wrap}",
    "#" + BAR + " button{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;letter-spacing:.08em;",
    "font-weight:800;padding:12px 18px;border-radius:9px;cursor:pointer;border:1px solid transparent}",
    "#" + BAR + " .c-acc{background:#FF3355;color:#001318}",
    "#" + BAR + " .c-acc:hover{background:#FF8FA3}",
    "#" + BAR + " .c-ess{background:none;border-color:rgba(255,255,255,.28);color:#F5F7FA}",
    "#" + BAR + " .c-ess:hover{border-color:#FF3355}",
    "#" + BAR + " :focus-visible{outline:2px solid #FF8FA3;outline-offset:3px}",
    "@media(max-width:560px){#" + BAR + " button{flex:1 1 100%}}"
  ].join("");

  function ensureStyles() {
    if (document.getElementById("consent-css")) return;
    var s = document.createElement("style");
    s.id = "consent-css"; s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function bar() {
    var b = document.getElementById(BAR);
    if (b) return b;
    ensureStyles();
    if (!document.body) return null;
    b = document.createElement("div");
    b.id = BAR;
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-label", "Privacy choices");
    b.setAttribute("aria-live", "polite");
    b.hidden = true;
    b.innerHTML =
      '<div class="c-in">' +
        '<div class="c-txt">' +
          '<span class="c-t">HOLY // PRIVACY CHOICE</span>' +
          '<span class="c-d">No cookies, no analytics, no ad trackers. This site stores your settings and ' +
          'game progress in this browser only. The single optional request is Google Fonts (it sends your ' +
          'IP to Google) — it loads only if you accept. ' +
          '<a href="privacy.html">Read the full privacy policy</a>.</span>' +
        '</div>' +
        '<div class="c-btns">' +
          '<button type="button" class="c-acc" data-c="all">ACCEPT ALL</button>' +
          '<button type="button" class="c-ess" data-c="ess">ESSENTIAL ONLY</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(b);
    b.querySelector('[data-c="all"]').onclick = function () {
      set("all"); fontsOn(); hide();
      var n = document.getElementById("consentNote");
      if (n) n.textContent = "CHOICE: ALL ACCEPTED — FONTS LOADED";
    };
    b.querySelector('[data-c="ess"]').onclick = function () {
      set("essential"); fontsOff(); hide();
      var n = document.getElementById("consentNote");
      if (n) n.textContent = "CHOICE: ESSENTIAL ONLY — NO THIRD-PARTY REQUESTS";
    };
    return b;
  }

  function show() {
    var b = bar();
    if (b) { b.hidden = false; var f = b.querySelector("button"); if (f) f.focus(); }
  }
  function hide() { var b = document.getElementById(BAR); if (b) b.hidden = true; }

  function init() {
    var c = get();
    if (c === "all") fontsOn();
    else if (!c) { var b = bar(); if (b) b.hidden = false; }
  }

  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest && e.target.closest("[data-consent-open]");
    if (t) { e.preventDefault(); show(); }
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.HOLY_CONSENT = { get: get, set: set, show: show, hide: hide, fontsOn: fontsOn, fontsOff: fontsOff };
})();
