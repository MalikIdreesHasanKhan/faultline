"""Generate FAULTLINE's original, deterministic film scores."""

from __future__ import annotations

import math
import random
import struct
import wave
from array import array
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "public" / "audio"


def make_ambient_bed(seconds: int = 146, sample_rate: int = 22_050) -> None:
    """Create an original low-volume seismic bed; no third-party audio assets."""

    random.seed(7242)
    output = AUDIO / "ambient-bed.wav"
    with wave.open(str(output), "wb") as stream:
        stream.setnchannels(1)
        stream.setsampwidth(2)
        stream.setframerate(sample_rate)
        chunk: list[bytes] = []
        brown = 0.0
        for index in range(seconds * sample_rate):
            t = index / sample_rate
            brown = max(-1.0, min(1.0, brown + random.uniform(-0.018, 0.018)))
            brown *= 0.997
            drone = math.sin(2 * math.pi * 46 * t) * 0.08
            heartbeat = max(0.0, math.sin(2 * math.pi * 0.21 * t)) ** 18
            pulse = math.sin(2 * math.pi * 72 * t) * heartbeat * 0.055
            fade = min(1.0, t / 3, (seconds - t) / 4)
            value = (brown * 0.08 + drone + pulse) * max(0.0, fade)
            chunk.append(struct.pack("<h", int(max(-1, min(1, value)) * 32767)))
            if len(chunk) == sample_rate:
                stream.writeframes(b"".join(chunk))
                chunk.clear()
        if chunk:
            stream.writeframes(b"".join(chunk))
    print(f"generated {output.name}")


def _decay_hit(t: float, at: float, frequency: float, decay: float = 12.0) -> float:
    delta = t - at
    if delta < 0 or delta > 0.7:
        return 0.0
    return math.sin(2 * math.pi * frequency * delta) * math.exp(-decay * delta)


def make_v2_score(seconds: int = 100, sample_rate: int = 44_100) -> None:
    """Create the 104 BPM, event-synchronised score for the v2 incident film."""

    random.seed(7242)
    output = AUDIO / "faultline-v2-score.wav"
    beat = 60 / 104
    half_beat = beat / 2
    cue_times = (1.2, 4.0, 10.0, 17.47, 22.0, 31.0, 35.0, 47.0,
                 55.0, 57.5, 62.5, 65.0, 74.0, 79.53, 82.0, 91.0, 96.0)
    cue_notes = (73, 82, 98, 110, 123, 147, 165, 185, 196, 220, 247, 196,
                 165, 110, 220, 247, 294)
    verification_times = (80.02, 80.22, 80.42, 80.62, 80.82, 81.02)
    progression = (46.25, 51.91, 58.27, 43.65)

    with wave.open(str(output), "wb") as stream:
        stream.setnchannels(2)
        stream.setsampwidth(2)
        stream.setframerate(sample_rate)
        brown = 0.0
        for second in range(seconds):
            chunk = array("h")
            for offset in range(sample_rate):
                t = second + offset / sample_rate
                if t < 1.15:
                    chunk.extend((0, 0))
                    continue

                quarter_phase = t % beat
                eighth_phase = t % half_beat
                bar = int(t / (beat * 4))
                root = progression[bar % len(progression)]

                # A short, low kick gives the film forward motion without turning it
                # into generic trailer music.
                kick_phase = quarter_phase
                kick = math.sin(2 * math.pi * (58 * kick_phase - 12 * kick_phase**2))
                kick *= math.exp(-18 * kick_phase)

                # The graph pulse is melodic enough to make the verification wave
                # feel like a genuine resolution of the opening.
                pulse_env = math.exp(-7.5 * eighth_phase)
                pulse = (math.sin(2 * math.pi * root * t) * 0.72
                         + math.sin(2 * math.pi * root * 2 * t) * 0.20) * pulse_env

                brown = max(-1.0, min(1.0, brown + random.uniform(-0.025, 0.025)))
                brown *= 0.994
                hat = random.uniform(-1, 1) * math.exp(-52 * eighth_phase)
                drone = math.sin(2 * math.pi * root / 2 * t) * 0.15

                density = 0.35 if t < 10 else 0.62 if t < 34 else 0.78
                if 47 <= t < 55:
                    density *= 0.72
                if 79.25 <= t < 79.78:
                    density *= 0.08
                if t >= 82:
                    density *= 0.88

                cues = sum(
                    _decay_hit(t, at, frequency, 14 if frequency > 180 else 10)
                    for at, frequency in zip(cue_times, cue_notes, strict=True)
                )
                verification = sum(
                    _decay_hit(t, at, 220 * (2 ** (step / 12)), 17)
                    for step, at in zip((0, 3, 5, 7, 10, 12), verification_times, strict=True)
                )
                sub_hit = sum(_decay_hit(t, at, 42, 5.5) for at in (4.0, 10.0, 31.0, 79.53, 82.0))

                opening = min(1.0, (t - 1.15) / 1.4)
                closing = min(1.0, max(0.0, (seconds - t) / 2.8))
                master = opening * closing
                base = (kick * 0.34 + pulse * 0.20 + hat * 0.065 + drone * 0.11
                        + brown * 0.035) * density
                event = cues * 0.20 + verification * 0.24 + sub_hit * 0.25

                # Keep the centre solid while giving high-frequency motion a subtle
                # stereo drift. The result remains useful on laptop speakers.
                pan = math.sin(2 * math.pi * 0.07 * t) * 0.10
                left = (base * (1 - pan) + event) * master
                right = (base * (1 + pan) + event) * master
                chunk.extend((
                    int(max(-0.92, min(0.92, left)) * 32767),
                    int(max(-0.92, min(0.92, right)) * 32767),
                ))
            stream.writeframes(chunk.tobytes())
    print(f"generated {output.name}")


def main() -> None:
    make_ambient_bed()
    make_v2_score()


if __name__ == "__main__":
    main()
