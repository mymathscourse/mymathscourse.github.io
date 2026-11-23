/* Added by build.py to topic pages and tools copied from the hubs.
   - Links back to the teaching hub go to the course page on this site instead.
   - Links to files that aren't published become a plain "ask your teacher" note. */
(function () {
  const cfg = window.PUPIL_SITE;
  if (!cfg) return;
  const rootURL = new URL(cfg.root + "/", location.href);
  const published = new Set(cfg.published);
  const hub = new URLSearchParams(location.search).get("hub");
  const home = new URL((hub === "n5" ? cfg.homes.nat5 : hub && cfg.homes[hub]) || cfg.home, rootURL).href;

  function fix(a) {
    if (a.dataset.pupilChecked) return;
    a.dataset.pupilChecked = "1";
    const raw = a.getAttribute("href");
    if (!raw || raw.startsWith("#") || /^(mailto|javascript):/.test(raw)) return;
    const u = new URL(raw, location.href);
    if (u.origin !== rootURL.origin || !u.pathname.startsWith(rootURL.pathname)) return;
    const rel = decodeURIComponent(u.pathname.slice(rootURL.pathname.length));
    if (/(^|\/)index\.html$/.test(rel) && rel.startsWith("files/")) { a.href = home; return; }
    if (rel.startsWith("files/") && !published.has(rel)) {
      const note = document.createElement("span");
      note.className = a.className;
      note.textContent = "Ask your teacher for this one";
      note.style.opacity = ".7";
      a.replaceWith(note);
    }
  }
  const run = () => document.querySelectorAll("a[href]").forEach(fix);
  run();
  new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
})();
