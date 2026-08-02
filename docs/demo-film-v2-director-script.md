# FAULTLINE film v2 — director's script

**Working title:** `ONE CHANGE. EVERY CONSEQUENCE.`  
**Runtime:** 1:40 exactly (3,000 frames at 30 fps)  
**Format:** 1920×1080, 16:9, H.264, voiceless, original or properly licensed music  
**Status:** Pre-production script. This document does not describe the current render.  
**Primary category:** Production ML Agents

## The film in one sentence

A harmless-looking type change enters DataHub, FAULTLINE races through the context
graph to find the production model in its path, proves its recommendation, asks a
human for authority, and writes the evidence back so the graph remembers.

That is the story. Anything that does not serve it is cut.

## The idea judges should remember

> FAULTLINE turns one DataHub signal into a governed, explainable ML incident
> response — then writes the evidence back.

The film is not a narrated feature inventory and not a slow screen recording. It is
a miniature incident thriller told through the working product. Data flows left to
right. Risk moves toward the viewer. Approval reverses the motion and sends durable
context back into DataHub.

## Creative rules

1. **The product causes every transition.** A click, lineage pulse, selected asset,
   score expansion, or verified write changes the shot. No decorative scene change
   may interrupt the product.
2. **Show consequences, not cursor travel.** The cursor appears only for meaningful
   choices. It never wanders, parks, or performs a long scroll.
3. **One visual question per shot.** Source change, blast radius, proof, alternative,
   authority, memory. Never show the entire dashboard merely because it exists.
4. **Text is choreography, not subtitles.** Copy enters beside the thing it names,
   becomes part of the composition, and exits as soon as the point lands.
5. **Motion reveals meaning.** Lineage traces downstream. Evidence stacks into a
   score. Approval sends context upstream. Motion is directional and causal.
6. **Keep the claims exact.** `BLOCK` is a recommended response. FAULTLINE writes
   tags and an incident document to DataHub; it does not claim that a tag itself
   blocks a deployment.
7. **The bundled scenario is labelled.** Use `INCIDENT REPLAY` and
   `CREDENTIAL-FREE JUDGE SCENARIO` at least once. Do not pass the fixture off as a
   live customer incident.

## Pacing map

| Act | Time | Dramatic job | Judge learns |
| --- | ---: | --- | --- |
| I — The tremor | 0:00–0:15 | Hook with one tiny change and a large unknown | The problem is immediate and real |
| II — The trace | 0:15–0:55 | Run FAULTLINE and prove the blast radius | Deep DataHub lineage use and explainability |
| III — The decision | 0:55–1:22 | Test an alternative, stage action, require approval | Originality, useful judgment, safe execution |
| IV — The memory | 1:22–1:40 | Verify write-back and close with proof | End-to-end function and durable DataHub value |

## Frame-accurate master script

### 0:00–0:04 — Cold open: the smallest possible incident

**Picture**

Black. At frame 12, a single monospace event types itself in the center:

```text
02:17:04  raw_orders.order_total  DECIMAL(18,2) → VARCHAR
```

`VARCHAR` lands in red. A hairline fault travels out of the word and cracks the
black field into the first lineage edge. Do not reveal a browser window yet.

**On-screen copy**

```text
ONE COLUMN CHANGED.
```

The sentence appears for 1.4 seconds, with `ONE` physically smaller than
`CHANGED`.

**Sound**

Start in silence. One dry key click per changed token, then a low sub hit when
`VARCHAR` lands. The score begins as a barely audible 104 BPM pulse.

**Purpose**

Open on the real incident data, not a logo. The audience understands the trigger
before learning the product name.

### 0:04–0:10 — The consequence arrives

**Picture**

The crack becomes a bright DataHub lineage path. The camera races along it as nodes
materialize in depth:

```text
Snowflake → Feast → ML feature → MLflow model → production deployment
```

Each node emits one compact identity label as it is crossed. The final deployment
pulses red and pushes a distortion wave through the frame. A small corner label
reads `INCIDENT REPLAY`.

