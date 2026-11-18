(() => {
  const storageKey = "campus-stores.shift.v2";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  // Desk time as minutes from Friday midnight, so slips can tell when they are late.
  const nowAt = [15 * 60 + 45, 19 * 60 + 30, 24 * 60 + 9 * 60];
  const dueAt = {
    "Fri 8 pm": 20 * 60,
    "Sat 9 am": 24 * 60 + 9 * 60,
    "Sat 10 am": 24 * 60 + 10 * 60,
    "Sat noon": 24 * 60 + 12 * 60,
  };
  const dueTimes = Object.keys(dueAt);
  const original = () => ({
    version: 2,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    returning: "",
    confirm: null,
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    editing: false,
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list) =>
    list
      .map(([v, t]) => '<option value="' + esc(v) + '">' + esc(t) + "</option>")
      .join("");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, good = false) =>
    '<span class="tag' + (good ? " good" : "") + '">' + esc(t) + "</span>";
  const overdue = (l) => !l.back && nowAt[s.phase] > dueAt[l.due];
  const say = (t) => {
    q("[data-status]").textContent = t;
  };
  // A labelled select; `cls` lets the check-in hide fields until they matter.
  const pick = (label, name, options, value = "", cls = "", auto = false) =>
    '<label class="' +
    cls +
    '"><span>' +
    label +
    '</span><select name="' +
    name +
    '"' +
    (auto ? " data-autofocus" : "") +
    '><option value="">Select…</option>' +
    options
      .map(
        ([v, t]) =>
          '<option value="' +
          esc(v) +
          '"' +
          (v === value ? " selected" : "") +
          ">" +
          esc(t) +
          "</option>",
      )
      .join("") +
    "</select></label>";
  const personOpts = people.map((p) => [p, p]);
  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        r.id +
        " · Approved</small><h3>" +
        r.event +
        "</h3><p>" +
        r.club +
        " · Filed by " +
        r.owner +
        "</p><p><b>Return by</b> " +
        r.due +
        "</p><p><b>Approved equipment</b></p><ul>" +
        r.items.map((x) => "<li>" + x + "</li>").join("") +
        "</ul><p>" +
        r.note +
        "</p></div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club,
            btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const status = a.repair
        ? "In repair"
        : out(a.id)
          ? "On loan"
          : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model + " · " + a.bin,
        badge(status, status === "On shelf"),
      );
    }
    return html;
  }
  // Check a whole request back in: every open slip gets an explicit outcome,
  // and anything still out keeps its current holder and expected time on the slip.
  function checkIn() {
    if (s.returning === "pick") {
      const open = requests.filter((r) =>
        s.loans.some((l) => l.req === r.id && !l.back),
      );
      let html = "<p>Which kit is coming back?</p>";
      if (!open.length) html += "<p>No requests have equipment out.</p>";
      for (const r of open) {
        const n = s.loans.filter((l) => l.req === r.id && !l.back).length;
        html += row(
          r.id + " · " + r.club,
          r.event + " · " + n + (n === 1 ? " unit" : " units") + " out",
          btn("Check in this kit", "returnReq", r.id),
        );
      }
      return html;
    }
    const r = getReq(s.returning);
    const open = s.loans.filter((l) => l.req === r.id && !l.back);
    let html =
      '<form data-return><p class="lead"><b>' +
      esc(r.id + " · " + r.club + " · " + r.event) +
      "</b><br>Check each unit's label. Anything not handed back stays on its slip with who has it now and when it is expected.</p>";
    open.forEach((l, i) => {
      const a = getAsset(l.asset);
      html +=
        '<fieldset class="checkin" data-slip="' +
        l.num +
        '"><legend><strong>' +
        esc(l.asset + " · " + a.type) +
        "</strong> <small>" +
        esc(a.model + " · bin " + a.bin + " · slip L-" + l.num) +
        '</small></legend><div class="form three">' +
        pick(
          "Outcome",
          "state-" + l.num,
          [
            ["back", "Back at the counter"],
            ["out", "Not returned yet"],
          ],
          "",
          "",
          i === 0,
        ) +
        pick("Now with", "holder-" + l.num, personOpts, "", "whenout") +
        pick(
          "Expected back",
          "expected-" + l.num,
          dueTimes.map((d) => [d, d]),
          "",
          "whenout",
        ) +
        "</div></fieldset>";
    });
    return (
      html +
      '<div class="form">' +
      pick("Brought back by", "by", personOpts, open[0] ? open[0].who : "") +
      '</div><button type="submit" class="primary">Save check-in</button></form>'
    );
  }
  function slipRow(l) {
    const a = getAsset(l.asset);
    const r = getReq(l.req);
    const late = overdue(l);
    const lines = [
      a.model + " · bin " + a.bin,
      l.req + " · " + r.club + " · issued to " + l.who + " · due " + l.due,
    ];
    if (!l.back && l.holder)
      lines.push(
        "Now with " +
          l.holder +
          (l.expected ? " · expected " + l.expected : ""),
      );
    if (l.back)
      lines.push(
        "Returned by " +
          (l.backBy || l.who) +
          (shifts[l.backAt] ? " · " + shifts[l.backAt].time : ""),
      );
    const right = l.back
      ? badge("Returned")
      : (late
          ? '<span class="tag late">Overdue · due ' + esc(l.due) + "</span>"
          : "") + btn("Record return", "return", String(l.num));
    let html =
      '<div class="row' +
      (late ? " attention" : "") +
      '"><div><strong>' +
      esc("L-" + l.num + " · " + l.asset + " · " + a.type) +
      "</strong>" +
      lines.map((t) => "<small>" + esc(t) + "</small>").join("") +
      '</div><div class="rowactions">' +
      right +
      "</div></div>";
    if (s.confirm === l.num && !l.back) {
      const twins = assets.filter((x) => x.type === a.type && x.id !== a.id);
      html +=
        '<form data-confirm class="record confirm"><p><b>Check the unit before closing L-' +
        l.num +
        ".</b> Its label should read <b>" +
        esc(l.asset) +
        "</b>: " +
        esc(a.model + " " + a.type) +
        "." +
        (twins.length
          ? " Not to be confused with " +
            twins
              .map((x) => esc(x.id + " (" + x.model + ", bin " + x.bin + ")"))
              .join(", ") +
            "."
          : "") +
        '</p><div class="form">' +
        pick("Returned by", "by", personOpts, l.holder || l.who, "", true) +
        '</div><div class="buttons"><button type="submit" class="primary">Confirm ' +
        esc(l.asset) +
        " is back</button>" +
        btn("Cancel", "cancelConfirm") +
        "</div></form>";
    }
    return html;
  }
  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit",
      s.editing || s.returning
        ? btn("Cancel", "cancel")
        : '<div class="buttons tight">' +
            btn("Take a return", "takeReturn") +
            btn("New issue slip", "new", "", "primary") +
            "</div>",
    );
    if (s.returning) return html + checkIn();
    if (s.editing) {
      const available = assets.filter((a) => !a.repair && !out(a.id));
      const select = (label, key, options) =>
        "<label><span>" +
        label +
        '</span><select name="' +
        key +
        '" required><option value="">Select…</option>' +
        opts(options) +
        "</select></label>";
      return (
        html +
        '<form data-issue><div class="form">' +
        select(
          "Approved request",
          "req",
          requests.map((r) => [r.id, r.id + " · " + r.club]),
        ) +
        select(
          "Unit leaving the desk",
          "asset",
          available.map((a) => [a.id, a.id + " · " + a.type]),
        ) +
        select(
          "Collected by",
          "who",
          people.map((p) => [p, p]),
        ) +
        select(
          "Return by",
          "due",
          ["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"].map((d) => [d, d]),
        ) +
        '</div><button type="submit" class="primary">Save issue slip</button></form>'
      );
    }
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    const shown = s.loans
      .filter((l) => !s.onlyOpen || !l.back)
      .slice()
      .reverse()
      .sort((a, b) => overdue(b) - overdue(a));
    if (!shown.length) html += "<p>No outstanding slips.</p>";
    for (const l of shown) html += slipRow(l);
    return html;
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes) {
      const slip = n.loan && s.loans.find((l) => l.num === n.loan);
      entries.push([
        shifts[n.phase].time,
        slip
          ? "Return check-in · slip L-" +
            slip.num +
            (slip.back ? " (now closed)" : " (still open)")
          : "Counter handover",
        n.text,
      ]);
    }
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
    const focus = q("[data-autofocus]");
    if (focus) focus.focus();
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Shift time updated.";
        break;
      case "tab":
        s.tab = v;
        s.editing = false;
        s.returning = "";
        s.confirm = null;
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        s.returning = "";
        s.confirm = null;
        break;
      case "takeReturn":
        s.returning = "pick";
        s.editing = false;
        s.confirm = null;
        break;
      case "returnReq":
        if (getReq(v)) s.returning = v;
        break;
      case "cancel":
        s.editing = false;
        s.returning = "";
        break;
      case "cancelConfirm":
        s.confirm = null;
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "return": {
        // Closing a slip now asks the desk to check the unit first.
        const l = s.loans.find((l) => l.num === Number(v));
        if (!l || l.back) return;
        s.confirm = l.num;
        break;
      }
    }
    commit();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
    if (e.target.matches('[name^="state-"]'))
      e.target
        .closest(".checkin")
        .toggleAttribute("data-out", e.target.value === "out");
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved.");
      return;
    }
    if (f.matches("[data-confirm]")) {
      const l = s.loans.find((l) => l.num === s.confirm);
      const by = form.get("by");
      if (!l || l.back) return;
      if (!people.includes(by)) return say("Record who brought the unit back.");
      l.back = true;
      l.backBy = by;
      l.backAt = s.phase;
      s.confirm = null;
      commit(
        l.asset + " returned by " + by + ". Slip L-" + l.num + " closed.",
      );
      return;
    }
    if (f.matches("[data-return]")) {
      const r = getReq(s.returning);
      if (!r) return;
      const plan = s.loans
        .filter((l) => l.req === r.id && !l.back)
        .map((l) => ({
          l,
          state: form.get("state-" + l.num),
          holder: form.get("holder-" + l.num),
          expected: form.get("expected-" + l.num),
        }));
      const by = form.get("by");
      if (plan.some((p) => !p.state))
        return say("Mark every unit as back at the counter or not returned yet.");
      if (
        plan.some(
          (p) =>
            p.state === "out" &&
            (!people.includes(p.holder) || !dueAt[p.expected]),
        )
      )
        return say(
          "For each unit not returned, record who has it now and when it is expected.",
        );
      if (plan.some((p) => p.state === "back") && !people.includes(by))
        return say("Record who brought the kit back.");
      const back = [],
        still = [];
      for (const p of plan) {
        const l = p.l;
        if (p.state === "back") {
          l.back = true;
          l.backBy = by;
          l.backAt = s.phase;
          back.push(l.asset);
          continue;
        }
        const a = getAsset(l.asset);
        l.holder = p.holder;
        l.expected = p.expected;
        still.push(l.asset + " with " + p.holder);
        s.notes.push({
          phase: s.phase,
          loan: l.num,
          text:
            r.club +
            " (" +
            r.id +
            "): " +
            l.asset +
            " " +
            a.type +
            " (" +
            a.model +
            ") did not come back with the kit. Now with " +
            p.holder +
            ", expected " +
            p.expected +
            ". Slip L-" +
            l.num +
            " stays open; check the label reads " +
            l.asset +
            " before closing it.",
        });
      }
      s.returning = "";
      commit(
        (back.length ? "Returned " + back.join(", ") + ". " : "") +
          (still.length
            ? "Still out: " +
              still.join(", ") +
              ". Logged on the slip and in the Desk book."
            : "Kit complete."),
      );
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    const unit = getAsset(asset),
      r = getReq(req);
    if (!r || !unit || unit.repair || out(asset) || !people.includes(who))
      return;
    if (!r.items.includes(unit.type)) {
      q("[data-status]").textContent =
        "This equipment type is outside the approved request. Choose an approved unit.";
      return;
    }
    if (
      s.loans.some(
        (l) => l.req === req && !l.back && getAsset(l.asset).type === unit.type,
      )
    ) {
      q("[data-status]").textContent =
        "The approved quantity of this equipment type is already on loan.";
      return;
    }
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({ num, req, asset, who, due, back: false });
    s.editing = false;
    commit("Issued " + asset + " to " + who + " on slip L-" + num + ".");
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 2 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) =>
          n &&
          shifts[n.phase] &&
          typeof n.text === "string" &&
          (n.loan === undefined || Number.isInteger(n.loan)),
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l &&
          getReq(l.req) &&
          getAsset(l.asset) &&
          Number.isInteger(l.num) &&
          dueAt[l.due] !== undefined &&
          (l.holder === undefined || people.includes(l.holder)) &&
          (l.expected === undefined || dueAt[l.expected] !== undefined),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      // Half-finished forms do not survive a reload.
      editing: false,
      returning: "",
      confirm: null,
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
