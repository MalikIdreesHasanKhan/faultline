import React from "react";
import {Audio} from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {DURATION_SECONDS, FPS} from "./constants";

const C = {
  ink: "#080b0c",
  panel: "#101617",
  line: "#2b3536",
  text: "#f4f2ea",
  muted: "#8c9998",
  lime: "#b9f227",
  orange: "#ff6a2a",
  red: "#ff334f",
  teal: "#2ed3c6",
};

type SceneProps = {
  eyebrow: string;
  children: React.ReactNode;
  caption?: string;
  durationInFrames: number;
  number: string;
  punch: [string, string];
};

const highlightedWords = new Set([
  "act",
  "better",
  "break",
  "changed",
  "confidence",
  "datahub",
  "decide",
  "different",
  "explain",
  "faultline",
  "failure",
  "feast",
  "five",
  "graph",
  "human",
  "key",
  "lineage",
  "mcp",
  "mlflow",
  "monitor",
  "production",
  "reason",
  "response",
  "risk",
  "snowflake",
]);

const captionBeats = (text: string) => {
  const sentences = text.match(/[^.!?]+[.!?]?/g)?.map((part) => part.trim()) ?? [text];
  return sentences.flatMap((sentence) => {
    const words = sentence.split(/\s+/);
    if (words.length < 10) {
      return [sentence];
    }
    const pivot = Math.ceil(words.length / 2);
    return [words.slice(0, pivot).join(" "), words.slice(pivot).join(" ")];
  });
};

const cleanWord = (word: string) => word.toLowerCase().replace(/[^a-z-]/g, "");

