# Method 5 — Session Concept: Slide-by-Slide Outline (Draft v1)

**Session:** Build AI-Powered Apps Faster: Idea to Production with Agentic DevOps — The end-to-end developer journey
**Speaker:** Shailesh Kumar Mishra
**Venue / Slot:** Mumbai AI Day, 11:25 AM – 12:05 PM (40 min)
**Audience:** ~60% leaders (CIO / VP Eng / EA), ~40% practitioners; BFSI-heavy
**Demo mode:** Pre-recorded, live speaker narration
**Argument spine:** *Gap → Familiar Pattern → AIDLC Mechanism (with demo) → Safety Substrate + Monday Step → (optional) ROI → Close*

Time totals: 90s opening + 4min A + 5min B + 17min C + 10min D + 3min E (cuttable) + 90s close ≈ 41 min. Cut Cluster E if needed.

---

## OPENING — 3 slides, ~90 seconds

### Slide 1 — Anecdote cold open
- **Visual:** Black slide. Single quote in centered serif type.
- **On-slide:** *"My developers are three times faster with Copilot. My CISO is three times more nervous."*
- **Speaker:** *"A few weeks ago, the Head of Engineering at a large Indian bank told me this. That sentence is why this session exists."*
- **Time:** ~25 sec

### Slide 2 — Gap statement reveal
- **Visual:** Full-screen, two-line statement, no chrome.
- **On-slide:**
  > **YOUR TOOLS TURNED AGENTIC.**
  > **YOUR ORG CHART DIDN'T.**
- **Speaker:** *"That is the gap. And it is not unique to his bank."*
- **Time:** ~20 sec

### Slide 3 — Speaker frame + 40-min contract
- **Visual:** Speaker name, role, git-ape mark, three contract bullets on right.
- **On-slide:**
  - I lead an open-source project called **git-ape**.
  - It exists because too many teams ship great AI prototypes and stall for six months.
  - In the next 40 minutes I will give you: **(1) a sharper way to name the gap, (2) the methodology that closes it, (3) one Monday step.**
- **Time:** ~45 sec

---

## CLUSTER A — THE GAP — 3 slides, ~4 min

### Slide 4 — The bottleneck moved
- **Visual:** Before/after bar visual. Left: "code = bottleneck (2022)". Right: "decisions = bottleneck (2026)".
- **Speaker:** *"AI did not just speed up coding. It moved the bottleneck. Execution is now cheap. Judgment is now expensive. And your existing process was built for the previous bottleneck."*
- **Time:** ~75 sec

### Slide 5 — Ceremonies of slowness *(provocative)*
- **Visual:** A grid of meeting icons / sprint board / PR review queue — with one strikethrough overlay.
- **On-slide:** *"A sprint is a ceremony for slowing down — when execution was slow, that was a feature. Now it is the cost."*
- **Speaker:** Acknowledges the discomfort. Frames it not as criticism but as *evidence the world changed under your feet.*
- **Time:** ~75 sec

### Slide 6 — The two columns
- **Visual:** Two-column comparison: *Old SDLC* / *Agentic SDLC*. Highlight what is **missing** from the right column (human queues, hand-offs).
- **Speaker:** *"The gap, drawn out. Notice what is missing on the right side — the human queues between every stage."*
- **Time:** ~90 sec

---

## CLUSTER B — THE FAMILIAR PATTERN — 3 slides, ~5 min

### Slide 7 — Title card: "You have done this before"
- **Visual:** Title only.
- **Speaker:** *"Before we go further: this transformation is not new to you. You have done it before. Three times, at least."*
- **Time:** ~20 sec

### Slide 8 — The trading floor analog *(for leaders)*
- **Visual:** Side-by-side: 1985 open-outcry trading floor / 2010 algorithmic trading desk. Caption: *"Trader judgment → risk-limit specs → autonomous execution within bounds."*
- **Speaker:** *"In the 1980s, your trading floor stopped looking like a trading floor. You did not eliminate traders. You encoded their judgment into specifications, and let systems execute within those bounds. Same with credit decisioning. Same with AML."*
- **Time:** ~2 min

### Slide 9 — The CI/CD parallel *(for practitioners)*
- **Visual:** Evolution arrow: Senior reviewer checklist → linters → SAST → policy-as-code (OPA / Sentinel).
- **Speaker:** *"You have done it inside engineering too. Every step on this arrow took a meeting and turned it into a spec. AIDLC is the next step on the same arrow — applied to the whole SDLC, not just one stage."*
- **Time:** ~2 min

