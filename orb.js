/* HOLY // Liquid Glass Orb — vanilla host for the ReactDrops Fluid Agent Orb.
 *
 * Source of truth: liquid-glass-core.js (vendored renderer, shaders, presets and
 * defaults from components/liquid-glass-orb.tsx, ReactDrops Component License 1.0
 * — full license retained in that file) and liquid-glass-orb.css.
 *
 * This wrapper mirrors the component's React layer 1:1:
 *   - FluidGlassGradient: host div (--gradient-* vars, circle geometry) + canvas,
 *     createFlowEngine(canvas, tuning, onFrame, material), JSON-equal tuning updates.
 *   - FluidAgentOrb: createAgentMotion(read) wired as onFrame, material uniforms,
 *     aria/data-state from the state, setAudioLevel -> normalizeAudioLevel +
 *     invalidate(), reset().
 *   - Entrance: 0.08 -> 1 over 1.2 s power4.out after a 0.15 s delay, started only
 *     once data-flow-ready is true AND the host is visible AND the page is visible;
 *     skipped entirely under prefers-reduced-motion. The original gsap tween is
 *     reproduced with requestAnimationFrame (identical easing math, power4.out =
 *     1-(1-t)^4) so this dependency-free site gains no third-party script.
 *
 * No demo UI is rendered here: the page shows the component only. State and audio
 * are exposed on window.HOLY_ORB so a future agent can drive them without touching
 * this file (setState("thinking" | "searching" | "speaking" | "error" ...),
 * setAudioLevel(0..1), or pass getAudioLevel for per-frame sampling). */
import {
  createFlowEngine,
  createAgentMotion,
  fluidAgentOrbFragment,
  fluidAgentOrbUniforms,
  fluidAgentOrbDefaults,
  fluidGlassGradientDefaults,
  normalizeAudioLevel,
  agentState,
  fluidAgentOrbStateLabels,
} from "./liquid-glass-core.js";

const AGENT_KEYS = ["state", "thinkingAnimation", "searchingAnimation", "intensity", "preserveWhites", "animateEntrance"];
const CONTAINER_KEYS = ["shape", "size", "aspectRatio", "borderRadius"];

function splitDefaults() {
  const tuning = { ...fluidGlassGradientDefaults };
  const container = {};
  const agent = {};
  for (const [k, v] of Object.entries(fluidAgentOrbDefaults)) {
    if (AGENT_KEYS.includes(k)) agent[k] = v;
    else if (CONTAINER_KEYS.includes(k)) container[k] = v;
    else tuning[k] = v;
  }
  return { tuning, container, agent };
}

/* Entrance port of createFluidAgentOrbEntrance: same gates, same timing. */
function runEntrance(host) {
  const doc = host.ownerDocument;
  const win = doc.defaultView;
  const preference = win.matchMedia("(prefers-reduced-motion: reduce)");
  let started = false;
  let finished = false;
  let raf = 0;
  let visible = typeof IntersectionObserver === "undefined";
  let intersection;
  let changes;

  const disconnect = () => {
    if (intersection) intersection.disconnect();
    if (changes) changes.disconnect();
    doc.removeEventListener("visibilitychange", reveal);
    preference.removeEventListener("change", onPreferenceChange);
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    disconnect();
    host.style.removeProperty("--agent-entrance-scale");
    host.style.removeProperty("opacity");
    host.dataset.orbEntered = "true";
  };
  const tick = (now) => {
    if (finished) return;
    const elapsed = (now - startAt) / 1000;
    if (elapsed < 0.15) { raf = win.requestAnimationFrame(tick); return; }
    const p = Math.min(1, (elapsed - 0.15) / 1.2);
    const eased = 1 - Math.pow(1 - p, 4); // power4.out
    host.style.setProperty("--agent-entrance-scale", String(0.08 + 0.92 * eased));
    host.style.opacity = String(eased);
    if (p < 1) raf = win.requestAnimationFrame(tick);
    else finish();
  };
  let startAt = 0;
  function reveal() {
    if (
      finished || started ||
      !visible ||
      host.dataset.flowReady !== "true" ||
      doc.visibilityState === "hidden"
    ) return;
    started = true;
    disconnect();
    startAt = win.performance.now();
    raf = win.requestAnimationFrame(tick);
  }
  function onPreferenceChange() {
    if (preference.matches) {
      if (raf) win.cancelAnimationFrame(raf);
      finish();
    }
  }

  if (preference.matches) {
    finish();
    return () => {};
  }

  host.style.setProperty("--agent-entrance-scale", "0.08");
  host.style.opacity = "0";
  changes = new MutationObserver(reveal);
  changes.observe(host, { attributes: true, attributeFilter: ["data-flow-ready"] });
  if (!visible) {
    intersection = new IntersectionObserver(
      ([entry]) => { visible = entry ? entry.isIntersecting : false; reveal(); },
      { threshold: 0.15 },
    );
    intersection.observe(host);
  }
  doc.addEventListener("visibilitychange", reveal);
  preference.addEventListener("change", onPreferenceChange);
  reveal();
  return () => {
    if (raf) win.cancelAnimationFrame(raf);
    finished = true;
    disconnect();
    host.style.removeProperty("--agent-entrance-scale");
    host.style.removeProperty("opacity");
    delete host.dataset.orbEntered;
  };
}

/**
 * Mount a Liquid Glass Orb inside `host`. Returns an imperative handle:
 *   setState(s) / setAudioLevel(0..1) / setAudioLevelGetter(fn) / reset() / destroy()
 */
