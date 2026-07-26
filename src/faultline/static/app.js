const $ = (selector) => document.querySelector(selector);
const state = { data: null, progress: 0, animation: null };
const labels = {
  field_removed: "Field removed", type_changed: "Type changed",
  null_rate_spike: "Null-rate spike", freshness_breach: "Freshness breach",
  volume_anomaly: "Volume anomaly"
};

fetch("/healthz").then(response => response.json()).then(health => {
  $("#mode-hint").textContent = health.mode === "datahub-mcp"
    ? "Live DataHub MCP graph · governed writes"
    : "Credential-free judge scenario · 4 seconds";
}).catch(() => {
  $("#mode-hint").textContent = "Console connection unavailable";
});

function esc(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

async function run(kind = null) {
  $("#run").disabled = true;
  $("#run span").textContent = "Traversing DataHub…";
  $("#run-error").textContent = "";
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 420);
  try {
    const response = await fetch("/api/investigate", {
      method: "POST",
      headers: kind ? {"Content-Type": "application/json"} : {},
      body: kind ? JSON.stringify({kind}) : null
    });
    if (!response.ok) throw new Error(`Investigation failed (${response.status})`);
    state.data = await response.json();
    render();
    ["#command", "#analysis", "#governance", "#timeline-section"].forEach(id => $(id).classList.remove("hidden"));
    $("#command").scrollIntoView({ behavior: "smooth", block: "start" });
    $("#run span").textContent = "Replay incident";
    $("#replay").disabled = false;
    animateGraph();
  } catch (error) {
    $("#run span").textContent = "Retry investigation";
    $("#run-error").textContent = `${error.message}. Check the DataHub MCP connection or use the credential-free scenario.`;
  } finally {
    $("#run").disabled = false;
  }
}

function render() {
  const d = state.data;
  $("#incident-id").textContent = d.incident_id;
  $("#action").textContent = d.decision.action.toUpperCase();
  $("#confidence").textContent = `${Math.round(d.decision.confidence * 100)}%`;
  $("#exposed").textContent = d.findings.length;
  $("#models").textContent = d.findings.filter(f => f.asset.entity_type.includes("MLMODEL")).length;
  $("#peak").textContent = Math.max(...d.findings.map(f => f.score));
  $("#ledger-count").textContent = `${d.findings.length} PATHS`;
  $("#findings").innerHTML = d.findings.map(f => `
    <article class="finding">
      <div class="finding-top"><div><strong>${esc(f.asset.name)}</strong>
        <small>${esc(f.asset.entity_type)} · ${esc(f.asset.platform)} · ${f.hops} HOP${f.hops === 1 ? "" : "S"}</small></div>
        <span class="score">${f.score}</span></div>
      <div class="riskbar"><i style="width:${f.score}%"></i></div>
      ${f.reasons.map(r => `<div class="reason">+ ${esc(r)}</div>`).join("")}
    </article>`).join("");
  $("#graph-fallback").innerHTML = d.findings.map(f =>
    `<li>${esc(d.source.name)} to ${esc(f.asset.name)}: risk ${f.score}</li>`).join("");
  $("#counterfactuals").innerHTML = d.counterfactuals.map(c => `
    <button class="counter-card ${c.kind === d.signal.kind ? "observed" : ""}" data-kind="${esc(c.kind)}"
      aria-label="Replay incident as ${esc(labels[c.kind])}">
      <small>${c.kind === d.signal.kind ? "Observed signal" : "Simulated"}</small>
      <h3>${esc(labels[c.kind])}</h3>
      <strong>${c.peak_risk}</strong><span>/100</span><br>
      <b>${esc(c.action.toUpperCase())}</b>
      <span class="delta">${c.delta_from_observed > 0 ? "+" : ""}${c.delta_from_observed} Δ</span>
    </button>`).join("");
  document.querySelectorAll(".counter-card").forEach(card => {
    card.addEventListener("click", () => run(card.dataset.kind));
  });
  const policyOrder = ["validate_at", "retrain_at", "quarantine_at", "block_at", "write_back_at"];
  $("#policy").innerHTML = policyOrder.map(key => `
    <div class="policy-row"><span>${esc(key.toUpperCase())}</span>
      <span class="policy-track"><i style="width:${d.decision.policy[key]}%"></i></span>
      <b>${d.decision.policy[key]}</b></div>`).join("");
  $("#mutation-count").textContent = `${d.mutations.length} STAGED`;
  $("#mutations").innerHTML = d.mutations.map(m => `
    <div class="mutation"><b>${esc(m.kind.toUpperCase())}</b><span title="${esc(m.target_urn)}">${esc(m.target_urn)}</span></div>`).join("");
  const expected = `APPLY ${d.incident_id}`;
  $("#approval").placeholder = expected;
  $("#approval").value = "";
  $("#apply").disabled = true;
  $("#write-status").className = "write-status";
  $("#write-status").textContent = "Preview only · nothing has been changed";
  $("#timeline").innerHTML = d.timeline.map(t => `
    <article class="moment"><time>${esc(t.at)}</time><p>${esc(t.event)}</p></article>`).join("");
}

