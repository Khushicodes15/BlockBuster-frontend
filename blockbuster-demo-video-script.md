# BlockBuster — Demo Video Script

**Target length:** ~2 minutes. All numbers are from the actual verified run.

*Italicised lines are delivery notes — don't say them out loud.*

---

### [0:00–0:12] Cold open

*(Black screen or Bengaluru traffic still. No UI.)*

> "Bengaluru loses close to a billion dollars a year to traffic. Every team here will show you a dashboard. We're going to show you something different — a system that has to **prove it deserves to act** before it can. This is BlockBuster."

---

### [0:12–0:30] Honest AI — one clear idea

*(Screen: landing page → Enter Dashboard → Overview. 301 marshals, 0 incidents.)*

> "Three engines do all the real work here: a prediction model, a traffic simulator, and a routing engine — all deterministic code, no black box. A language model exists too, but it only has one job: write the briefing in plain English *after* the engines have already decided. It never makes a decision itself. That separation is the whole idea."

---

### [0:30–0:42] Quick tour

*(Screen: fast cuts — Marshals → Signals → Roadworks.)*

> "Before any disaster: **Marshals** tracks officer availability at every station live. **Signals** recommends timing changes for congested corridors — and we call it a recommendation engine, honestly, we don't control real hardware yet. **Roadworks** models a planned closure's impact before it happens, using the same simulation engine as a live emergency. Let's give it one."

---

### [0:42–0:52] Inject the disaster

*(Screen: create incident — Mysore Road + Bellary Road 1, hour 18.)*

> "Six PM. Rush hour. Two major arteries collapse — **Mysore Road and Bellary Road 1**. That's **9,814 vehicles an hour** that have nowhere to go. The system fires immediately."

---

### [0:52–1:30] The log — where it proves itself

*(Screen: Live Script Execution, log streaming.)*

> "Watch the log. This is the actual reasoning, live."

> "First — it checks **Bannerghata Road** and **CBD 1**, the two protected routes. Sure enough, the spillover overloads both. So it re-runs the entire simulation, locking those roads out. Result: **PASSED AFTER REROUTE.** It fixed its own first answer before showing it to anyone."

> "Now it needs a diversion. It proposes Tumkur Road through CBD 2 to Old Madras Road — and its own adversary immediately rejects it. CBD 2 is at **0.94 V/C**, over threshold. It tries again. Rejected. **Eleven attempts, eleven honest rejections**, every route blocked by that same junction. So it takes the least bad option and tells you exactly why — **26 minutes, bottleneck CBD 2 at 0.937**. Not hiding the imperfect answer. Showing you the real one."

---

### [1:30–1:48] Judging Panel + Response Plan

*(Screen: Judging Panel — three green checks, APPROVE. Then Response Plan.)*

> "Before anything leaves this screen, an independent panel inside the system checks three things. Did it protect what it was supposed to? *Safety — pass.* Is the route real, and are there enough officers — **29 available, 3 needed, Chamarajpet 2 minutes away**? *Feasibility — pass.* Can a human understand exactly where the problem is? *Clarity — pass, bottleneck named explicitly.*"

> "Signal priority on 3 corridors. Barricades on both collapsed roads. Marshals deployed. Advisory ready. Watch Commander signs off."

---

### [1:48–2:00] Dispatch + close

*(Screen: click Dispatch. Success notification appears top right.)*

> "One click. Marshals deployed, public advisory sent — confirmed right there in the notification. And underneath all of this: an **AUC-ROC of 0.811, 2.71× better than random**, on 25,557 rows of real historical data you can check yourself on the Analytics page."

*(Screen: Analytics page showing 0.811 / 2.71×.)*

> "BlockBuster shows every road it rejected, every check it ran on itself, and it only acts once it's proven — to a human, in plain language — that it should. **BlockBuster. Honest AI for city traffic command.**"

---

## Delivery notes

- **The log section (0:52–1:30) is the whole demo.** Don't rush it — read two or three rejected attempts out loud, let the rest scroll.
- **"Eleven attempts"** lands better said once cleanly than read one by one.
- **Analytics page** is your proof slide — cut to it on the close line so the numbers are on screen while you say them.
- Keep a backup recording in case of any hiccup on the day.