export function createLiquidGlassOrb(host, props = {}) {
  const { tuning: defaultTuning, container: defaultContainer, agent: defaultAgent } = splitDefaults();

  const state = agentState(props.state ?? defaultAgent.state);
  const thinkingAnimation = props.thinkingAnimation ?? defaultAgent.thinkingAnimation;
  const searchingAnimation = props.searchingAnimation ?? defaultAgent.searchingAnimation;
  const intensity = props.intensity ?? defaultAgent.intensity;
  const preserveWhites = props.preserveWhites ?? defaultAgent.preserveWhites;
  const animateEntrance = props.animateEntrance ?? defaultAgent.animateEntrance;
  const size = Number.isFinite(props.size) ? Math.max(40, props.size) : (defaultContainer.size ?? 250);

  const tuning = { ...defaultTuning, ...props.tuning };

  const input = {
    state,
    thinkingAnimation,
    searchingAnimation,
    searchingCurve: props.searchingCurve,
    intensity,
    preserveWhites,
    audioLevel: props.audioLevel ?? 0.55,
    getAudioLevel: props.getAudioLevel,
  };
  let imperative = null;

  const motion = createAgentMotion(() => ({
    state: input.state,
    thinkingAnimation: input.thinkingAnimation,
    searchingAnimation: input.searchingAnimation,
    searchingCurve: input.searchingCurve,
    intensity: input.intensity,
    preserveWhites: input.preserveWhites,
    audioLevel: input.getAudioLevel ? input.getAudioLevel() : (imperative ?? input.audioLevel),
  }));

  // --- DOM: FluidGlassGradient's host div + canvas, circle geometry ---
  const el = document.createElement("div");
  el.className = "fluid-glass-gradient fluid-agent-orb" + (animateEntrance ? " fluid-agent-orb--entrance" : "");
  el.dataset.shape = "circle";
  el.dataset.state = input.state;
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", `AI assistant: ${fluidAgentOrbStateLabels[input.state]}`);
  el.style.width = `min(100%, ${size}px)`;
  el.style.aspectRatio = "1";
  el.style.borderRadius = "50%";
  el.style.setProperty("--gradient-base", tuning.baseColor);
  el.style.setProperty("--gradient-a", tuning.colorA);
  el.style.setProperty("--gradient-b", tuning.colorB);
  el.style.setProperty("--gradient-c", tuning.colorC);
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  el.appendChild(canvas);
  host.appendChild(el);

  const material = {
    fragment: fluidAgentOrbFragment,
    uniformNames: fluidAgentOrbUniforms,
    uniforms: motion.uniforms,
  };
  const engine = createFlowEngine(canvas, tuning, motion.frame, material);

  let cancelEntrance = () => {};
  if (animateEntrance) cancelEntrance = runEntrance(el);

  return {
    element: el,
    setState(next) {
      const s = agentState(next);
      input.state = s;
      el.dataset.state = s;
      el.setAttribute("aria-label", `AI assistant: ${fluidAgentOrbStateLabels[s]}`);
      if (engine) engine.invalidate();
    },
    setAudioLevel(level) {
      imperative = normalizeAudioLevel(level);
      if (engine) engine.invalidate();
    },
    setAudioLevelGetter(fn) {
      input.getAudioLevel = typeof fn === "function" ? fn : undefined;
      if (engine) engine.invalidate();
    },
    reset() {
      motion.reset();
      if (engine) engine.reset();
    },
    destroy() {
      cancelEntrance();
      if (engine) engine.dispose();
      if (el.parentNode) el.parentNode.removeChild(el);
    },
  };
}

/* ── Page wiring: site chrome only, no demo controls ─────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // mobile menu (same bindings as app.js / playground.js)
  const burger = document.getElementById("burger");
  const mmenu = document.getElementById("mmenu");
  const mclose = document.getElementById("mclose");
  if (burger && mmenu) burger.onclick = () => mmenu.classList.add("open");
  if (mclose && mmenu) mclose.onclick = () => mmenu.classList.remove("open");
  if (mmenu) mmenu.querySelectorAll("a.big").forEach((a) => { a.onclick = () => mmenu.classList.remove("open"); });

  const yr = document.getElementById("year");
  if (yr) yr.textContent = String(new Date().getFullYear());

  const stage = document.getElementById("orbStage");
  if (stage) {
    const orb = createLiquidGlassOrb(stage, {
      // Example configuration shipped with the component — colors match this site.
      tuning: {
        baseColor: "#421616", colorA: "#ff0000", colorB: "#000000", colorC: "#ff0000",
        seed: 145, startTime: 18, speed: 1.5, distortion: 0.8,
        clusterCount: 7.2, clusterIntensity: 3, clusterSize: 22.5,
        scale: 0.23, spotSize: 1.15, rotation: 0, softness: 0.31,
        relief: 2.94, refraction: 0.65, roughness: 0, reflection: 1.3,
        caustics: 0, dispersion: 1, colorDistribution: 0.14,
        grain: 0.3, grainSize: 1, paused: false, animateDistortion: true,
        grainMode: "fine", flowType: "drift",
      },
      state: "idle",
      thinkingAnimation: "ripples",
      searchingAnimation: "lens",
      preserveWhites: true,
      animateEntrance: true,
      size: 250,
      audioLevel: 0.55,
    });
    // Agent lifecycle hook: an agent can drive state/voice without rendering per sample.
    window.HOLY_ORB = orb;
  }
});
