# BlockBuster — Demo Video Script

**Target length:** ~3 minutes. Every number in this script is from your actual verified run (Mysore Road + Bellary Road 1, hour 18) — say them exactly.

*Italicised lines are delivery notes — don't say them out loud.*

---

### [0:00–0:15] Cold open

*(Black screen or a still of real Bengaluru traffic. No UI yet.)*

> "Bengaluru loses close to a billion dollars a year to traffic. Every team here will show you a dashboard. We're going to show you something different — a system that's allowed to act on the city's behalf, but only after it's **proven, out loud, that it deserves to**. This is BlockBuster."

---

### [0:15–0:40] What "Honest AI" means — said once, clearly

*(Screen: landing page → click "Enter Dashboard" → Overview.)*

> "Underneath this dashboard are three engines doing all the real work: a prediction model, a traffic simulator, and a routing engine. Every one of them is **deterministic code, not a black box**. There's also a language model, but it has exactly one job — write the briefing in plain English *after* the engines have already decided. It never makes a decision itself. Separating the parts that *think* from the one part that only *explains* — that's the whole idea."

> "Right now: **301 marshals on duty, zero active incidents**. Real live data, not a number typed in for the demo."

---

### [0:40–0:55] The system never sleeps

*(Screen: quick cuts — Marshals → Signals → Roadworks, ~4 seconds each.)*

> "Before disaster hits, the system is already working. **Marshals** shows officer availability at every station in real time. **Signals** recommends timing changes for corridors that are running hot — and we label it honestly: *recommendation engine*, we don't pretend to control real traffic lights yet. **Roadworks** lets the city model a scheduled closure and see its impact *before* it happens, using the same simulation engine as a live emergency. Now — let's give it one."

---

### [0:55–1:10] Injecting the disaster

*(Screen: create incident — Mysore Road + Bellary Road 1, hour 18.)*

> "Six PM. Evening rush. We've just lost two major arteries to a road collapse — **Mysore Road and Bellary Road 1**. Together, nearly **ten thousand vehicles an hour**. That traffic doesn't disappear — it has to go somewhere, instantly."

*(Trigger the playbook stream.)*

---

### [1:10–2:00] The centerpiece — it checks its own work

*(Screen: Live Script Execution log streaming.)*

> "Watch this log. This isn't a loading animation — it's the actual reasoning, line by line, in real time."

> "First: it checks the two roads it's sworn to protect — **Bannerghata Road**, which feeds a major hospital, and **CBD 1**, the government district. The spillover just overloaded both. A normal system stops there. Ours re-runs the entire simulation, refusing to spill any more traffic onto those roads — and look: **'PASSED AFTER REROUTE.'** It didn't just predict the damage, it corrected its own first answer before showing it to a human."

> "Now watch it find a diversion. It proposes Tumkur Road through CBD 2 to Old Madras Road — and immediately rejects itself. CBD 2 is at ninety-four percent capacity. It tries again. Rejected. **Eleven attempts, eleven honest rejections**, every route blocked by that same overloaded junction. So it does the honest thing: it takes the *least bad* option and **tells you exactly why** — 26.3 minutes, bottleneck at CBD 2, 0.937 V/C. It's not hiding that this isn't a perfect answer. It's showing you the real one."

---

### [2:00–2:25] The Judging Panel — the actual safety gate

*(Screen: Judging Panel — Safety / Feasibility / Clarity, all green, "APPROVE.")*

> "Before anything reaches a single officer, an **independent panel inside the system checks its own output** against three plain-language questions. Did it protect what it was supposed to? *Safety — pass.* Is there a real route, and are there enough officers — twenty-nine available, three needed? *Feasibility — pass.* Can a human understand exactly where the problem is? *Clarity — pass, bottleneck named explicitly.*"

> "This isn't a formality. On an earlier run, this same panel **refused** — flagged no viable route and locked the dispatch button, because the situation didn't justify acting yet. The system doesn't always say yes. That's what makes it trustworthy when it does."

---

### [2:25–2:50] Real dispatch, real proof

*(Screen: four-part Response Plan, then click Dispatch. Cut to phone visible on camera.)*

> "With approval given — signal priority on three corridors, barricades on both collapsed roads, marshals from Chamarajpet two minutes away, public advisory with the exact diversion. Watch Commander signs off. We dispatch, now."

*(Click Dispatch. Let the phone buzz on camera before speaking again.)*

> "That's not a toast notification pretending to be a message. That's a **real SMS through Twilio**, sent the second the system decided it had actually earned the right to send it."

---

### [2:50–3:00] Close

*(Screen: landing page or closing slide.)*

> "The prediction model underneath this scores an **AUC-ROC of 0.81 — nearly three times better than random**, on real historical data you can verify yourself on the Analytics page. BlockBuster shows every road it considered and rejected, every check it ran on itself, and it only acts once it's proven — to a human, in plain language — that it should. That's not a feature. That's the reason a traffic police department could actually trust this enough to use it."

> "**BlockBuster. Honest AI for city traffic command.** Thank you."

---

## Delivery notes

- **The negotiation log section (1:10–2:00) is your most important minute.** Don't rush it — read two or three rejected attempts out loud, let the log scroll in the background for the rest.
- **"It refused on an earlier run"** is true and worth keeping — it's the single best proof the Judging Panel isn't decoration. Cut to a screenshot of that `REVIEW_REQUIRED` result if you have one.
- **Rehearse the SMS timing once before recording.** A few seconds of silence while the phone buzzes is more convincing than filling it with words.
- **Keep a backup recording** of a previous successful dispatch in case Twilio has a hiccup on the day.