const SceneDynamics: React.FC<{durationInFrames: number; number: string}> = ({
  durationInFrames,
  number,
}) => {
  const frame = useCurrentFrame();
  const scene = Number(number);
  const direction = scene % 2 === 0 ? 1 : -1;
  const exit = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const flash = interpolate(frame, [0, 3, 15], [0.8, 0.34, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div className="campaign-dynamics">
      <div
        className="campaign-grid"
        style={{
          backgroundPosition: `${direction * frame * 0.7}px ${frame * 0.35}px`,
          transform: `scale(${1.04 + frame / durationInFrames / 70}) rotate(${direction * 0.4}deg)`,
        }}
      />
      <div
        className="campaign-orbit orbit-one"
        style={{transform: `rotate(${direction * frame * 0.18}deg) scale(${1 + Math.sin(frame / 35) * 0.035})`}}
      />
      <div
        className="campaign-orbit orbit-two"
        style={{transform: `rotate(${-direction * frame * 0.11}deg)`}}
      />
      <div
        className="campaign-beam"
        style={{transform: `translateX(${((frame * 9 + scene * 260) % 2450) - 380}px) rotate(-14deg)`}}
      />
      <div className="campaign-speedlines">
        {[0, 1, 2, 3, 4, 5].map((line) => (
          <i
            key={line}
            style={{
              opacity: 0.12 + line * 0.025,
              top: `${16 + line * 13}%`,
              transform: `translateX(${direction * ((((frame * (8 + line) + line * 310) % 2350) - 1175))}px)`,
              width: `${190 + line * 72}px`,
            }}
          />
        ))}
      </div>
      <div className="campaign-readout">
        SCN_{number} · F_{String(Math.max(0, frame)).padStart(4, "0")}
      </div>
      <div className="campaign-flash" style={{opacity: flash}} />
      <div
        className="campaign-exit-shutter"
        style={{transform: `scaleX(${exit})`, transformOrigin: direction > 0 ? "left" : "right"}}
      />
    </div>
  );
};

const ScenePunch: React.FC<{
  number: string;
  punch: [string, string];
}> = ({number, punch}) => {
  const frame = useCurrentFrame();
  const scene = Number(number);
  const accent = scene === 1 || scene === 2 ? C.red : scene === 3 ? C.orange : C.lime;
  const reveal = interpolate(frame, [0, 11], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const leave = interpolate(frame, [34, 48], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const first = spring({
    frame: frame - 3,
    fps: FPS,
    config: {damping: 14, stiffness: 190, mass: 0.45},
  });
  const second = spring({
    frame: frame - 9,
    fps: FPS,
    config: {damping: 15, stiffness: 170, mass: 0.5},
  });

  return (
    <div
      className="scene-punch"
      style={{
        clipPath: `polygon(0 0, ${reveal * 100}% 0, ${reveal * 100}% 100%, 0 100%)`,
        opacity: leave,
        transform: `translateY(${(1 - leave) * -90}px)`,
      }}
    >
      <div className="punch-index" style={{color: accent}}>
        FAULTLINE // {number}
      </div>
      <div className="punch-copy">
        <strong
          style={{
            transform: `translateX(${(1 - first) * -180}px) skewX(${(1 - first) * -10}deg)`,
          }}
        >
          {punch[0]}
        </strong>
        <strong
          className="punch-accent"
          style={{
            color: accent,
            transform: `translateX(${(1 - second) * 210}px) skewX(${(1 - second) * 10}deg)`,
          }}
        >
          {punch[1]}
        </strong>
      </div>
      <div className="punch-rule" style={{background: accent, transform: `scaleX(${reveal})`}} />
      <div className="punch-telemetry">
        SIGNAL ACQUIRED&nbsp;&nbsp;·&nbsp;&nbsp;GRAPH LOCKED&nbsp;&nbsp;·&nbsp;&nbsp;
        RESPONSE READY
      </div>
    </div>
  );
};

const KineticCaption: React.FC<{
  durationInFrames: number;
  number: string;
  text: string;
}> = ({durationInFrames, number, text}) => {
  const frame = useCurrentFrame();
  const beats = captionBeats(text);
  const start = 52;
  const end = durationInFrames - 20;
  const beatLength = Math.max(48, (end - start) / beats.length);
  const activeBeat = Math.max(
    0,
    Math.min(beats.length - 1, Math.floor((frame - start) / beatLength)),
  );

  return (
    <div className="kinetic-caption">
      <div className="caption-scan" style={{backgroundPositionY: `${frame * 1.5}px`}} />
      <div
        className="caption-sweep"
        style={{transform: `translateX(${(frame * 7) % 1700 - 190}px)`}}
      />
      <div className="caption-meta">
        <span>CAPTION {number}</span>
        <b>
          {String(activeBeat + 1).padStart(2, "0")} /{" "}
          {String(beats.length).padStart(2, "0")}
        </b>
      </div>
      <div className="caption-stage">
        {beats.map((beat, beatIndex) => {
          const beatStart = start + beatIndex * beatLength;
          const beatEnd = Math.min(durationInFrames - 8, beatStart + beatLength + 12);
          const enter = interpolate(frame, [beatStart, beatStart + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          const leave = interpolate(frame, [beatEnd - 14, beatEnd], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.in(Easing.cubic),
          });
          const visibility = enter * leave;
          const direction = beatIndex % 2 === 0 ? 1 : -1;
          const beatProgress = interpolate(frame, [beatStart, beatEnd], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              className="caption-beat"
              key={`${beatIndex}-${beat}`}
              style={{
                opacity: visibility,
                filter: `blur(${(1 - enter) * 10 + (1 - leave) * 7}px)`,
                transform: `translateX(${direction * (1 - enter) * 90}px) scale(${0.96 + enter * 0.04})`,
              }}
            >
              <div
                className="caption-echo"
                style={{transform: `translate(${Math.sin(frame / 3) * 3}px, 3px)`}}
              >
                {beat}
              </div>
              <div className="caption-copy">
                {beat.split(/\s+/).map((word, wordIndex) => {
                  const wordIn = spring({
                    frame: frame - beatStart - wordIndex * 2.5,
                    fps: FPS,
                    config: {damping: 16, stiffness: 150, mass: 0.45},
                  });
                  const highlighted = highlightedWords.has(cleanWord(word));
                  const pulse = highlighted
                    ? 1 + Math.sin((frame - beatStart - wordIndex * 5) / 9) * 0.025
                    : 1;
                  return (
                    <span
                      className={highlighted ? "caption-word highlighted" : "caption-word"}
                      key={`${wordIndex}-${word}`}
                      style={{
                        opacity: wordIn,
                        transform: `translateY(${(1 - wordIn) * 28}px) rotateX(${(1 - wordIn) * 68}deg) scale(${pulse})`,
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
              <div className="caption-progress">
                <i style={{width: `${beatProgress * 100}%`}} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Scene: React.FC<SceneProps> = ({
  eyebrow,
  children,
  caption,
  durationInFrames,
  number,
  punch,
}) => {
  const frame = useCurrentFrame();
  const enter = spring({
    frame: frame - 27,
    fps: FPS,
    config: {damping: 16, stiffness: 125},
  });
  const exit = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames - 5],
    [1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const camera = interpolate(
    frame,
    [28, durationInFrames - 24],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const direction = Number(number) % 2 === 0 ? 1 : -1;
  const impactShake = Math.sin(frame * 2.9) * Math.max(0, 1 - frame / 24) * 9;
  return (
    <AbsoluteFill className="scene-shell">
      <SceneDynamics durationInFrames={durationInFrames} number={number} />
      <div className="grain" />
      <header
        className="film-header"
        style={{
          opacity: enter * exit,
          transform: `translateY(${(1 - enter) * -18}px)`,
        }}
      >
        <div className="film-logo"><span>F//</span> FAULTLINE</div>
        <div className="film-online"><i /> DATAHUB GRAPH ONLINE</div>
      </header>
      <main
        className="film-main"
        style={{
          opacity: enter * exit,
          transform: `translate3d(${direction * camera * 18 + impactShake}px, ${Math.sin(frame / 38) * 4 + (1 - enter) * 35}px, 0) scale(${1 + camera * 0.016})`,
        }}
      >
        <div className="film-eyebrow">{number} / {eyebrow}</div>
        {children}
      </main>
      {caption ? (
        <KineticCaption durationInFrames={durationInFrames} number={number} text={caption} />
      ) : null}
      <footer className="film-footer">
        <span>READ → REASON → PROPOSE → APPROVE → WRITE BACK</span>
        <span>BUILT WITH DATAHUB MCP</span>
      </footer>
      <ScenePunch number={number} punch={punch} />
    </AbsoluteFill>
  );
};

const Metric: React.FC<{label: string; value: string; accent?: string}> = ({
  label,
  value,
  accent = C.text,
}) => (
  <div className="metric">
    <small>{label}</small>
    <strong style={{color: accent}}>{value}</strong>
  </div>
);

const SeismicTrace: React.FC<{intensity?: number}> = ({intensity = 1}) => {
  const frame = useCurrentFrame();
  const values = [2, 7, 3, 11, 4, 25, 6, 3, 56, 5, 3, 18, 4, 9, 2, 4, 2];
  return (
    <div className="seismic">
      <div className="seismic-line" />
      {values.map((v, i) => {
        const pulse = Math.sin((frame + i * 7) / 8) * 0.16 + 0.84;
        return (
          <i
            key={i}
            style={{
              height: `${Math.max(2, v * intensity * pulse)}px`,
              background: v > 40 ? C.red : v > 20 ? C.orange : C.lime,
            }}
          />
        );
      })}
    </div>
  );
};

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const crack = interpolate(frame, [35, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <Scene
      number="00"
      eyebrow="PRODUCTION ML · INCIDENT INTELLIGENCE"
      caption="A column changed. Your monitor knows. But does your deployed model break?"
      durationInFrames={8 * FPS}
      punch={["ONE CHANGE.", "EVERY CONSEQUENCE."]}
    >
      <div className="hero-film">
        <h1>
          Catch the upstream tremor
          <br />
          <em>before the model breaks.</em>
        </h1>
        <p>
          One data change. The complete production blast radius.
          <br />
          Explained, governed, and written back to DataHub.
        </p>
        <div className="hook-chip">FAULTLINE / INCIDENT REPLAY 001</div>
      </div>
      <div className="crack" style={{transform: `scaleX(${crack})`}} />
      <SeismicTrace intensity={1.25} />
    </Scene>
  );
};

const graphNodes = [
  {x: 120, y: 340, label: "raw_orders", type: "SNOWFLAKE", risk: 0, color: C.teal},
  {x: 420, y: 210, label: "order_features", type: "FEAST TABLE", risk: 92, color: C.red},
  {x: 710, y: 210, label: "customer_value", type: "ML FEATURE", risk: 93, color: C.red},
  {x: 1000, y: 210, label: "churn-predictor", type: "MLFLOW MODEL", risk: 92, color: C.red},
  {x: 1290, y: 210, label: "churn-blue", type: "DEPLOYMENT", risk: 79, color: C.orange},
  {x: 710, y: 500, label: "command-center", type: "LOOKER", risk: 70, color: C.orange},
];
const graphEdges = [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5]];

const LineageGraph: React.FC<{progress: number}> = ({progress}) => (
  <svg className="lineage-svg" viewBox="0 0 1500 700">
    {graphEdges.map(([a, b], i) => {
      const from = graphNodes[a];
      const to = graphNodes[b];
      const local = interpolate(progress, [i / 6, (i + 1.8) / 6], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return (
        <g key={`${a}-${b}`}>
          <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="edge-back" />
          <line
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className="edge-live"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - local}
          />
          <circle
            cx={from.x + (to.x - from.x) * local}
            cy={from.y + (to.y - from.y) * local}
            r={6}
            fill={to.color}
            opacity={local > 0 && local < 1 ? 1 : 0}
          />
        </g>
      );
    })}
    {graphNodes.map((node, i) => {
      const shown = interpolate(progress, [(i - 0.4) / 6, (i + 0.2) / 6], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return (
        <g key={node.label} opacity={i === 0 ? 1 : shown}>
          <circle cx={node.x} cy={node.y} r={20} fill={C.ink} stroke={node.color} strokeWidth={5} />
          <circle cx={node.x} cy={node.y} r={8} fill={node.color} opacity={0.7} />
          <text x={node.x + 35} y={node.y - 4} className="node-label">{node.label}</text>
          <text x={node.x + 35} y={node.y + 22} className="node-meta">
            {node.risk ? `${node.risk}/100 · ${node.type}` : `CHANGE ORIGIN · ${node.type}`}
          </text>
        </g>
      );
    })}
  </svg>
);

const demoFindings = [
  ["order_features", "FEAST TABLE", 92],
  ["customer_value", "ML FEATURE", 93],
  ["churn-predictor", "MLFLOW MODEL", 92],
  ["churn-blue", "DEPLOYMENT", 79],
] as const;

const demoModes = [
  ["FIELD REMOVED", 100, "BLOCK"],
  ["TYPE CHANGED", 93, "BLOCK"],
  ["NULL-RATE SPIKE", 85, "QUARANTINE"],
  ["FRESHNESS BREACH", 77, "RETRAIN"],
  ["VOLUME ANOMALY", 73, "RETRAIN"],
] as const;

const demoClicks = [160, 660, 820, 1200, 1400, 1800, 1950, 2220];

const DemoCursor: React.FC<{frame: number}> = ({frame}) => {
  const input = [0, 80, 160, 300, 600, 660, 760, 820, 1000, 1200, 1350, 1400, 1600, 1800, 1900, 1950, 2100, 2220, 2400, 2690];
  const x = interpolate(
    frame,
    input,
    [1680, 1380, 250, 250, 900, 900, 1500, 1500, 1500, 1230, 560, 560, 1700, 1700, 1200, 1120, 1450, 1700, 1600, 1710],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic)},
  );
  const y = interpolate(
    frame,
    input,
    [150, 260, 580, 510, 486, 486, 560, 560, 480, 510, 510, 510, 287, 287, 620, 620, 620, 620, 600, 180],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic)},
  );
  const pulse = Math.max(
    ...demoClicks.map((click) =>
      interpolate(Math.abs(frame - click), [0, 13], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
  const pressed = demoClicks.some((click) => Math.abs(frame - click) < 4);

  return (
    <div
      className="demo-cursor"
      style={{transform: `translate3d(${x}px, ${y}px, 0) scale(${pressed ? 0.82 : 1})`}}
    >
      <div className="cursor-ring" style={{opacity: pulse, transform: `scale(${1 + (1 - pulse) * 1.6})`}} />
      <svg viewBox="0 0 36 44" aria-hidden="true">
        <path d="M3 2 31 26l-13 2 8 12-7 4-7-13-9 9Z" />
      </svg>
    </div>
  );
};

const demoCallouts = [
  [92, 230, "CLICK", "TRIGGER INCIDENT REPLAY"],
  [350, 560, "LIVE", "COLUMN-AWARE BLAST RADIUS"],
  [760, 900, "OPEN", "EXPLAINABLE EVIDENCE"],
  [1100, 1320, "CLICK", "REPLAY A FAILURE MODE"],
  [1730, 1880, "DOWNLOAD", "SEALED EVIDENCE RECEIPT"],
  [1900, 2180, "TYPE", "INCIDENT-SCOPED APPROVAL"],
  [2190, 2370, "CLICK", "AUTHORIZE + VERIFY"],
] as const;

const DemoCallout: React.FC<{frame: number}> = ({frame}) => (
  <>
    {demoCallouts.map(([start, end, verb, copy]) => {
      const enter = interpolate(frame, [start, start + 12], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });
      const leave = interpolate(frame, [end - 12, end], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.cubic),
      });
      return (
        <div
          className="demo-callout"
          key={copy}
          style={{
            opacity: enter * leave,
            transform: `translateX(${(1 - enter) * -70 + (1 - leave) * 70}px)`,
          }}
        >
          <b>{verb}</b>
          <span>{copy}</span>
        </div>
      );
    })}
  </>
);

const DemoToast: React.FC<{frame: number}> = ({frame}) => {
  const toast =
    frame >= 2270 && frame < 2430
      ? ["✓ WRITE-BACK VERIFIED", "6 durable context writes applied"]
      : frame >= 1800 && frame < 1900
        ? ["↓ RECEIPT DOWNLOADED", "FLT-7242AEB5 · SHA-256 sealed"]
        : frame >= 1200 && frame < 1370
          ? ["↻ COUNTERFACTUAL REPLAY", "Freshness breach · RETRAIN · 77/100"]
          : null;
  if (!toast) return null;
  const age = frame >= 2270 ? frame - 2270 : frame >= 1800 ? frame - 1800 : frame - 1200;
  const enter = spring({frame: age, fps: FPS, config: {damping: 15, stiffness: 170}});
  return (
    <div className="demo-toast" style={{transform: `translateX(${(1 - enter) * 120}px)`, opacity: enter}}>
      <b>{toast[0]}</b>
      <span>{toast[1]}</span>
    </div>
  );
};

const ProductDemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pageScroll = interpolate(
    frame,
    [0, 150, 260, 390, 870, 1030, 1480, 1680, 2360, 2530, 2700],
    [0, 0, 720, 720, 720, 1570, 1570, 2170, 2170, 2690, 2690],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic)},
  );
  const browserIn = spring({frame, fps: FPS, config: {damping: 18, stiffness: 105}});
  const browserOut = interpolate(frame, [2640, 2700], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const investigated = frame >= 250;
  const loading = frame >= 160 && frame < 250;
  const graphProgress = interpolate(frame, [300, 560], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const replayPulse = interpolate(frame, [660, 675, 730], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const freshActive = frame >= 1200 && frame < 1400;
  const typed = Math.floor(
    interpolate(frame, [1970, 2150], [0, 18], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const approval = "APPLY FLT-7242AEB5".slice(0, typed);
  const applying = frame >= 2220 && frame < 2270;
  const verified = frame >= 2270;

  return (
    <AbsoluteFill className="product-demo-shell">
      <SceneDynamics durationInFrames={2700} number="07" />
      <div
        className="demo-browser"
        style={{
          opacity: browserIn * browserOut,
          transform: `perspective(1800px) rotateX(${(1 - browserIn) * 7}deg) scale(${0.91 + browserIn * 0.09 + (1 - browserOut) * 0.05}) translateY(${(1 - browserIn) * 80}px)`,
        }}
      >
        <div className="demo-browser-bar">
          <div className="browser-dots"><i /><i /><i /></div>
          <div className="browser-address"><span>◆</span> faultline.local / incident-command</div>
          <div className="browser-live"><i /> LIVE PRODUCT</div>
        </div>
        <div className="demo-viewport">
          <div className="demo-page" style={{transform: `translateY(${-pageScroll}px)`}}>
            <header className="demo-header">
              <div className="demo-wordmark"><span>F//</span> FAULTLINE</div>
              <div className="demo-online"><i /> DATAHUB GRAPH ONLINE</div>
              <div className="demo-api">API</div>
            </header>

            <section className="demo-hero">
              <div className="demo-eyebrow">PRODUCTION ML · INCIDENT INTELLIGENCE</div>
              <h1>Catch the upstream tremor<br/><em>before the model breaks.</em></h1>
              <p>FAULTLINE turns a tiny data change into a traced, ranked, governable response—using the context already living in DataHub.</p>
              <div className="demo-hero-action">
                <button className={loading ? "loading" : ""}>
                  {loading ? "Traversing DataHub…" : investigated ? "Replay incident" : "Trigger incident replay"}
                  <kbd>R</kbd>
                </button>
                <span>Credential-free judge scenario · 4 seconds</span>
              </div>
              <SeismicTrace intensity={0.7} />
            </section>

            <section className="demo-incident">
              <div className="demo-section-heading">
                <div><small>01 / INCIDENT</small><h2>FLT-7242AEB5</h2>
                  <b>order_total&nbsp;&nbsp; DECIMAL(18,2) → VARCHAR</b></div>
                <div className="demo-stamp"><small>RECOMMENDED ACTION</small><strong>{freshActive ? "RETRAIN" : "BLOCK"}</strong></div>
              </div>
              <div className="demo-metrics">
                <Metric label="PEAK RISK" value={freshActive ? "77/100" : "93/100"} accent={freshActive ? C.lime : C.red} />
                <Metric label="CONFIDENCE" value={freshActive ? "86%" : "93%"} />
                <Metric label="EXPOSED ASSETS" value="5" />
                <Metric label="MODELS AT RISK" value="2" />
              </div>
              <div className="demo-workspace">
                <div className="demo-graph panel">
                  <div className="panel-head"><span><i /> LIVE BLAST RADIUS</span><b>Replay propagation</b></div>
                  <div style={{opacity: 0.78 + replayPulse * 0.22}}>
                    <LineageGraph progress={replayPulse > 0 ? replayPulse : graphProgress} />
                  </div>
                </div>
                <div className="demo-ledger panel">
                  <div className="panel-head"><span>EVIDENCE LEDGER</span><b>5 PATHS</b></div>
                  {demoFindings.map(([name, type, score], index) => (
                    <div className="demo-finding" key={name}>
                      <div><strong>{name}</strong><small>{type} · {index + 1} HOPS</small></div>
                      <b>{score}</b>
                      <span><i style={{width: `${score}%`}} /></span>
                      <p>+ production lifecycle · confirmed column lineage</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="demo-counter">
              <div className="demo-section-heading">
                <div><small>02 / COUNTERFACTUALS</small><h2>What if the tremor were different?</h2></div>
                <p>Same graph. Five failure modes. Zero hand-waving.</p>
              </div>
              <div className="demo-mode-grid">
                {demoModes.map(([label, score, action], index) => {
                  const selected = freshActive ? index === 3 : index === 1;
                  return (
                    <button className={selected ? "selected" : ""} key={label}>
                      <small>{selected ? "ACTIVE REPLAY" : "SIMULATED"}</small>
                      <h3>{label}</h3>
                      <strong>{score}</strong><span>/100</span>
                      <b>{action}</b>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="demo-governance">
              <div className="demo-section-heading">
                <div><small>03 / GOVERNANCE</small><h2>The agent can act. You hold the key.</h2></div>
                <div className="demo-receipt">Download evidence receipt ↓</div>
              </div>
              <div className="demo-govern-grid">
                <div className="panel">
                  <div className="panel-head">POLICY-AS-CODE</div>
                  {[["VALIDATE", 50], ["RETRAIN", 70], ["QUARANTINE", 82], ["BLOCK", 92]].map(([label, score]) => (
                    <div className="demo-policy" key={label}>
                      <b>{label}</b><span><i style={{width: `${score}%`}} /></span><strong>{score}</strong>
                    </div>
                  ))}
                  <p>Every threshold is versionable. Every score has a receipt.</p>
                </div>
                <div className="panel demo-writes">
                  <div className="panel-head"><span>DATAHUB WRITE-BACK</span><b>6 STAGED</b></div>
                  {["TAG · order_features", "TAG · customer_value", "TAG · churn-predictor", "TAG · churn-blue", "TAG · command-center", "DOCUMENT · evidence receipt"].map((write, index) => (
                    <div className="demo-mutation" key={write}>
                      <span>0{index + 1}</span><b>{write}</b><strong>{verified ? "✓ VERIFIED" : "STAGED"}</strong>
                    </div>
                  ))}
                  <label>INCIDENT-SPECIFIC APPROVAL PHRASE</label>
                  <div className="demo-approval">
                    <div>{approval}<i /></div>
                    <button className={typed === 18 ? "ready" : ""}>
                      {verified ? "APPLIED" : applying ? "APPLYING…" : "AUTHORIZE WRITES"}
                    </button>
                  </div>
                  <div className={verified ? "demo-write-status verified" : "demo-write-status"}>
                    {verified ? "✓ 6 durable context writes applied and re-read" : applying ? "Applying approved DataHub mutations…" : "Preview only · nothing has been changed"}
                  </div>
                </div>
              </div>
            </section>

            <section className="demo-timeline">
              <small>04 / MACHINE-SPEED RESPONSE</small>
              <div>
                {["SIGNAL RECEIVED", "LINEAGE RESOLVED", "HUMAN APPROVED", "CONTEXT VERIFIED"].map((event, index) => (
                  <article key={event}><time>00:0{index + 1}.2</time><b>{event}</b></article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      <DemoCallout frame={frame} />
      <DemoToast frame={frame} />
      <DemoCursor frame={frame} />
      <div className="master-progress"><i style={{width: `${frame / 2700 * 100}%`}} /></div>
    </AbsoluteFill>
  );
};

const BlastScene: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [20, 280], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const stamp = spring({frame: frame - 240, fps: FPS, config: {damping: 12}});
  return (
    <Scene
      number="01"
      eyebrow="INCIDENT"
      caption="FAULTLINE follows the changed field from Snowflake through Feast and MLflow into production."
      durationInFrames={27 * FPS}
      punch={["TRACE", "THE BLAST RADIUS."]}
    >
      <div className="title-row">
        <div>
          <h2>FLT-7242AEB5</h2>
          <p className="signal">order_total&nbsp;&nbsp; DECIMAL(18,2) → VARCHAR</p>
        </div>
        <div className="action-stamp" style={{transform: `rotate(-2deg) scale(${stamp})`}}>
          <small>RECOMMENDED ACTION</small>
          <strong>BLOCK</strong>
        </div>
      </div>
      <div className="metric-strip">
        <Metric label="PEAK RISK" value="93/100" accent={C.red} />
        <Metric label="CONFIDENCE" value="93%" />
        <Metric label="EXPOSED ASSETS" value="5" />
        <Metric label="MODELS AT RISK" value="2" />
      </div>
      <div className="graph-card">
        <div className="panel-head"><span><i /> LIVE BLAST RADIUS</span><b>{Math.round(progress * 100)}%</b></div>
        <LineageGraph progress={progress} />
      </div>
    </Scene>
  );
};

const findings = [
  ["customer_lifetime_value", "ML FEATURE · 2 HOPS", 93],
  ["order_features", "DATASET · 1 HOP", 92],
  ["churn-predictor", "ML MODEL · 3 HOPS", 92],
  ["churn-predictor-blue", "DEPLOYMENT · 4 HOPS", 79],
];

const EvidenceScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Scene
      number="02"
      eyebrow="EVIDENCE LEDGER"
      caption="Every point has a reason. No invented explanation and no opaque confidence shortcut."
      durationInFrames={19 * FPS}
      punch={["NO VIBES.", "JUST EVIDENCE."]}
    >
      <div className="evidence-layout">
        <div>
          <h2>Risk you can cross-examine.</h2>
          <p className="big-copy">
            Severity, asset type, production criticality, hop distance,
            and confirmed column lineage.
          </p>
          <div className="reason-stack">
            {[
              ["TYPE CHANGE BASE RISK", "+60"],
              ["ML FEATURE EXPOSURE", "+10"],
              ["TIER-3 CRITICALITY", "+12"],
              ["2-HOP DISTANCE", "−5"],
              ["COLUMN LINEAGE CONFIRMED", "+12"],
              ["PRODUCTION LIFECYCLE", "+4"],
            ].map(([label, score], i) => {
              const reveal = spring({frame: frame - i * 18, fps: FPS, config: {damping: 18}});
              return (
                <div className="reason-row" key={label} style={{opacity: reveal, transform: `translateX(${(1 - reveal) * -25}px)`}}>
                  <span>{label}</span><b>{score}</b>
                </div>
              );
            })}
          </div>
        </div>
        <div className="finding-list">
          {findings.map(([name, type, score], i) => {
            const reveal = spring({frame: frame - 45 - i * 20, fps: FPS, config: {damping: 18}});
            return (
              <div className="finding-card" key={String(name)} style={{opacity: reveal, transform: `translateY(${(1 - reveal) * 30}px)`}}>
                <div><strong>{name}</strong><small>{type}</small></div>
                <b>{score}</b>
                <div className="risk-track"><i style={{width: `${score}%`}} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </Scene>
  );
};

const modes = [
  ["FIELD REMOVED", 100, "BLOCK", C.red],
  ["TYPE CHANGED", 93, "BLOCK", C.red],
  ["NULL-RATE SPIKE", 85, "QUARANTINE", C.orange],
  ["FRESHNESS BREACH", 77, "RETRAIN", C.lime],
  ["VOLUME ANOMALY", 73, "RETRAIN", C.lime],
] as const;

const CounterfactualScene: React.FC = () => {
  const frame = useCurrentFrame();
  const active = Math.min(modes.length - 1, Math.floor(frame / 90));
  return (
    <Scene
      number="03"
      eyebrow="COUNTERFACTUAL LAB"
      caption="Same graph. Five failure modes. See how the response changes before you act."
      durationInFrames={17 * FPS}
      punch={["SIMULATE", "BEFORE YOU ACT."]}
    >
      <h2>What if the tremor were different?</h2>
      <div className="mode-grid">
        {modes.map(([name, risk, action, color], i) => {
          const selected = i === active;
          return (
            <div
              className={`mode-card ${selected ? "selected" : ""}`}
              key={name}
              style={{borderColor: selected ? color : C.line, transform: `translateY(${selected ? -14 : 0}px)`}}
            >
              <small>{i === 1 ? "OBSERVED SIGNAL" : "SIMULATED"}</small>
              <h3>{name}</h3>
              <strong style={{color}}>{risk}</strong><span>/100</span>
              <b style={{color}}>{action}</b>
              <div className="mini-seismic"><i style={{width: `${risk}%`, background: color}} /></div>
            </div>
          );
        })}
      </div>
      <div className="counter-note">
        <span>ACTIVE REPLAY</span>
        <strong>{modes[active][0]}</strong>
        <b style={{color: modes[active][3]}}>{modes[active][2]}</b>
      </div>
    </Scene>
  );
};

const GovernanceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const typed = Math.floor(interpolate(frame, [170, 260], [0, 18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const phrase = "APPLY FLT-7242AEB5";
  const applied = frame > 300;
  return (
    <Scene
      number="04"
      eyebrow="GOVERNANCE"
      caption="The agent can act. A human still holds the key."
      durationInFrames={27 * FPS}
      punch={["THE AGENT ACTS.", "YOU HOLD THE KEY."]}
    >
      <div className="govern-title">
        <div><h2>The agent can act.<br/><em>You hold the key.</em></h2></div>
        <div className="seal">SHA-256<br/><b>7e42…d91c</b></div>
      </div>
      <div className="govern-grid">
        <div className="policy-card">
          <div className="panel-head">POLICY-AS-CODE</div>
          {[["VALIDATE", 50], ["RETRAIN", 70], ["QUARANTINE", 82], ["BLOCK", 92]].map(([label, value]) => (
            <div className="policy-line" key={label}>
              <span>{label}</span><div><i style={{width: `${value}%`}} /></div><b>{value}</b>
            </div>
          ))}
          <p>Versionable thresholds. Inspectable evidence. No hidden reasoning.</p>
        </div>
        <div className="write-card">
          <div className="panel-head">DATAHUB WRITE-BACK <b>6 STAGED</b></div>
          {["TAG · order_features", "TAG · customer_value", "TAG · churn-predictor", "TAG · churn-blue", "TAG · command-center", "DOCUMENT · evidence receipt"].map((m, i) => (
            <div className="mutation" key={m}><span>{String(i + 1).padStart(2, "0")}</span>{m}<b>{applied ? "VERIFIED" : "PREVIEW"}</b></div>
          ))}
          <div className="approval">
            <small>INCIDENT-SPECIFIC APPROVAL PHRASE</small>
            <div>{phrase.slice(0, typed)}<i /></div>
            <button style={{background: applied ? C.lime : typed >= phrase.length ? C.red : C.line}}>
              {applied ? "✓ WRITES VERIFIED" : typed >= phrase.length ? "AUTHORIZE WRITES" : "LOCKED"}
            </button>
          </div>
        </div>
      </div>
    </Scene>
  );
};

const EngineeringScene: React.FC = () => {
  const frame = useCurrentFrame();
  const tests = Math.floor(interpolate(frame, [40, 190], [0, 15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  return (
    <Scene
      number="05"
      eyebrow="ENGINEERING PROOF"
      caption="The same engine runs credential-free for judges or against open-source DataHub over MCP."
      durationInFrames={13 * FPS}
      punch={["NOT A MOCKUP.", "A GOVERNED LOOP."]}
    >
      <div className="engineering-layout">
        <div>
          <h2>Not a mockup.<br/><em>A governed agent loop.</em></h2>
          <div className="flow">
            {["get_entities", "get_lineage", "rank paths", "human approval", "add_tags", "save_document"].map((x, i) => (
              <React.Fragment key={x}>
                <span>{x}</span>{i < 5 ? <b>→</b> : null}
              </React.Fragment>
            ))}
          </div>
          <p className="big-copy">Official MCP contracts. Read-after-write verification. Failure closes the gate.</p>
        </div>
        <div className="terminal">
          <div className="terminal-top"><i/><i/><i/><span>FAULTLINE / QUALITY GATE</span></div>
          <code>
            <span>$ ruff check .</span>
            <b>All checks passed!</b>
            <span>$ pytest</span>
            <b>{".".repeat(tests)}</b>
            <strong>{tests}/15 passed</strong>
            <span>$ python -m build</span>
            <b>wheel + sdist verified</b>
            <span>$ faultline live --kind type_changed</span>
            <b>Dry run · 6 writes staged</b>
          </code>
        </div>
      </div>
      <div className="proof-strip">
        <Metric label="CPYTHON" value="3.10 + 3.12" />
        <Metric label="LICENSE" value="APACHE-2.0" />
        <Metric label="INTEGRATION" value="DATAHUB MCP" accent={C.teal} />
        <Metric label="REUSABLE SKILL" value="VALIDATED" accent={C.lime} />
      </div>
    </Scene>
  );
};

const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = spring({frame, fps: FPS, config: {damping: 15, stiffness: 90}});
  return (
    <Scene
      number="06"
      eyebrow="THE GRAPH REMEMBERS"
      caption="Leave the graph better."
      durationInFrames={11 * FPS}
      punch={["READ. REASON. ACT.", "LEAVE THE GRAPH BETTER."]}
    >
      <div className="close" style={{transform: `scale(${0.94 + scale * 0.06})`}}>
        <div className="close-logo"><span>F//</span> FAULTLINE</div>
        <h2>Catch the upstream tremor<br/><em>before the model breaks.</em></h2>
        <div className="close-pills">
          <span>EXPLAINABLE</span><span>GOVERNED</span><span>DATAHUB-NATIVE</span>
        </div>
      </div>
      <SeismicTrace intensity={0.8} />
    </Scene>
  );
};

export const FaultlineFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = frame / (DURATION_SECONDS * FPS);
  return (
    <AbsoluteFill style={{backgroundColor: C.ink}}>
      <Sequence from={0} durationInFrames={8 * FPS}><HookScene /></Sequence>
      <Sequence from={8 * FPS} durationInFrames={90 * FPS}><ProductDemoScene /></Sequence>
      <Sequence from={98 * FPS} durationInFrames={13 * FPS}><EngineeringScene /></Sequence>
      <Sequence from={111 * FPS} durationInFrames={11 * FPS}><CloseScene /></Sequence>
      <Audio
        src={staticFile("audio/ambient-bed.wav")}
        volume={(f) => interpolate(f, [0, 45, DURATION_SECONDS * FPS - 60, DURATION_SECONDS * FPS], [0, 0.13, 0.13, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      />
      <div className="master-progress"><i style={{width: `${progress * 100}%`}} /></div>
    </AbsoluteFill>
  );
};

export const FaultlineThumbnail: React.FC = () => (
  <AbsoluteFill className="thumbnail">
    <div className="grain" />
    <div className="thumb-top"><span>F//</span> FAULTLINE <b>DATAHUB AGENT HACKATHON</b></div>
    <h1>Catch the upstream tremor<br/><em>before the model breaks.</em></h1>
    <div className="thumb-graph"><LineageGraph progress={1} /></div>
    <div className="thumb-stamp">BLOCK<br/><small>93% CONFIDENCE</small></div>
  </AbsoluteFill>
);
