"""Generate FAULTLINE's original ambient score."""

from __future__ import annotations

import math
import random
import struct
import wave
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


def main() -> None:
    make_ambient_bed()


if __name__ == "__main__":
    main()
