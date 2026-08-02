# FAULTLINE Remotion incident film

The submission composition is `FaultlineFilmV2`: an editable 1920×1080, 30 fps film
with a runtime of 1 minute 40 seconds. The legacy 2:02 composition remains available
for comparison but is not the submission cut.

## The cut

The film is a voiceless incident thriller. A type change enters DataHub, FAULTLINE
traces the production-model blast radius, proves a score, tests a counterfactual,
stages governed writes, asks for a human approval phrase, and verifies that the graph
remembers. Five purposeful clicks operate visible controls without page-length
scrolling. Product events cause every camera move and transition.

Short kinetic phrases carry only the essential argument. The original 104 BPM stereo
score at `public/audio/faultline-v2-score.wav` is synchronized to lineage hops,
evidence arithmetic, authorization, and the six-note verification payoff.

The frame-accurate plan is in
`../docs/demo-film-v2-director-script.md`; the concise current rundown is in
`../docs/demo-script.md`.

## Generate the original scores

```bash
python scripts/generate_audio.py
```

The script generates the legacy ambient bed and the v2 score from deterministic
noise, oscillators, envelopes, and event cues. Neither contains speech or third-party
music.

## Preview and render

```bash
npm install
npm run studio
npm run typecheck
npm run render:quick
npm run render
```

Outputs:

- `out/faultline-demo.mp4` — submission cut;
- `out/faultline-preview.mp4` — half-resolution pacing render;
- `out/faultline-demo-v2.mp4` — optional alternate filename;
- `out/faultline-demo-legacy.mp4` — legacy composition when explicitly rendered;
- `out/faultline-thumbnail.png` — submission thumbnail.

The current composition lives in `src/FaultlineFilmV2.tsx`, with dedicated styling
in `src/styles-v2.css`. The legacy composition remains in `src/FaultlineFilm.tsx`.

## Verified delivery render

- Remotion 4.0.499
- Node.js 22.18.0
- H.264 video, 1920×1080, 30 fps
- AAC stereo audio, 48 kHz
- No voiceover or third-party music
- CRF 22 delivery encode
- Runtime: 100.053 seconds
- Audio: approximately −20.8 LUFS integrated, −1.3 dBTP
- SHA-256: `A32354C31D5F47024B42682995C16CBA57A31E27F579230F095CC6AF63DECFE3`