**On-screen copy**

```text
FIVE ASSETS EXPOSED.
WHICH MODEL BREAKS NEXT?
```

These are consecutive beats, never simultaneous. `WHICH MODEL BREAKS NEXT?` lands
on the red deployment and remains for 1.8 seconds.

**Sound**

One percussive tick per lineage hop. The last tick is deliberately missing; the
unresolved beat creates tension.

### 0:10–0:15 — Product reveal

**Picture**

The red deployment node contracts into the slash of the `F//` mark. FAULTLINE
resolves around it. The title moves upward and becomes the actual console header as
the browser interface assembles below it. This is a match cut, not a title card
followed by a separate screen.

**On-screen copy**

```text
FAULTLINE
Catch the upstream tremor before the model breaks.
```

The tagline stays smaller and static. The title is visible for no more than 2.2
seconds before becoming UI.

### 0:15–0:22 — Trigger the investigation

**Picture**

The actual hero region is visible. The mode badge reads
`CREDENTIAL-FREE JUDGE SCENARIO · 4 SECONDS`. A cursor enters on a clean curved path
and clicks **Trigger incident replay** at 0:17.5.

The button responds immediately:

```text
TRAVERSING DATAHUB…
```

Do not scroll. The click sends a seismic ring out of the button; that ring wipes
directly into the incident workspace while the browser chrome stays continuous.

**Product state shown**

- source signal: `type_changed`
- field: `order_total`
- before/after: `DECIMAL(18,2) → VARCHAR`
- DataHub graph state: online

**On-screen copy**

```text
READ THE GRAPH.
```

The words sit on the expanding seismic ring and dissolve into graph edges.

### 0:22–0:34 — Watch the blast radius propagate

**Picture**

The camera is now inside the graph panel, not looking at a whole webpage. The
source appears left. Five downstream nodes propagate in three tight waves. As each
path completes, the corresponding evidence-card edge briefly peeks in from the
right. Risk numbers count only during propagation, then settle.

The camera tracks the dominant path:

```text
raw_orders
  → order_features
  → customer_lifetime_value
  → churn-predictor
  → churn-predictor-blue
```

At 0:31, the deployment node settles at `79`, the model at `92`, and the peak feature
at `93`. The action stamp punches in:

```text
RECOMMENDED ACTION
BLOCK
```

`RECOMMENDED ACTION` must remain attached to `BLOCK` so the film never implies an
autonomous operational block.

**On-screen copy**

```text
DATASET → FEATURE → MODEL → DEPLOYMENT
```

The labels illuminate in sync with the real lineage path. No additional prose.

**Sound**

The beat gains one layer per hop. Use a restrained impact on `BLOCK`, not a trailer
boom.

### 0:34–0:47 — Prove the number

**Picture**

The cursor clicks the `churn-predictor · 92` node. Its path remains bright while all
other paths dim to 20%. The evidence ledger expands out of the node itself, not from
the side of the screen.

Score components stack vertically and physically add into `92`:

```text
+60  type changed
+14  ML model exposure
+12  tier-3 criticality
+12  confirmed column lineage
 +4  production lifecycle
−10  three-hop distance
────
 92  RISK
```

The exact path is readable beneath the stack. Briefly highlight
`order_total` at every confirmed step.

**On-screen copy**

```text
92 IS NOT A GUESS.
```

At 0:43, `NOT A GUESS` folds into a small `EXPLAINABLE` status chip. Let the product
proof remain the hero.

**Sound**

Each contribution lands with a crisp, pitched tick; the arithmetic total resolves
the harmony. This is the film's first satisfying payoff.

### 0:47–0:55 — Seal the evidence

**Picture**

The score stack compresses into the Markdown receipt. The visible details are:

- incident `FLT-7242AEB5`;
- recommended action `BLOCK`;
- confidence `93%`;
- traceable path table;
- a short SHA-256 seal.

The receipt folds into a compact card while the SHA seal draws around it like a
tamper-evident strip. Avoid a full-screen document screenshot.

