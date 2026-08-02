# FAULTLINE Remotion films

The recommended submission cut is `FaultlineFilmV2`, runtime 1 minute 40 seconds.
The original `FaultlineFilm` remains available as a 2 minute 2 second alternate.

## Recommended submission cut — v2

The v2 film is a voiceless incident thriller: a type change enters DataHub, FAULTLINE
traces the production-model blast radius, proves a score, tests a counterfactual,
stages governed writes, asks for a human approval phrase, and verifies that the graph
remembers. It contains five purposeful clicks and no page-length scrolling. The
frame-accurate director's script is in `../docs/demo-film-v2-director-script.md`.

```bash
npm run typecheck
npm run render:v2
```

The final v2 file is written to `out/faultline-demo-v2.mp4`.

## Alternate original cut

The original composition remains editable and renderable with `npm run render`.

Editable 1920×1080, 30 fps demo film. Runtime: 2 minutes 2 seconds.

The film is a deterministic React composition: no remote fonts, runtime APIs, or
third-party footage. It is deliberately voiceless; frame-driven kinetic captions
carry the story through staged word reveals, semantic highlights, directional
transitions, scan lines, and restrained glitch echoes over an original ambient score
bundled under `public/audio`. Each chapter opens with a campaign punch card and uses
impact flashes, hard shutters, parallax HUD motion, camera pushes, speed lines, and
animated telemetry. The center of the film is a continuous cursor-driven product
session: click investigation, replay lineage, inspect evidence, switch failure modes,
download the receipt, type approval, authorize, and verify write-back.

## Generate the original ambient score

```bash
python scripts/generate_audio.py
```

`ambient-bed.wav` is synthesized locally from deterministic noise and sine waves; it
contains no speech or third-party music.

## Preview and render

```bash
npm install
npm run studio
npm run typecheck
npm run still
npm run render
```

Outputs:

- `out/faultline-demo.mp4`
- `out/faultline-thumbnail.png`
- `out/faultline-demo-v2.mp4` (recommended submission)

All scene timing and visuals remain editable in `src/FaultlineFilm.tsx`. Scene
constants live in `src/constants.ts`; the timed visual rundown is documented in
`../docs/demo-script.md`.

Verified render:

- Remotion 4.0.499
- Node.js 22.18.0
- H.264 video, 1920x1080, 30 fps
- AAC stereo audio, 48 kHz
- No voiceover; original ambient score only
- CRF 22 delivery encode with fast-start metadata
- v2: 100.053 seconds
