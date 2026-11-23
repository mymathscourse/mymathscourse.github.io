/* Works out "this week" from today's date. Add ?today=2027-02-01 to any page to preview another date. */
(function () {
  const DAY = 864e5;
  const q = new URLSearchParams(location.search).get("today");
  const today = q ? new Date(q + "T12:00:00") : new Date();
  const toDate = s => new Date(s + "T00:00:00");
  const short = s => toDate(s).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const status = s => { const d = toDate(s); return today < d ? "next" : today - d < 7 * DAY ? "now" : "done"; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  // Mark schedule rows and topic weeks as done / this week / coming up.
  document.querySelectorAll("[data-start]").forEach(e => e.classList.add("is-" + status(e.dataset.start)));

  // Keep q (the preview date) on links so previewing a date carries across pages.
  if (q) document.querySelectorAll("a[href$='.html']").forEach(a => { if (!a.target) a.href += "?today=" + q; });

  function titleLink(w) {
    if (!w.href) return el("span", null, w.title);
    const a = el("a", null, w.title); a.href = w.href + (q ? "?today=" + q : ""); return a;
  }

  document.querySelectorAll("[data-weeks]").forEach(box => {
    const weeks = JSON.parse(box.dataset.weeks);
    const full = box.dataset.mode === "full";
    const i = weeks.findIndex(w => status(w.start) === "now");
    const nextI = weeks.findIndex(w => status(w.start) === "next");
    box.textContent = "";
    if (!full) {
      if (i >= 0) { box.append("This week: ", el("strong", null, weeks[i].title)); }
      else if (nextI >= 0) { box.append(`Holiday · back w/c ${short(weeks[nextI].start)}: `, el("strong", null, weeks[nextI].title)); }
      else box.textContent = "Schedule finished";
      return;
    }
    const card = el("div", "now-card");
    if (i >= 0) {
      const w = weeks[i];
      card.append(el("p", "eyebrow", `This week · w/c ${short(w.start)}${w.note ? " · " + w.note : ""}`));
      const h = el("h2"); h.append(titleLink(w)); card.append(h);
      if (w.points.length) { const ul = el("ul"); w.points.forEach(p => ul.append(el("li", null, p))); card.append(ul); }
    } else if (nextI >= 0) {
      card.append(el("p", "eyebrow", nextI === 0 ? "Not started yet" : "Holiday"));
      card.append(el("h2", null, `Back w/c ${short(weeks[nextI].start)}`));
    } else {
      card.append(el("p", "eyebrow", "All done"), el("h2", null, "Every week on the schedule is finished."));
    }
    box.append(card);
    const upcoming = weeks.slice(i >= 0 ? i + 1 : Math.max(nextI, 0)).filter(w => status(w.start) === "next").slice(0, 3);
    if (upcoming.length) {
      const side = el("div", "next-card");
      side.append(el("p", "eyebrow", "Coming up"));
      const ol = el("ol");
      upcoming.forEach(w => { const li = el("li"); li.append(el("span", "d", "w/c " + short(w.start)), titleLink(w)); ol.append(li); });
      side.append(ol); box.append(side);
    }
  });

  // Remember the last course looked at, and offer it on the front page.
  const course = document.body.dataset.course;
  if (course) store.set("course-site:last", course);
  const resume = document.querySelector(".resume");
  const last = store.get("course-site:last");
  const card = last && document.querySelector(`.ccard[data-id="${CSS.escape(last)}"]`);
  if (resume && card) {
    card.classList.add("last");
    const a = el("a", "btn", `Go to ${card.querySelector(".cname").textContent} →`);
    a.href = card.getAttribute("href") + (q ? "?today=" + q : "");
    resume.append("Last time you looked at ", el("strong", null, card.querySelector(".cname").textContent), ". ", a);
    resume.hidden = false;
  }
})();