**On-screen copy**

```text
EVIDENCE YOU CAN INSPECT.
A RECEIPT YOU CAN KEEP.
```

Each line gets 1.4 seconds. The second line leaves with the receipt card.

### 0:55–1:05 — Ask “what if?” once

**Picture**

The receipt card docks at the top-right. The counterfactual rail rises from the
bottom. The cursor clicks **Freshness breach**. That one action morphs the graph:
edge intensity changes, peak risk falls, and the recommendation flips from
`BLOCK` to `RETRAIN`. Keep the original state as a faint outline so the difference
is visible rather than merely stated.

At 1:02.5, the cursor clicks the observed **Type changed** chip to return to the real
incident. Both interactions together should take less than four seconds.

**On-screen copy**

```text
SAME GRAPH.
DIFFERENT FAILURE.
DIFFERENT RESPONSE.
```

Animate each line as a state replacement in the same physical location. Do not
stack them like subtitles.

**Purpose**

This is the originality beat: FAULTLINE is not simply showing lineage; it lets the
responder test how the same context changes the decision.

### 1:05–1:14 — Stage governed action

**Picture**

The observed graph tilts backward and becomes the background of the governance
panel. Six proposed mutations arrive from the affected nodes:

```text
5 × add_tags
1 × save_document
```

Each proposal visibly retains its target asset. Status is `STAGED`; nothing appears
green yet. Policy thresholds slide into their final positions, with `BLOCK ≥ 92`
briefly highlighted.

**On-screen copy**

```text
THE AGENT CAN ACT.
YOU HOLD THE KEY.
```

`THE AGENT CAN ACT` arrives from the graph. `YOU HOLD THE KEY` arrives from the
approval input and replaces it.

### 1:14–1:22 — Human authority

**Picture**

The cursor focuses the approval field. Type
`APPLY FLT-7242AEB5` in three rhythmic bursts, not one character at a time for eight
seconds. The **Authorize writes** button unlocks. The cursor clicks at 1:19.5.

Hold for a quarter-second of silence. Then all six mutations change from `STAGED`
to `VERIFIED` in a fast downstream-to-upstream wave. A compact toast reads:

```text
6 DURABLE CONTEXT WRITES VERIFIED
```

Do not use confetti. The reward is the product state changing.

**Sound**

Music drops under the click. Six verification notes complete the unresolved phrase
from 0:04–0:10.

### 1:22–1:31 — The graph remembers

**Picture**

The verified mutation rows collapse into two MCP calls:

```text
add_tags       ✓ VERIFIED
save_document  ✓ VERIFIED
```

Those calls travel backward along the graph. Risk tags attach to the five assets;
the incident receipt docks to `raw_orders`. A translucent silhouette of a future
agent enters, reads the saved incident context, and immediately highlights the
already-proven path. This is an abstract representation of future reuse, not a fake
third-party UI.

**On-screen copy**

```text
THE NEXT RESPONDER DOESN'T START OVER.
```

After 1.8 seconds, the sentence compresses to:

```text
THE GRAPH REMEMBERS.
```

This is the emotional and product payoff. Give it room.

### 1:31–1:36 — Verifiable engineering proof

**Picture**

One continuous horizontal “proof rail” crosses the screen. Items lock onto it as it
moves; there are no disconnected screenshots:

```text
DATAHUB MCP  ·  15/15 TESTS  ·  READ-AFTER-WRITE  ·  APACHE-2.0
```

Below it, a single terminal command resolves:

```text
faultline demo  →  credential-free in four seconds
```

Do not spend time animating a test runner from zero. Show the final verified facts
cleanly and legibly.

**On-screen copy**

```text
WORKING SOFTWARE. INSPECTABLE EVIDENCE.
```

### 1:36–1:40 — Close

**Picture**

The proof rail becomes a calm seismograph. One final pulse draws the FAULTLINE mark.
The background contains a very faint completed lineage path—not generic particles.

**Final lockup**