function layoutGraph(width, height) {
  const d = state.data;
  const all = [{...d.source, score: 0, source: true}, ...d.findings.map(f => ({...f.asset, score: f.score, hops: f.hops, path: f.path}))];
  const positions = new Map();
  positions.set(d.source.urn, {x: width * .11, y: height * .5});
  const byHop = {};
  all.slice(1).forEach(n => (byHop[n.hops] ||= []).push(n));
  Object.entries(byHop).forEach(([hop, nodes]) => {
    const x = width * (.12 + Number(hop) * .17);
    nodes.forEach((n, i) => positions.set(n.urn, {x: Math.min(x, width * .88), y: height * ((i + 1) / (nodes.length + 1))}));
  });
  return { all, positions };
}

function drawGraph(progress = 1) {
  const canvas = $("#graph");
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  if (canvas.width !== rect.width * ratio || canvas.height !== rect.height * ratio) {
    canvas.width = rect.width * ratio; canvas.height = rect.height * ratio;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  const {all, positions} = layoutGraph(rect.width, rect.height);
  const source = positions.get(state.data.source.urn);
  ctx.font = "10px Cascadia Code, monospace";
  all.slice(1).forEach((node, i) => {
    const target = positions.get(node.urn);
    const reveal = Math.max(0, Math.min(1, progress * all.length - i - .25));
    if (!reveal) return;
    const parentUrn = node.path?.[node.path.length - 2] || state.data.source.urn;
    const parent = positions.get(parentUrn) || source;
    ctx.beginPath(); ctx.moveTo(parent.x, parent.y); ctx.lineTo(target.x, target.y);
    ctx.strokeStyle = `rgba(87,108,105,${.45 * reveal})`; ctx.lineWidth = 1; ctx.stroke();
    const px = parent.x + (target.x - parent.x) * reveal;
    const py = parent.y + (target.y - parent.y) * reveal;
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = node.score >= 90 ? "#ff334f" : "#ff6a2a"; ctx.fill();
  });
  all.forEach((node, i) => {
    const threshold = node.source ? 0 : (i / all.length);
    if (progress < threshold) return;
    const p = positions.get(node.urn);
    const color = node.source ? "#2ed3c6" : node.score >= 90 ? "#ff334f" : "#ff6a2a";
    ctx.beginPath(); ctx.arc(p.x, p.y, node.source ? 8 : 6, 0, Math.PI * 2);
    ctx.fillStyle = "#0b1011"; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.stroke();
    ctx.fillStyle = "#e8ece8"; ctx.fillText(node.name.slice(0, 22), p.x + 13, p.y - 3);
    ctx.fillStyle = "#788582"; ctx.font = "9px Cascadia Code, monospace";
    ctx.fillText(node.source ? "CHANGE ORIGIN" : `${node.score}/100 · ${node.entity_type}`, p.x + 13, p.y + 12);
    ctx.font = "10px Cascadia Code, monospace";
  });
}

function animateGraph() {
  cancelAnimationFrame(state.animation);
  const start = performance.now();
  const frame = now => {
    state.progress = Math.min(1, (now - start) / 2400);
    drawGraph(state.progress);
    if (state.progress < 1) state.animation = requestAnimationFrame(frame);
  };
  state.animation = requestAnimationFrame(frame);
}

async function applyWrites() {
  $("#apply").disabled = true;
  $("#write-status").textContent = "Applying approved DataHub mutations…";
  const response = await fetch("/api/execute", {
    method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify({confirmation: $("#approval").value})
  });
  const result = await response.json();
  if (!response.ok) {
    $("#write-status").textContent = result.detail || "Write-back failed";
    $("#apply").disabled = false;
    return;
  }
  $("#write-status").className = "write-status success";
  $("#write-status").textContent = `✓ ${result.results.length} durable context writes applied`;
  $("#apply").textContent = "Applied";
}

$("#run").addEventListener("click", () => run());
$("#replay").addEventListener("click", animateGraph);
$("#approval").addEventListener("input", event => {
  $("#apply").disabled = !state.data || event.target.value.trim().toUpperCase() !== `APPLY ${state.data.incident_id}`;
});
$("#apply").addEventListener("click", applyWrites);
window.addEventListener("resize", () => state.data && drawGraph(state.progress));
window.addEventListener("keydown", event => {
  if (event.key.toLowerCase() === "r" && !event.ctrlKey && document.activeElement.tagName !== "INPUT") run();
});
