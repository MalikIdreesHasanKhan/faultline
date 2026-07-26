# FAULTLINE Remotion film

Editable 1920×1080, 30 fps demo film. Runtime: 2 minutes 26 seconds.

The film is a deterministic React composition: no remote fonts, runtime APIs, or
third-party footage. Remotion reads bundled audio from `public/audio` and renders
the complete submission-ready MP4 locally.

## Generate original audio

```bash
python -m pip install edge-tts
python scripts/generate_audio.py
```

Narration is generated as seven scene-aligned clips. `ambient-bed.wav` is synthesized
locally from deterministic noise and sine waves; it contains no third-party music.

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

All scene timing and visuals remain editable in `src/FaultlineFilm.tsx`. Scene
constants live in `src/constants.ts`; the timed narration is documented in
`../docs/demo-script.md`.

Verified render:

- Remotion 4.0.499
- Node.js 22.18.0
- H.264 video, 1920x1080, 30 fps
- AAC stereo audio, 48 kHz
- 146.048 seconds
