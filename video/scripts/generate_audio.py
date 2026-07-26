"""Generate FAULTLINE narration with Edge TTS and an original ambient bed."""

from __future__ import annotations

import asyncio
import math
import random
import struct
import wave
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "public" / "audio"
VOICE = "en-US-GuyNeural"

SEGMENTS = {
    "01-hook.mp3": (
        "A column changed. Your monitor knows. But does your deployed model break? "
        "FAULTLINE catches the upstream tremor before the model does. One signal becomes "
        "a complete, explainable, and governed production response."
    ),
    "02-blast.mp3": (
        "A Snowflake order field changed from decimal to text. Using DataHub lineage, "
        "FAULTLINE follows that field through Feast, an MLflow churn model, its live "
        "deployment, and the executive dashboard. Five assets are exposed. Two are model "
        "or deployment assets. The recommended response is block, with ninety-three "
        "percent confidence."
    ),
    "03-evidence.mp3": (
        "Every point can be cross-examined. Signal severity, asset type, production "
        "criticality, hop distance, and confirmed column lineage build the score. "
        "There is no invented explanation and no opaque confidence shortcut."
    ),
    "04-counterfactual.mp3": (
        "The same graph is replayed under five failure modes. A freshness breach triggers "
        "retraining. A removed field blocks. On-call engineers can see how the decision "
        "changes before they act."
    ),
    "05-governance.mp3": (
        "The policy is versionable. The agent proposes five visible risk tags and one "
        "DataHub incident document, but it cannot write yet. A sealed receipt preserves "
        "the signal, exact paths, score ledger, policy snapshot, and every proposed mutation. "
        "Only the incident-specific approval phrase opens the write boundary. Then each result "
        "is read back and verified."
    ),
    "06-engineering.mp3": (
        "This is not a mockup. The same engine runs credential-free for judges or against "
        "open-source DataHub over the official MCP server. Fifteen tests cover policy, "
        "counterfactuals, refusal, idempotency, official tool schemas, and verified writes. "
        "A reusable DataHub skill packages the workflow for other agents."
    ),
    "07-close.mp3": (
        "FAULTLINE. Read the graph. Explain the risk. Let a human decide. And leave the "
        "graph better."
    ),
}


async def make_narration() -> None:
    AUDIO.mkdir(parents=True, exist_ok=True)
    for filename, text in SEGMENTS.items():
        output = AUDIO / filename
        communicate = edge_tts.Communicate(text, VOICE, rate="-4%", pitch="-2Hz")
        await communicate.save(str(output))
        print(f"generated {output.name}")


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


async def main() -> None:
    await make_narration()
    make_ambient_bed()


if __name__ == "__main__":
    asyncio.run(main())