---

## CLUSTER C — THE AIDLC MECHANISM (with 3 demo beats) — ~17 min

### Slide 10 — AIDLC introduced
- **Visual:** 4-stage diagram: **Intent → Specification → Agent Reasoning → Validation / Production**. Humans positioned as *encoders* and *checkers*, not as in-line workers.
- **Speaker:** *"AIDLC. The pattern is simple. Human intent gets encoded as specifications. Agents reason within those specifications. Humans validate and approve. Maturity in AIDLC = how much of your human intent you have encoded once, so it never needs to be re-litigated."*
- **Time:** ~90 sec

### Slide 11 — Stage 1 setup
- **Visual:** Question card: *"What is a valid offer?"* Subtitle: *"In your bank — where does this knowledge live today?"*
- **Speaker:** Lets the question sit. Suggests answers: PDFs, meeting notes, tribal memory, a senior person's head. *"Watch what happens when we move it into a spec."*
- **Time:** ~30 sec

### Slide 12 — **DEMO BEAT 1 (recorded)**
- **Visual:** Recorded screen, ~3 min, narrated live.
- **Content:** NL prompt: *"Create a perk: 10% off coffee at any partner café, valid this month, max ₹50, requires audit log."* Demo shows AI generating a structured offer JSON with explicit policy fields. Speaker narrates over the recording.
- **Speaker close:** *"Notice: the spec now contains what used to be tribal memory. That is encoding."*
- **Time:** ~3 min

### Slide 13 — Reflection card
- **Visual:** One line. *"Tribal memory → Structured spec."*
- **Speaker:** ~10 sec pause and pivot.
- **Time:** ~15 sec

### Slide 14 — Stage 2 setup
- **Visual:** Question card: *"How do we handle ambiguity?"*
- **Speaker:** *"Real systems are messy. Merchant codes don't match. Data is dirty. Watch where the human shows up in this loop."*
- **Time:** ~30 sec

### Slide 15 — **DEMO BEAT 2 (recorded)**
- **Visual:** Recorded screen, ~4 min, narrated live.
- **Content:** Dirty SKU / merchant data. Agent reasons through possible matches with confidence scores. **Audit UI** shows the agent's proposed match + reasoning. **Human validator** approves or corrects. Audit trail captured.
- **Speaker close:** *"That moment — the human validates the agent's reasoning — is the new shape of the job."*
- **Time:** ~4 min

### Slide 16 — Reflection card: role mutation
- **Visual:** Two columns. *Roles → Mutations.* PM → AI Workflow Orchestrator. SWE → Agent + Spec Author. Reviewer → Validator of Reasoning. Designer → Communication Architect.
- **Speaker:** *"This is the part of the talk that is honest and uncomfortable: your roles will change. Not be replaced. Mutate. The job gets more interesting, and more cognitively demanding. Pretending otherwise wastes your time."*
- **Time:** ~75 sec

### Slide 17 — Stage 3 setup
- **Visual:** Question card: *"What is allowed to reach production?"*
- **Speaker:** *"This is the question your CRO asks. Watch how it gets answered as a spec, not a meeting."*
- **Time:** ~30 sec

### Slide 18 — **DEMO BEAT 3 (recorded)**
- **Visual:** Recorded screen, ~3 min, narrated live.
- **Content:** Two pushes through git-ape pipeline. Push #1 violates encoded policy ("perk > 50% discount" or "missing audit log") — git-ape blocks it with a clear error. Push #2 is compliant — ships to prod.
- **Speaker close:** *"The encoding executes itself. That is the substrate."*
- **Time:** ~3 min

### Slide 19 — Reflection card
- **Visual:** *"The encoding executes itself."*
- **Time:** ~15 sec

---

## CLUSTER D — SAFETY SUBSTRATE + MONDAY STEP — 6 slides, ~10 min

### Slide 20 — The defensibility question
- **Visual:** A single line: *"How do you tell your CRO this is safe?"*
- **Speaker:** *"Everything I have shown you is meaningless if you cannot answer this question in your own building."*
- **Time:** ~45 sec

