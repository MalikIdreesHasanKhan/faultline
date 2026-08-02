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
} from "remotion";
import {FPS, V2_DURATION_SECONDS} from "./constants";

const C = {
  ink: "#070b0c",
  panel: "#101718",
  panel2: "#162021",
  line: "#344343",
  text: "#f4f2ea",
  muted: "#8b9b98",
  teal: "#2ed3c6",
  lime: "#b9f227",
  orange: "#ff6a2a",
  red: "#ff334f",
};

const smooth = (frame: number, range: [number, number]) =>
  interpolate(frame, range, [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const fade = (frame: number, inAt = 0, outAt = Number.POSITIVE_INFINITY, fadeFrames = 18) => {
  const enter = interpolate(frame, [inAt, inAt + fadeFrames], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const leave = outAt === Number.POSITIVE_INFINITY ? 1 : interpolate(frame, [outAt - fadeFrames, outAt], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return enter * leave;
};

const V2Background: React.FC<{accent?: string; intensity?: number}> = ({accent = C.teal, intensity = 1}) => {
  const frame = useCurrentFrame();
  return <>
    <div className="v2-grid" style={{opacity: 0.13 * intensity, backgroundPosition: `${frame * 0.4}px ${frame * 0.12}px`}} />
    <div className="v2-radial" style={{background: `radial-gradient(circle at ${62 + Math.sin(frame / 90) * 4}% ${18 + Math.cos(frame / 110) * 3}%, ${accent}22 0, transparent 38%)`}} />
    <div className="v2-scan" />
    <div className="v2-corner v2-corner-a" style={{borderColor: `${accent}70`}} />
    <div className="v2-corner v2-corner-b" style={{borderColor: `${accent}42`}} />
  </>;
};

const V2Brand: React.FC<{right?: string}> = ({right = "INCIDENT REPLAY"}) => (
  <div className="v2-brand"><span>F//</span> FAULTLINE <b>{right}</b></div>
);

const KineticCopy: React.FC<{children: React.ReactNode; className?: string; style?: React.CSSProperties}> = ({children, className = "", style}) => {
  const frame = useCurrentFrame();
  const inValue = smooth(frame, [4, 22]);
  const requestedOpacity = typeof style?.opacity === "number" ? style.opacity : 1;
  const rest = {...style};
  delete rest.opacity;
  return <div className={`v2-copy ${className}`} style={{...rest, opacity: inValue * requestedOpacity, transform: `translateY(${(1 - inValue) * 26}px) skewX(${(1 - inValue) * -3}deg)`}}>{children}</div>;
};

const Cursor: React.FC<{x: number; y: number; visible?: boolean; clickAt?: number}> = ({x, y, visible = true, clickAt}) => {
  const frame = useCurrentFrame();
  const click = clickAt === undefined ? 0 : interpolate(frame, [clickAt - 4, clickAt, clickAt + 9], [0, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return <div className="v2-cursor-wrap" style={{left: x, top: y, opacity: visible ? 1 : 0}}>
    <div className="v2-cursor" style={{transform: `scale(${1 - click * 0.16})`}} />
    {click > 0 ? <div className="v2-click" style={{transform: `scale(${0.35 + click * 1.3})`, opacity: 1 - click * 0.75}} /> : null}
  </div>;
};

const BrowserChrome: React.FC<{children: React.ReactNode; title?: string}> = ({children, title = "FAULTLINE / ML INCIDENT COMMAND"}) => (
  <div className="v2-browser">
    <div className="v2-browser-bar"><span className="v2-dots"><i /><i /><i /></span><span className="v2-url">127.0.0.1:8000</span><span className="v2-browser-title">{title}</span></div>
    <div className="v2-window">{children}</div>
  </div>
);

type Node = {id: string; label: string; kind: string; x: number; y: number; color: string; score?: number};
const nodes: Node[] = [
  {id: "source", label: "raw_orders", kind: "SNOWFLAKE", x: 70, y: 220, color: C.teal},
  {id: "features", label: "order_features", kind: "FEAST", x: 260, y: 112, color: C.orange, score: 92},
  {id: "clv", label: "customer_lifetime_value", kind: "MLFEATURE", x: 260, y: 328, color: C.red, score: 93},
  {id: "model", label: "churn-predictor", kind: "MLMODEL", x: 520, y: 220, color: C.red, score: 92},
  {id: "deploy", label: "churn-predictor-blue", kind: "DEPLOYMENT", x: 790, y: 220, color: C.red, score: 79},
  {id: "dashboard", label: "Churn Command Center", kind: "DASHBOARD", x: 520, y: 350, color: C.orange, score: 70},
];

const edgePairs: Array<[string, string]> = [["source", "features"], ["source", "clv"], ["features", "model"], ["clv", "model"], ["model", "deploy"], ["features", "dashboard"]];

const Graph: React.FC<{progress: number; selected?: string; counterfactual?: boolean; verified?: boolean}> = ({progress, selected, counterfactual = false, verified = false}) => {
  const frame = useCurrentFrame();
  const lookup = new Map(nodes.map((n) => [n.id, n]));
  return <div className="v2-graph">
    <svg viewBox="0 0 860 440" preserveAspectRatio="none">
      {edgePairs.map(([fromId, toId], i) => {
        const from = lookup.get(fromId)!; const to = lookup.get(toId)!;
        const reveal = Math.max(0, Math.min(1, progress * 1.25 - i * 0.12));
        return <line key={`${fromId}-${toId}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={verified ? C.lime : counterfactual ? C.orange : C.teal} strokeWidth={selected && selected !== toId && selected !== fromId ? 1 : 2.5} strokeDasharray="9 10" strokeDashoffset={-frame * 2.3} opacity={reveal * (selected && selected !== toId && selected !== fromId ? 0.16 : 0.7)} />;
      })}
    </svg>
    {nodes.map((node, i) => {
      const reveal = smooth(progress * 100 + i * 2, [i * 18, 20 + i * 18]);
      const focused = selected === node.id;
      return <div key={node.id} className={`v2-node ${focused ? "is-selected" : ""}`} style={{left: `${node.x / 8.6}%`, top: `${node.y / 4.4}%`, opacity: reveal, transform: `translate(-50%, -50%) scale(${focused ? 1.18 : 1})`, borderColor: verified ? C.lime : node.color, boxShadow: focused ? `0 0 0 9px ${node.color}22, 0 0 30px ${node.color}75` : `0 0 14px ${node.color}33`}}>
        <span className="v2-node-dot" style={{background: verified ? C.lime : node.color}} />
        <div className="v2-node-label"><strong>{node.label}</strong><small>{node.kind}{node.score ? ` · ${counterfactual ? Math.max(0, node.score - 18) : node.score}` : ""}</small></div>
      </div>;
    })}
    <div className="v2-graph-caption"><span className="v2-live-dot" /> DATAHUB CONTEXT GRAPH <b>{verified ? "MEMORY UPDATED" : counterfactual ? "SIMULATION" : "LIVE TRACE"}</b></div>
  </div>;
};

const AppHeader: React.FC<{active: string}> = ({active}) => <div className="v2-app-head"><div className="v2-app-mark"><span>F//</span> FAULTLINE</div><div className="v2-app-status"><i /> DATAHUB GRAPH ONLINE</div><div className="v2-app-tabs"><b className={active === "incident" ? "active" : ""}>INCIDENT</b><b className={active === "counterfactual" ? "active" : ""}>ANALYSIS</b><b className={active === "governance" ? "active" : ""}>GOVERNANCE</b></div></div>;

const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const source = smooth(frame, [10, 28]);
  const crack = smooth(frame, [54, 104]);
  const nodesIn = smooth(frame, [120, 186]);
  const openingCopy = fade(frame, 36, 282);
  return <AbsoluteFill className="v2-root"><V2Background accent={C.red} intensity={0.65} /><V2Brand />
    <div className="v2-event" style={{opacity: source, transform: `translateY(${(1 - source) * 25}px)`}}>
      <span>02:17:04</span><b>raw_orders.order_total</b><em>DECIMAL(18,2)</em><i>→</i><strong>VARCHAR</strong>
    </div>
    <div className="v2-fault-line" style={{width: `${crack * 100}%`, opacity: crack}} />
    <div className="v2-mini-graph" style={{opacity: nodesIn}}>
      {[[15, 50, C.teal], [34, 36, C.orange], [48, 65, C.red], [69, 43, C.red], [88, 55, C.red]].map(([x, y, color], i) => <React.Fragment key={i}><span className="v2-mini-node" style={{left: `${x}%`, top: `${y}%`, background: color as string, boxShadow: `0 0 25px ${color as string}`}} /><i className="v2-mini-edge" style={{left: `${Number(x) - 14}%`, top: `${Number(y) - 4}%`, width: `${18 + i * 3}%`, transform: `rotate(${i % 2 ? 16 : -7}deg)`, opacity: nodesIn}} /></React.Fragment>)}
    </div>
    <KineticCopy className="v2-opening-copy" style={{opacity: openingCopy}}><strong>ONE COLUMN<br /><em>CHANGED.</em></strong></KineticCopy>
    <div className="v2-opening-question" style={{opacity: fade(frame, 160, 260), transform: `translateX(${(1 - smooth(frame, [160, 182])) * 32}px)`}}>FIVE ASSETS EXPOSED.<br /><b>WHICH MODEL BREAKS NEXT?</b></div>
    <div className="v2-title-reveal" style={{opacity: fade(frame, 300, 450), transform: `scale(${0.92 + smooth(frame, [300, 340]) * 0.08})`}}><span className="v2-big-mark">F//</span><strong>FAULTLINE</strong><small>Catch the upstream tremor before the model breaks.</small></div>
  </AbsoluteFill>;
};

const TriggerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pressed = frame >= 74;
  return <AbsoluteFill className="v2-root"><V2Background accent={C.teal} /><V2Brand right="CREDENTIAL-FREE JUDGE SCENARIO" />
    <BrowserChrome>
      <AppHeader active="incident" />
      <div className="v2-hero">
        <small>PRODUCTION ML · INCIDENT INTELLIGENCE</small>
        <h1>Catch the upstream tremor<br /><em>before the model breaks.</em></h1>
        <p>One signal. Full lineage. Governed response.</p>
        <button className="v2-trigger" style={{background: pressed ? C.orange : C.lime, color: C.ink}}>{pressed ? "TRAVERSING DATAHUB…" : "Trigger incident replay"}<kbd>R</kbd></button>
        <span className="v2-mode">{pressed ? "READING ENTITIES · READING COLUMN LINEAGE" : "CREDENTIAL-FREE JUDGE SCENARIO · 4 SECONDS"}</span>
      </div>
      {pressed ? <div className="v2-trigger-ring" style={{transform: `scale(${smooth(frame, [74, 118]) * 2.2})`, opacity: 1 - smooth(frame, [74, 132])}} /> : null}
    </BrowserChrome>
    <Cursor x={375 - smooth(frame, [38, 74]) * 70} y={500 + smooth(frame, [38, 74]) * 20} clickAt={74} visible={frame > 30 && frame < 138} />
    <KineticCopy className="v2-lower-left"><span>READ THE GRAPH.</span></KineticCopy>
  </AbsoluteFill>;
};

const BlastScene: React.FC = () => {
  const frame = useCurrentFrame();
  const p = smooth(frame, [18, 225]);
  const selected = frame > 280 ? "deploy" : undefined;
  const stamp = smooth(frame, [228, 280]);
  return <AbsoluteFill className="v2-root"><V2Background accent={C.orange} /><V2Brand right="01 / INCIDENT · LIVE TRACE" />
    <BrowserChrome>
      <AppHeader active="incident" />
      <div className="v2-workspace">
        <div className="v2-panel v2-graph-panel"><div className="v2-panel-head"><b><i /> LIVE BLAST RADIUS</b><span>REPLAY PROPAGATION</span></div><Graph progress={p} selected={selected} /><div className="v2-graph-foot"><span>source</span><span>exposed</span><span>critical</span></div></div>
        <div className="v2-side-panel"><div className="v2-side-top"><small>INCIDENT</small><strong>FLT-7242AEB5</strong><b>TYPE CHANGED</b></div><div className="v2-metrics"><span><small>PEAK RISK</small><b>93</b></span><span><small>CONFIDENCE</small><b>93%</b></span><span><small>EXPOSED</small><b>5</b></span></div><div className="v2-action-stamp" style={{opacity: stamp, transform: `translateX(${(1 - stamp) * 20}px)`}}><small>RECOMMENDED ACTION</small><strong>BLOCK</strong></div><div className="v2-path-readout"><b>DATASET</b><i>→</i><b>FEATURE</b><i>→</i><b>MODEL</b><i>→</i><b>DEPLOYMENT</b></div></div>
      </div>
    </BrowserChrome>
    <KineticCopy className="v2-lower-left"><span>DATASET → FEATURE → MODEL → DEPLOYMENT</span></KineticCopy>
  </AbsoluteFill>;
};

const EvidenceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const total = smooth(frame, [10, 96]);
  const selected = smooth(frame, [0, 20]);
  const components = [["+60", "type changed", C.red], ["+14", "ML model exposure", C.orange], ["+12", "tier-3 criticality", C.orange], ["+12", "confirmed column lineage", C.teal], ["+04", "production lifecycle", C.teal], ["−10", "three-hop distance", C.muted]];
  return <AbsoluteFill className="v2-root"><V2Background accent={C.red} /><V2Brand right="02 / EVIDENCE LEDGER" />
    <BrowserChrome title="FAULTLINE / EVIDENCE LEDGER">
      <AppHeader active="incident" />
      <div className="v2-evidence-layout"><div className="v2-evidence-graph"><Graph progress={1} selected="model" /><div className="v2-selected-path">raw_orders <i>→</i> order_features <i>→</i> customer_lifetime_value <i>→</i> <b>churn-predictor</b></div></div><div className="v2-score-card" style={{transform: `translateX(${(1 - selected) * 70}px)`, opacity: selected}}><div className="v2-score-title"><span>churn-predictor</span><b>MLMODEL</b></div><div className="v2-score-total"><strong>{Math.floor(total * 92)}</strong><small>/100 RISK</small></div><div className="v2-score-lines">{components.map(([value, label, color], i) => { const reveal = smooth(frame, [20 + i * 12, 42 + i * 12]); return <div key={label} style={{opacity: reveal, transform: `translateX(${(1 - reveal) * 20}px)`}}><b style={{color}}>{value}</b><span>{label}</span></div>; })}</div><div className="v2-score-foot"><span>FIELD CONFIRMED</span><b>order_total</b><small>receipt sealed · SHA-256</small></div></div></div>
    </BrowserChrome>
    <Cursor x={820 - smooth(frame, [0, 18]) * 64} y={560 + smooth(frame, [0, 18]) * 40} clickAt={18} visible={frame < 48} />
    <KineticCopy className="v2-lower-left"><span>92 IS NOT A GUESS.</span></KineticCopy>
  </AbsoluteFill>;
};

const ReceiptScene: React.FC = () => {
  const frame = useCurrentFrame();
  const p = smooth(frame, [10, 68]);
  return <AbsoluteFill className="v2-root"><V2Background accent={C.teal} /><V2Brand right="EVIDENCE RECEIPT · SEALED" />
    <div className="v2-receipt-scene"><div className="v2-receipt-card" style={{transform: `perspective(900px) rotateY(${(1 - p) * 26}deg) translateY(${(1 - p) * 35}px)`, opacity: p}}><div className="v2-receipt-head"><span>F//</span><b>FAULTLINE EVIDENCE RECEIPT</b><small>ANALYSIS</small></div><div className="v2-receipt-id">FLT-7242AEB5 <b>BLOCK</b></div><div className="v2-receipt-stats"><span><small>CONFIDENCE</small><strong>93%</strong></span><span><small>ASSETS</small><strong>5</strong></span><span><small>FIELD</small><strong>order_total</strong></span></div><div className="v2-receipt-table"><span>93 · customer_lifetime_value · 2 HOPS</span><span>92 · churn-predictor · 3 HOPS</span><span>79 · churn-predictor-blue · 4 HOPS</span></div><div className="v2-seal"><span>SHA-256</span><b>2f869d5614ec4d2d92442cf506c15cd8</b></div></div><KineticCopy className="v2-receipt-copy"><span>EVIDENCE YOU CAN INSPECT.</span><em>A RECEIPT YOU CAN KEEP.</em></KineticCopy></div>
  </AbsoluteFill>;
};

const CounterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const alt = frame >= 75 && frame < 180;
  const swap = smooth(frame, alt ? [75, 98] : [180, 204]);
  return <AbsoluteFill className="v2-root"><V2Background accent={C.orange} /><V2Brand right="03 / COUNTERFACTUALS" />
    <BrowserChrome title="FAULTLINE / COUNTERFACTUAL REPLAY"><AppHeader active="counterfactual" /><div className="v2-counter-wrap"><div className="v2-counter-head"><small>WHAT IF?</small><h2>Same graph. Different failure.</h2></div><div className="v2-counter-main"><div className="v2-counter-graph" style={{transform: `translateX(${(1 - swap) * 30}px)`}}><Graph progress={1} counterfactual={alt} /><div className="v2-compare" style={{borderColor: alt ? C.orange : C.red}}><span>{alt ? "FRESHNESS BREACH" : "TYPE CHANGED"}</span><b>{alt ? "RETRAIN" : "BLOCK"}</b></div></div><div className="v2-counter-cards"><div className={!alt ? "selected" : ""}><small>OBSERVED</small><strong>Type changed</strong><b>93</b><span>BLOCK</span></div><div className={alt ? "selected" : ""}><small>SIMULATED</small><strong>Freshness breach</strong><b>75</b><span>RETRAIN</span></div></div></div></div></BrowserChrome>
    <Cursor x={1570} y={630} clickAt={75} visible={frame > 50 && frame < 112} /><Cursor x={1570} y={450} clickAt={180} visible={frame > 168 && frame < 216} />
    <KineticCopy className="v2-lower-left"><span>SAME GRAPH. DIFFERENT FAILURE.<br /><em>DIFFERENT RESPONSE.</em></span></KineticCopy>
  </AbsoluteFill>;
};

const GovernanceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const incoming = smooth(frame, [12, 64]);
  const rows = ["TAG · customer_lifetime_value", "TAG · order_features", "TAG · churn-predictor", "TAG · churn-predictor-blue", "TAG · command-center", "DOCUMENT · evidence receipt"];
  return <AbsoluteFill className="v2-root"><V2Background accent={C.orange} /><V2Brand right="04 / GOVERNANCE" />
    <BrowserChrome title="FAULTLINE / GOVERNED WRITE-BACK"><AppHeader active="governance" /><div className="v2-governance"><div className="v2-policy"><small>POLICY-AS-CODE</small><h2>Propose first.<br /><em>Write second.</em></h2><div className="v2-policy-rule"><span>BLOCK ≥ 92</span><i style={{width: `${36 + incoming * 56}%`}} /><b>92</b></div><div className="v2-policy-rule"><span>WRITE-BACK ≥ 70</span><i style={{width: `${28 + incoming * 48}%`}} /><b>70</b></div><p>Every score has a receipt. Nothing changes until approval.</p></div><div className="v2-mutation-panel"><div className="v2-panel-head"><b>DATAHUB WRITE-BACK</b><span>6 STAGED</span></div>{rows.map((row, i) => { const r = smooth(frame, [20 + i * 5, 38 + i * 5]); return <div className="v2-mutation-row" key={row} style={{opacity: r, transform: `translateX(${(1 - r) * 36}px)`}}><span>{String(i + 1).padStart(2, "0")}</span><b>{row}</b><em>STAGED</em></div>; })}</div></div></BrowserChrome>
    <KineticCopy className="v2-lower-left"><span>THE AGENT CAN ACT.<br /><em>YOU HOLD THE KEY.</em></span></KineticCopy>
  </AbsoluteFill>;
};

const ApprovalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phrase = "APPLY FLT-7242AEB5";
  const typed = Math.floor(frame < 55
    ? interpolate(frame, [18, 48], [0, 6], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})
    : frame < 88
      ? interpolate(frame, [55, 82], [6, 10], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})
      : interpolate(frame, [88, 112], [10, phrase.length], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}));
  const applied = frame >= 166;
  const verify = applied ? smooth(frame, [166, 224]) : 0;
  return <AbsoluteFill className="v2-root"><V2Background accent={C.lime} /><V2Brand right="04 / GOVERNANCE · APPROVAL BOUNDARY" />
    <div className="v2-approval"><div className="v2-approval-copy"><small>HUMAN APPROVAL REQUIRED</small><h2>One phrase.<br /><em>Six durable writes.</em></h2><p>The agent prepared the exact DataHub payload. You decide whether it crosses the boundary.</p></div><div className="v2-approval-card"><div className="v2-approval-label">INCIDENT-SPECIFIC APPROVAL PHRASE</div><div className="v2-input"><span>{phrase.slice(0, typed)}</span><i /></div><button style={{background: typed >= phrase.length ? C.red : C.line}}>AUTHORIZE WRITES</button><div className="v2-verified-list">{["add_tags · 5 assets", "save_document · receipt"].map((label, i) => <div key={label} style={{opacity: verify, transform: `translateX(${(1 - verify) * 20}px)`}}><span>{i + 1}</span><b>{label}</b><em>✓ VERIFIED</em></div>)}</div></div></div>
    <Cursor x={1350 - smooth(frame, [146, 166]) * 30} y={560 - smooth(frame, [146, 166]) * 18} clickAt={166} visible={frame > 146 && frame < 190} />
    <KineticCopy className="v2-lower-left"><span>{applied ? "DURABLE CONTEXT VERIFIED." : "TYPE THE KEY."}</span></KineticCopy>
  </AbsoluteFill>;
};

const MemoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const p = smooth(frame, [12, 100]);
  return <AbsoluteFill className="v2-root"><V2Background accent={C.lime} intensity={1.15} /><V2Brand right="05 / THE GRAPH REMEMBERS" />
    <div className="v2-memory"><div className="v2-memory-heading"><small>READ-AFTER-WRITE VERIFICATION</small><h2>Context goes back<br /><em>where it belongs.</em></h2></div><div className="v2-memory-graph"><Graph progress={1} verified /><div className="v2-memory-flow" style={{width: `${p * 80}%`}}><b>add_tags</b><i>→</i><b>save_document</b><i>→</i><b>future agent context</b></div></div><KineticCopy className="v2-memory-copy"><span>THE NEXT RESPONDER DOESN'T START OVER.</span><em>THE GRAPH REMEMBERS.</em></KineticCopy></div>
  </AbsoluteFill>;
};

const ProofScene: React.FC = () => {
  const frame = useCurrentFrame();
  const p = smooth(frame, [8, 85]);
  const items = ["DATAHUB MCP", "15/15 TESTS", "READ-AFTER-WRITE", "APACHE-2.0"];
  return <AbsoluteFill className="v2-root"><V2Background accent={C.teal} /><V2Brand right="VERIFIED BUILD" /><div className="v2-proof"><KineticCopy className="v2-proof-copy"><span>WORKING SOFTWARE.</span><em>INSPECTABLE EVIDENCE.</em></KineticCopy><div className="v2-proof-rail">{items.map((item, i) => { const r = smooth(frame, [10 + i * 12, 28 + i * 12]); return <React.Fragment key={item}><div style={{opacity: r, transform: `translateX(${(1 - r) * 32}px)`}}><b>{item}</b><span>✓</span></div>{i < items.length - 1 ? <i style={{width: `${Math.max(0, p * 100 - i * 24)}px`}} /> : null}</React.Fragment>; })}</div><div className="v2-terminal-line" style={{opacity: p}}><span>$ faultline demo</span><b>credential-free in 4 seconds</b></div></div></AbsoluteFill>;
};

const CloseSceneV2: React.FC = () => {
  const frame = useCurrentFrame();
  const p = spring({frame, fps: FPS, config: {damping: 15, stiffness: 90}});
  return <AbsoluteFill className="v2-root"><V2Background accent={C.lime} intensity={0.7} /><div className="v2-close-v2" style={{transform: `scale(${0.94 + p * 0.06})`}}><div className="v2-close-mark"><span>F//</span> FAULTLINE</div><h2>Catch the tremor<br /><em>before the model breaks.</em></h2><div className="v2-close-rule" /><small>BUILT WITH DATAHUB MCP</small></div><div className="v2-final-pulse" style={{transform: `scaleX(${interpolate(frame, [12, 28, 55], [0, 1, 0.2], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})})`}} /> </AbsoluteFill>;
};

export const FaultlineFilmV2: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.ink}}>
    <Sequence from={0} durationInFrames={450}><OpeningScene /></Sequence>
    <Sequence from={450} durationInFrames={210}><TriggerScene /></Sequence>
    <Sequence from={660} durationInFrames={360}><BlastScene /></Sequence>
    <Sequence from={1020} durationInFrames={390}><EvidenceScene /></Sequence>
    <Sequence from={1410} durationInFrames={240}><ReceiptScene /></Sequence>
    <Sequence from={1650} durationInFrames={300}><CounterScene /></Sequence>
    <Sequence from={1950} durationInFrames={270}><GovernanceScene /></Sequence>
    <Sequence from={2220} durationInFrames={240}><ApprovalScene /></Sequence>
    <Sequence from={2460} durationInFrames={270}><MemoryScene /></Sequence>
    <Sequence from={2730} durationInFrames={150}><ProofScene /></Sequence>
    <Sequence from={2880} durationInFrames={120}><CloseSceneV2 /></Sequence>
    <Audio src={staticFile("audio/faultline-v2-score.wav")} volume={1.9} />
  </AbsoluteFill>
);
