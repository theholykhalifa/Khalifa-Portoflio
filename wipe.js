/* HOLY // one-click data erasure for this browser.
   Wipes every localStorage + sessionStorage key this site has ever written
   (profile, scores, settings, admin session, consent — everything), then
   offers a prefilled email to request deletion of any cloud account
   (Supabase profile/score rows keyed to your callsign or email).
   Trigger: any element with [data-wipe]. Works on every page. */
(function () {
  function collect() {
    var local = [], session = [];
    try { for (var i = 0; i < localStorage.length; i++) local.push(localStorage.key(i)); } catch (e) {}
    try { for (var j = 0; j < sessionStorage.length; j++) session.push(sessionStorage.key(j)); } catch (e) {}
    return { local: local, session: session };
  }

  function wipe() {
    var before = collect();
    try { localStorage.clear(); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}
    return before;
  }

  function mailtoFor(callsign) {
    var subject = "Delete my data — HOLY portfolio";
    var body = "Hello,\n\n" +
      "Please delete all data linked to me on the HOLY portfolio site.\n\n" +
      (callsign ? "Callsign on the site: " + callsign + "\n" : "") +
      "Email used (if any): \n" +
      "Supabase account UUID (if known): \n\n" +
      "I understand this removes my profile, scores and any account permanently.\n\n" +
      "Thank you.";
    return "mailto:HVoid9@proton.me?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function run(btn) {
    var callsign = null;
    try {
      var p = JSON.parse(localStorage.getItem("holy_profile") || "null");
      if (p && p.callsign) callsign = p.callsign;
    } catch (e) {}
    var before = wipe();
    var n = before.local.length + before.session.length;
    var host = btn.parentNode;
    if (!host) return;
    var done = document.createElement("div");
    done.className = "wipe-done mono";
    done.setAttribute("role", "status");
    done.innerHTML = "✓ ERASED — " + n + " store(s) cleared from this browser. " +
      "Cloud rows (profile / scores) are removed on request: " +
      '<a href="' + mailtoFor(callsign) + '">email the deletion request →</a>';
    host.replaceChild(done, btn);
    var note = document.getElementById("consentNote");
    if (note) note.textContent = "CHOICE: CLEARED — YOU WILL BE ASKED AGAIN";
    var cs = window.HOLY_CONSENT;
    if (cs && !cs.get()) cs.show();
  }

  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest && e.target.closest("[data-wipe]");
    if (!t) return;
    e.preventDefault();
    if (window.confirm("Erase all data this site stores in this browser (profile, scores, settings)? This cannot be undone.")) run(t);
  });
})();