### Slide 21 — git-ape: what it is, what it is not
- **Visual:** Two columns. *It is:* policy-as-code substrate for agentic delivery / open source / composable with your existing tooling. *It is not:* a replacement for your platform / a product I am selling you / mandatory.
- **Speaker:** *"git-ape is the substrate I built because customers kept asking me how to make this defensible. It is open source. It composes with what you already use. It exists so you can encode your RBI controls once and stop re-litigating them every release."*
- **Time:** ~2 min

### Slide 22 — RBI / SEBI mapping
- **Visual:** Table. Left: RBI / SEBI control category (e.g., audit trail requirement, change approval, data residency). Center: how it is enforced today (review, manual sign-off, ticket). Right: how it gets encoded as policy-as-code via git-ape.
- **Speaker:** Walk one row in depth. Wave at the rest.
- **Time:** ~2.5 min

### Slide 23 — The Monday step
- **Visual:** A single call-out: **"AIDLC Workshop — 5 days, one real use case, you leave with a working prototype."**
- **Speaker:** Names what the workshop is, who it is for, what it costs in time, what comes back. *"That is the first step. Not a transformation program. One workshop. One use case."*
- **Time:** ~2 min

### Slide 24 — The 90-day pattern
- **Visual:** Timeline: Days 1-5 (Workshop / prototype) → Days 5-30 (Iterate with team) → Days 30-60 (git-ape pilot on one repo) → Days 60-90 (First production agent deployment under encoded policy).
- **Speaker:** *"This is the shape of the next 90 days if you act on what you just saw."*
- **Time:** ~90 sec

### Slide 25 — The engagement ask
- **Visual:** Two QR codes side by side. **Left:** AIDLC Workshop request form. **Right:** git-ape GitHub repository.
- **Speaker:** *"Two ways to engage. Workshop on the left if you want help. Repository on the right if you want to start yourself. Both are real."*
- **Time:** ~45 sec

---

## CLUSTER E (OPTIONAL) — ROI — 1-2 slides, ~3 min

> ⚠️ Cut first if time is tight. Speaker should pre-decide cut threshold (e.g., if Cluster D ends after 11:58 AM, cut to Slide 28 directly).

### Slide 26 *(optional)* — Where to measure
- **Visual:** Four-quadrant: **Speed / Innovation** | **Trust / Quality** | **Talent / Happiness** | **Collaboration at Scale**. DORA metrics anchored under Speed.
- **Speaker:** *"If you do this, here is where to measure. DORA is the floor. The other three are where the real story lives — and the one nobody is reporting on yet is Talent Happiness."*
- **Time:** ~2.5 min

---

## CLOSE — 2 slides, ~90 sec

### Slide 28 — Callback to the opening
- **Visual:** Back to the original quote: *"3x faster. 3x more nervous."*
- **Speaker:** *"We started here. The job of the next 90 days is to remove the second one. Not by going slower, but by encoding what makes you safe — so the agents can move at their pace, inside your bounds."*
- **Time:** ~45 sec

### Slide 29 — Thank you + handoff
- **Visual:** Speaker contact. QR codes again (workshop + repo). Mention of the customer-zero panel coming up at 12:05.
- **Speaker:** *"The next session is the customer panel — you'll hear from teams who have lived this. I'll be in the room. Find me if you want to talk."*
- **Time:** ~30 sec

---

## Slide Count Summary

| Section | Slides | Time |
|---|---|---|
| Opening | 1-3 | 90 sec |
| Cluster A — The Gap | 4-6 | ~4 min |
| Cluster B — Familiar Pattern | 7-9 | ~5 min |
| Cluster C — AIDLC + 3 Demos | 10-19 | ~17 min |
| Cluster D — Safety + Monday | 20-25 | ~10 min |
| Cluster E (optional) | 26 | ~3 min |
| Close | 28-29 | ~90 sec |
| **Total (with E)** | **24 slides** | **~41 min** |
| **Total (cut E)** | **23 slides** | **~38 min** |

Note: slide *numbers* skip in spots (13, 19 are 15-sec punctuation cards) because they are functionally pauses, not slides. Slide 27 was reserved and folded into 26.

---

## Open Items Before Designer Handoff

1. Real anecdote for Slide 1, or generalize.
2. Demo recordings need to be produced (Beats 1, 2, 3). Beat 2 audit UI needs design.
3. Marketing-approved deck template — need to receive before any visual polish work.
4. Confirm Cluster E inclusion decision.
5. Confirm RBI/SEBI mapping rows in Slide 22 against real bank reference if available.
6. Confirm git-ape repo and AIDLC workshop signup URLs / QR code targets.