```text
F// FAULTLINE
CATCH THE TREMOR BEFORE THE MODEL BREAKS.

BUILT WITH DATAHUB MCP
```

Hold the complete lockup for 2.8 seconds. No late glitch may disturb readability.
End on the next heartbeat, not a long fade.

## Exact text inventory

These are the only campaign-scale phrases allowed in the film:

1. `ONE COLUMN CHANGED.`
2. `FIVE ASSETS EXPOSED.`
3. `WHICH MODEL BREAKS NEXT?`
4. `READ THE GRAPH.`
5. `92 IS NOT A GUESS.`
6. `EVIDENCE YOU CAN INSPECT.`
7. `A RECEIPT YOU CAN KEEP.`
8. `SAME GRAPH. DIFFERENT FAILURE. DIFFERENT RESPONSE.`
9. `THE AGENT CAN ACT. YOU HOLD THE KEY.`
10. `THE NEXT RESPONDER DOESN'T START OVER.`
11. `THE GRAPH REMEMBERS.`
12. `WORKING SOFTWARE. INSPECTABLE EVIDENCE.`
13. `CATCH THE TREMOR BEFORE THE MODEL BREAKS.`

No explanatory subtitle bar should be added. Product labels, incident data, metric
names, and button text do not count against this inventory.

## Cursor choreography

There are only five purposeful click moments:

| Time | Action | Story consequence |
| ---: | --- | --- |
| 0:17.5 | Trigger incident replay | Opens the investigation |
| 0:35.0 | Select `churn-predictor · 92` | Reveals the proof behind the score |
| 0:57.5 | Select `Freshness breach` | Demonstrates counterfactual reasoning |
| 1:02.5 | Return to observed `Type changed` | Restores the real decision |
| 1:19.5 | Authorize writes | Commits and verifies durable context |

Typing the approval phrase is the only other cursor sequence. Cursor visibility
begins no more than 0.8 seconds before an action and ends no more than 0.5 seconds
after the resulting state change. Never use a default OS cursor; use the existing
high-contrast film cursor with a visible click compression.

## Camera and transition grammar

- **Macro to micro:** event line → lineage graph → selected node → score components.
- **Micro to decision:** score → receipt → counterfactual → policy → approval.
- **Decision to memory:** verified rows → MCP calls → updated graph → final mark.
- Use straight perspective pushes, graph-edge tracking, match cuts, and state morphs.
- Do not use page-length scrolling, arbitrary zoom pulses, scene shutters, spinning
  HUD rings, speed lines, repeated glitch cards, or camera shake unrelated to the
  incident.
- Never leave a still product frame unchanged for more than 1.5 seconds. Subtle
  motion must carry data: path travel, selection focus, score assembly, state change,
  or a restrained camera drift toward the next action.
- A shot may last longer than five seconds only if the product visibly changes
  within it.

## Typography and color

- Keep the existing industrial sans/monospace system and FAULTLINE palette.
- Off-white is the default. Teal means source/read. Orange means exposed. Red means
  critical or approval boundary. Lime means verified—not merely selected.
- Never color a staged write lime.
- Campaign text must stay within 70% of frame width and at least 120 px from every
  edge. A phrase should be legible on a laptop-sized embedded player.
- Give all large copy at least 24 frames of stable, unblurred reading time after its
  entrance.
- Glitch may displace a duplicate outline by at most 6 px for at most 4 consecutive
  frames. It may not scramble the words judges need to read.

## Music and sound design

The film remains voiceless, but it should not feel mute.

- Compose around **104 BPM** so cuts can land on eighth- and quarter-note boundaries.
- 0:00–0:10: silence → heartbeat/sub pulse → lineage ticks.
- 0:10–0:34: introduce the main rhythmic motif as the product appears and the graph
  propagates.
- 0:34–0:55: pitched evidence ticks create a satisfying arithmetic sequence.
- 0:55–1:14: add syncopation as the counterfactual and governance states change.
- 1:14–1:22: strip the mix around the approval click; let verified writes resolve
  the opening's missing musical beat.
