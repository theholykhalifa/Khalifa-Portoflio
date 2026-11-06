/* HOLY // Orb Agent — chat UI + lifecycle bridge for the Liquid Glass Orb.
 *
 * Answers come from agent-kb.js (window.HOLY_KB): a local, offline knowledge
 * base grounded in this site's published facts. No network, no API keys, and
 * nothing is invented — unknown questions fall back to HOLY_KB.fallback().
 *
 * Orb lifecycle driven through window.HOLY_ORB (set by orb.js):
 *   idle -> thinking -> speaking -> idle            (voice ON)
 *   idle -> thinking -> success  -> idle            (voice OFF, answer delivered)
 *   input focus (while idle) -> listening -> idle
 * Voice: browser speechSynthesis, toggle defaults OFF, session-only (no storage).
 * Audio: setAudioLevel() fed by an envelope driven by utterance boundary events.
 *
 * Rendering is text-only (textContent) — user input and KB answers are never
 * parsed as HTML. visibilitychange cancels speech and returns the orb to idle. */
(function () {
  "use strict";

  var THINK_MS = 420;      // visible thinking beat before the (instant) KB answer
  var SUCCESS_MS = 1100;   // answer-complete beat when voice is off
  var log, form, input, sendBtn, voiceBtn, note;
  var voiceOn = false;     // default OFF — spoken answers are opt-in
  var busy = false;
  var state = "idle";
  var utterance = null;
  var audioRaf = 0;
  var pulse = 0;
  var sawBoundary = false;
  var lastTs = 0;

  function orb() {
    // Lazy: orb.js registers window.HOLY_ORB in its own DOMContentLoaded
    // handler, which runs after this script's — never capture it early.
    return (typeof window !== "undefined" && window.HOLY_ORB) || null;
  }

  function setState(next) {
    state = next;
    var o = orb();
    if (o && typeof o.setState === "function") o.setState(next);
    if (note) note.textContent = String(next).toUpperCase();
  }

  /* ── speech envelope: boundary events pulse the level, rAF decays it ── */
  function startAudio() {
    stopAudio();
    lastTs = 0;
    audioRaf = window.requestAnimationFrame(function tick(ts) {
      var dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
      lastTs = ts;
      pulse = Math.max(0, pulse - dt * 5.5);
      var lvl;
      if (sawBoundary) {
        lvl = 0.22 + 0.78 * pulse;
      } else {
        // Browser fires no boundary events — gentle floor so the orb still
        // reads as speaking instead of frozen.
        lvl = 0.3 + 0.2 * Math.sin(ts / 95) + 0.5 * pulse;
      }
      var o = orb();
      if (o && typeof o.setAudioLevel === "function") o.setAudioLevel(lvl);
      audioRaf = window.requestAnimationFrame(tick);
    });
  }
  function stopAudio() {
    if (audioRaf) window.cancelAnimationFrame(audioRaf);
    audioRaf = 0;
    pulse = 0;
    var o = orb();
    if (o && typeof o.setAudioLevel === "function") o.setAudioLevel(0.55);
  }

  function cancelSpeech() {
    if (typeof window.speechSynthesis !== "undefined") {
      try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    }
    utterance = null;
    stopAudio();
  }

  function speak(text) {
    if (typeof window.speechSynthesis === "undefined" ||
        typeof window.SpeechSynthesisUtterance === "undefined") {
      finishAnswer();
      return;
    }
    cancelSpeech();
    var u = new window.SpeechSynthesisUtterance(text);
    utterance = u;
    sawBoundary = false;
    u.rate = 1.02;
    u.pitch = 1;
    u.onboundary = function () { sawBoundary = true; pulse = 1; };
    u.onend = u.onerror = function () {
      if (utterance !== u) return; // superseded by a newer utterance
      utterance = null;
      stopAudio();
      setState("idle");
    };
    setState("speaking");
    startAudio();
    try { window.speechSynthesis.speak(u); } catch (e) { finishAnswer(); }
  }

  /* ── rendering (text-only, no HTML parsing) ─────────────────────────── */
  function addBubble(kind, text) {
    var div = document.createElement("div");
    div.className = "orb-msg " + kind;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function addLink(bubble, link) {
    if (!link || !link.href || !link.label) return;
    var href = String(link.href);
    // KB-authored links only; never emit script/data URLs.
    if (/^\s*(javascript|data|vbscript):/i.test(href)) return;
    bubble.appendChild(document.createElement("br"));
    var a = document.createElement("a");
    a.href = href;
    a.textContent = String(link.label);
    bubble.appendChild(a);
    log.scrollTop = log.scrollHeight;
  }

  /* ── flow ───────────────────────────────────────────────────────────── */
  function finishAnswer() {
    if (voiceOn) { setState("idle"); return; }
    setState("success");
    window.setTimeout(function () {
      if (state === "success") setState("idle");
    }, SUCCESS_MS);
  }

  function answer(question) {
    var text, entry = null;
    try {
      var res = (typeof window.HOLY_KB !== "undefined" && window.HOLY_KB)
        ? window.HOLY_KB.ask(question) : null;
      if (res && res.entry) { entry = res.entry; text = res.entry.answer; }
      else text = (typeof window.HOLY_KB !== "undefined" && window.HOLY_KB)
        ? window.HOLY_KB.fallback() : "Knowledge base unavailable.";
    } catch (e) {
      setState("error");
      addBubble("orb", "Something broke answering that — try again?");
      window.setTimeout(function () { if (state === "error") setState("idle"); }, 1400);
      return;
    }

    var bubble = addBubble("orb", text);
    if (entry && entry.link) addLink(bubble, entry.link);

    if (voiceOn) speak(text);
    else finishAnswer();
  }

  function ask(question) {
    if (busy) return;
    busy = true;
    sendBtn.disabled = true;
    cancelSpeech();
    addBubble("me", question);
    setState("thinking");
    window.setTimeout(function () {
      answer(question);
      busy = false;
      sendBtn.disabled = false;
    }, THINK_MS);
  }

  /* ── wiring ─────────────────────────────────────────────────────────── */
  function init() {
    log = document.getElementById("orbLog");
    form = document.getElementById("orbForm");
    input = document.getElementById("orbInput");
    sendBtn = document.getElementById("orbSend");
    voiceBtn = document.getElementById("orbVoice");
    note = document.getElementById("orbState");
    if (!log || !form || !input || !sendBtn || !voiceBtn) return;

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var q = input.value.trim();
      if (!q) return;
      input.value = "";
      ask(q);
    });

    voiceBtn.addEventListener("click", function () {
      voiceOn = !voiceOn;
      voiceBtn.setAttribute("aria-pressed", voiceOn ? "true" : "false");
      voiceBtn.textContent = voiceOn ? "VOICE ON" : "VOICE OFF";
      if (!voiceOn) cancelSpeech();
    });

    input.addEventListener("focus", function () {
      if (state === "idle") setState("listening");
    });
    input.addEventListener("blur", function () {
      if (state === "listening") setState("idle");
    });

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "hidden") return;
      cancelSpeech();
      busy = false;
      sendBtn.disabled = false;
      if (state !== "idle") setState("idle");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