- 1:22–1:40: broaden the harmony, then return to a single calm heartbeat.
- Use original, generated, or explicitly licensed audio only. Target roughly
  `−16 LUFS` integrated and `−1 dBTP`; the video must still work perfectly muted.

## Judging-criteria coverage

| Criterion | Visible proof in the film |
| --- | --- |
| Use of DataHub | Multi-hop dataset → feature → model → deployment lineage; column confirmation; MCP `add_tags` and `save_document`; graph updated afterward |
| Technical execution | Deterministic score arithmetic, incident-scoped approval, read-after-write verification, 15/15 tests, offline demo mode |
| Originality | Seismic lineage language, counterfactual graph replay, evidence receipt, catalog-as-agent-memory payoff |
| Real-world usefulness | A type change is connected to an exposed production model and an actionable, governed response |
| Submission quality | Understandable without sound, complete arc in 100 seconds, actual functioning UI states, exact claims and clear close |

## Instructions to Luna

### Preserve

- the real FAULTLINE incident identifiers, scores, paths, controls, and API outcomes;
- the existing product palette and UI visual identity;
- the no-voiceover decision;
- deterministic/offline rendering;
- 1920×1080 at 30 fps;
- the rule that the film shows the project functioning.

### Replace

- the 90-second continuous webpage scroll;
- prolonged cursor travel;
- captions that sit on screen after their idea has landed;
- repeated campaign punch cards and decorative transition effects;
- full-page compositions where the judge cannot tell where to look;
- the current score if it does not support the beat map above.

### Suggested Remotion scene boundary

```text
ColdOpen             0–120
Consequence        120–300
ProductReveal      300–450
Trigger            450–660
BlastRadius        660–1020
Evidence          1020–1410
Receipt           1410–1650
Counterfactual    1650–1950
Governance        1950–2220
Approval          2220–2460
GraphMemory       2460–2730
ProofRail         2730–2880
Close             2880–3000
```

Build common components for `GraphPath`, `RiskArithmetic`, `IncidentReceipt`,
`ProductCursor`, `MutationRow`, `McpCall`, and `CampaignCopy`. The graph and receipt
must share the same incident-data object so the film cannot drift from the product
facts.

## Review gates before final render

### Story gate

- A viewer who watches only the first 15 seconds can state the problem.
- A viewer who stops at 55 seconds can state what FAULTLINE does and why the score is
  trustworthy.
- A viewer who finishes can explain why DataHub is essential and what is written
  back.

### Product-truth gate

- Every visible click produces the state shown immediately afterward.
- All scores, action labels, entity names, counts, and receipt fields match the
  bundled scenario.
- `BLOCK` is always labelled as a recommendation.
- The film does not claim an external deployment was blocked.
- The fixture and live MCP modes are not conflated.

### Watchability gate

- No slow page scrolling.
- No cursor travel longer than 24 frames.
- No campaign phrase remains after its point is made.
- No shot asks the viewer to read more than one primary idea.
- Every transition is caused by a product action or data movement.
- The final mark is stable and readable for at least 84 frames.

### Delivery gate

- Runtime is exactly 100 seconds and therefore safely under the three-minute rule.
- H.264 1920×1080 at 30 fps with AAC stereo.
- Full decode completes without errors.
- Captions and product labels remain readable in a 640 px-wide player.
- The render contains no third-party trademarks beyond authorized contest/product
  references and no unlicensed music or footage.
- Render and inspect stills at 0:02, 0:08, 0:18, 0:29, 0:40, 0:51, 0:59, 1:09,
  1:20, 1:27, 1:34, and 1:38 before approving the final encode.

## Why this cut is stronger

The previous film demonstrated the product, but its continuous scroll made each
interaction feel equal. This script creates hierarchy. It spends time on the three
ideas that can win a judge's vote—DataHub-native blast-radius reasoning, inspectable
evidence, and governed write-back—and compresses everything else into proof. The
opening question is answered by the product, the approval click resolves the
musical tension, and “the graph remembers” gives the entry a phrase judges can use
when discussing it later.

