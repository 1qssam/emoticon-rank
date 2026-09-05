/* 기간별 순위 변동 패널 — 인기 순위·신규 이모티콘 두 페이지가 함께 씁니다.

   쓰는 법
     1) 목록 옆에 <div id="panelhost"></div> 를 둡니다
     2) RankPanel.init({ data: D, host: "panelhost", onChange: render });
     3) 목록을 그릴 때  체크 여부 RankPanel.has(i) / 전환 RankPanel.toggle(i)
     4) 다 그린 뒤      RankPanel.draw();
*/
(function(){

const CSS = `
  .panel{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px 18px;
    position:sticky;top:16px}
  .panel h2{font-size:14.5px;margin:0 0 12px;font-weight:600}
  .ctrl{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:9px}
  .ctrl select{font-family:inherit;font-size:13.5px;border:1px solid var(--line);border-radius:6px;
    padding:5px 6px;background:#fff;color:var(--ink)}
  .presets{display:flex;gap:5px;flex-wrap:wrap}
  .preset{border:1px solid var(--line);background:#fff;border-radius:999px;padding:5px 12px;
    font-size:13px;color:var(--muted);cursor:pointer;font-family:inherit}
  .preset:hover{border-color:var(--ink);color:var(--ink)}
  .note{font-size:12.5px;color:var(--muted);margin-bottom:6px}

  .agesel{margin-bottom:10px}
  .agesel summary{list-style:none;display:inline-flex;align-items:center;gap:7px;cursor:pointer;
    border:1px solid var(--line);background:#fff;border-radius:8px;padding:6px 12px;font-size:13.5px}
  .agesel summary::-webkit-details-marker{display:none}
  .agesel summary:hover{border-color:var(--ink)}
  .caret{display:inline-block;transition:transform .15s;font-size:10px;color:var(--muted)}
  .agesel[open] .caret{transform:rotate(90deg)}
  .agecount{color:var(--muted);font-size:12.5px}
  .agebox{display:flex;flex-wrap:wrap;gap:7px 16px;padding:10px 4px 2px}
  .agebox label{display:flex;align-items:center;gap:6px;font-size:13.5px;cursor:pointer}

  .legend{display:flex;flex-direction:column;gap:5px;margin-top:12px}
  .leg{display:flex;align-items:center;gap:8px;font-size:13px;background:#fff;
    border:1px solid var(--line);border-radius:8px;padding:5px 8px 5px 10px}
  .leg.off{opacity:.45}
  .legname{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px;flex:1}
  .dot{width:10px;height:10px;border-radius:2px;flex:none}
  .legbtn{border:0;background:none;cursor:pointer;font-size:13px;padding:1px 3px;line-height:1;border-radius:4px}
  .legbtn:hover{background:#f0efea}
  .dashkey{display:flex;gap:12px;flex-wrap:wrap;margin-top:9px;font-size:12.5px;color:var(--muted)}
  .panelhead{display:flex;align-items:center;justify-content:space-between;gap:8px}
  .panelx{border:0;background:none;cursor:pointer;color:var(--muted);font-size:14px;
    padding:3px 6px;border-radius:6px;line-height:1}
  .panelx:hover{background:#e9e7e1;color:var(--ink)}
  .chartwrap{position:relative}
  .tip{position:absolute;pointer-events:none;transition:top .08s linear;background:#fff;border:1px solid var(--line);
    border-radius:8px;padding:8px 10px;font-size:12.5px;box-shadow:0 4px 14px rgba(0,0,0,.1);
    width:auto;min-width:150px;max-width:230px;z-index:5}
  .tip b{display:block;font-size:12px;color:var(--muted);font-weight:500;margin-bottom:5px;
    font-variant-numeric:tabular-nums}
  .tiprow{display:flex;align-items:center;gap:6px;line-height:1.7}
  .tiprow span.v{margin-left:auto;font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap}
  .foot{margin-top:44px;padding-top:18px;border-top:1px solid var(--line);
    font-size:12.5px;color:var(--muted);line-height:1.7}
  .foot p{margin:0 0 4px}
  .foot .slot{margin-top:8px}
  .foot .slot a{color:var(--ink);text-decoration:none;font-weight:500;border-bottom:1px solid var(--line)}
  .foot .slot a:hover{border-color:var(--ink)}
  #chart svg{display:block;width:100%;height:auto}
  .leg svg,.tiprow svg,.dashkey svg{display:inline-block;vertical-align:middle;flex:none}
  button:focus-visible,select:focus-visible,a:focus-visible,summary:focus-visible,input:focus-visible{
    outline:2px solid var(--ink);outline-offset:2px}
  /* 위아래 이동 버튼 */
  .scrollbtns{position:fixed;right:16px;bottom:16px;display:flex;flex-direction:column;gap:6px;z-index:50}
  .scrollbtns button{width:38px;height:38px;border:1px solid var(--line);background:#fff;border-radius:10px;
    cursor:pointer;font-size:15px;color:#5c6064;line-height:1;box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .scrollbtns button:hover{border-color:var(--ink);color:var(--ink)}
  .sheettoggle{display:none;border:0;background:none;cursor:pointer;color:var(--muted);
    font-size:13px;padding:3px 6px;border-radius:6px;line-height:1;font-family:inherit}
  .sheettoggle:hover{background:#e9e7e1;color:var(--ink)}

  /* 위아래 이동 버튼 */
  .scrollbtns{position:fixed;right:16px;bottom:16px;display:flex;flex-direction:column;gap:6px;z-index:50}
  .scrollbtns button{width:38px;height:38px;border:1px solid var(--line);background:#fff;border-radius:10px;
    cursor:pointer;font-size:15px;color:#5c6064;line-height:1;box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .scrollbtns button:hover{border-color:var(--ink);color:var(--ink)}
  .sheettoggle{display:none;border:0;background:none;cursor:pointer;color:var(--muted);
    font-size:13px;padding:3px 6px;border-radius:6px;line-height:1;font-family:inherit}
  .sheettoggle:hover{background:#e9e7e1;color:var(--ink)}

  @media (max-width:1000px){
    .main.split{grid-template-columns:1fr}
    .panel{position:fixed;left:0;right:0;bottom:0;top:auto;z-index:40;
      max-height:62vh;overflow-y:auto;border-radius:14px 14px 0 0;border-bottom:0;
      padding:12px 14px 18px;box-shadow:0 -6px 24px rgba(0,0,0,.13)}
    .panel .panelhead{position:sticky;top:0;background:var(--panel);z-index:1;padding:2px 0 6px;margin:0}
    .panel.collapsed{max-height:none;overflow:visible}
    .panel.collapsed > *:not(.panelhead){display:none}
    .sheettoggle{display:inline-flex}
  }
`;

const MARKUP = `
    <div class="panel" id="panel" hidden>
      <div class="panelhead">
        <h2>기간별 순위 변동</h2>
        <span style="margin-left:auto"></span>
        <button class="sheettoggle" id="sheettoggle" aria-label="펼치기/접기">▾ 접기</button>
        <button class="panelx" id="panelx" aria-label="순위 변동 닫기">✕</button>
      </div>
      <div class="note">비교는 한 번에 5개까지 표시할 수 있습니다.</div>

      <div class="ctrl">
        <span><select id="sy"></select><select id="sm"></select><select id="sd"></select></span>
        <span class="note" style="margin:0">–</span>
        <span><select id="ey"></select><select id="em"></select><select id="ed"></select></span>
      </div>
      <div class="ctrl">
        <span class="presets">
          <button class="preset" data-days="7">일주일</button>
          <button class="preset" data-days="30">30일</button>
          <button class="preset" data-days="60">60일</button>
          <button class="preset" data-days="90">90일</button>
        </span>
      </div>

      <details class="agesel" id="agesel">
        <summary><span class="caret">▶</span>연령대 <span class="agecount" id="agecount"></span></summary>
        <div class="agebox" id="agebox"></div>
      </details>

      <div class="note" id="rangenote"></div>
      <div class="chartwrap"><div id="chart"></div><div class="tip" id="tip" hidden></div></div>
      <div class="dashkey" id="dashkey"></div>
      <div class="legend" id="legend"></div>
    </div>
`;

const COLORS = ["#0072b2","#e69f00","#009e73","#cc79a7","#333333"];
const SHAPES = ["circle","square","triangle","diamond","cross"];
const DASH = {"전체":"", "10대":"6 3", "20대":"2 3", "30대":"9 3 2 3", "40대":"12 4", "50대이상":"1 4"};
const MAX_DAYS = 90, MAX_PICK = 5;

let D, onChange = () => {};
let picked = [];
let chartAges = [];
let from = 0, to = 0;

const $ = id => document.getElementById(id);
const meta = i => D.items[i];
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

const ymd = t => t.split("-");
function fillPeriod(){
  const years = [...new Set(D.dates.map(t => ymd(t)[0]))];
  const build = (sel, list, val) => {
    sel.innerHTML = list.map(v => `<option value="${v}">${+v}</option>`).join("");
    if (list.includes(val)) sel.value = val;
  };
  [["s", from], ["e", to]].forEach(([p, idx]) => {
    const [y, m, dd] = ymd(D.dates[idx]);
    build($(p+"y"), years, y);
    const ms = [...new Set(D.dates.filter(x => ymd(x)[0] === $(p+"y").value).map(x => ymd(x)[1]))];
    build($(p+"m"), ms, m);
    const ds = [...new Set(D.dates.filter(x => ymd(x)[0] === $(p+"y").value && ymd(x)[1] === $(p+"m").value).map(x => ymd(x)[2]))];
    build($(p+"d"), ds, dd);
  });
}
function clampRange(){
  const span = () => (new Date(D.dates[to]) - new Date(D.dates[from])) / 86400000;
  if (span() > MAX_DAYS){
    while (from < to && span() > MAX_DAYS) from++;
    $("rangenote").textContent = `기간은 최대 ${MAX_DAYS}일까지 볼 수 있습니다.`;
  } else $("rangenote").textContent = "";
}


/* 위아래 이동 */

/* 좁은 화면에서는 순위 변동이 아래쪽 시트로 뜹니다 */
function layoutSheet(){
  const p = $("panel"), b = $("scrollbtns");
  const narrow = window.innerWidth <= 1000;
  if (!narrow || p.hidden){
    b.style.bottom = "16px";
    document.body.style.paddingBottom = "";
    return;
  }
  const h = p.offsetHeight;
  b.style.bottom = (h + 12) + "px";
  document.body.style.paddingBottom = (h + 20) + "px";
}
window.addEventListener("resize", layoutSheet);

function marker(x, y, shape, color, r){
  r = r || 3;
  switch (shape){
    case "square":   return `<rect x="${x-r}" y="${y-r}" width="${r*2}" height="${r*2}" fill="${color}"/>`;
    case "triangle": return `<polygon points="${x},${y-r-.6} ${x+r+.4},${y+r} ${x-r-.4},${y+r}" fill="${color}"/>`;
    case "diamond":  return `<polygon points="${x},${y-r-.8} ${x+r+.8},${y} ${x},${y+r+.8} ${x-r-.8},${y}" fill="${color}"/>`;
    case "cross":    return `<path d="M${x-r-.6} ${y}H${x+r+.6}M${x} ${y-r-.6}V${y+r+.6}" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`;
    default:         return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
  }
}

/* 그래프 */
function draw(){
  const on = picked.length > 0;
  $("panel").hidden = !on;
  $("main").classList.toggle("split", on);
  if (!on){ layoutSheet(); return; }

  fillPeriod();
  $("agecount").textContent = chartAges.length > 1 ? `${chartAges.length}개 선택` : chartAges[0];

  const W = 470, H = 420, L = 44, R = 12, T = 14, B = 28;
  const idxs = []; for (let k = from; k <= to; k++) idxs.push(k);
  const n = idxs.length;
  const x = j => L + (W - L - R) * (n === 1 ? .5 : j / (n - 1));
  const y = r => T + (H - T - B) * (r - 1) / 199;

  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="선택한 이모티콘의 기간별 순위 변동">`;
  [1,25,50,75,100,125,150,175,200].forEach(r => {
    const major = r % 50 === 0 || r === 1;
    svg += `<line x1="${L}" y1="${y(r)}" x2="${W-R}" y2="${y(r)}" stroke="${major?"#dedcd6":"#eae8e2"}"/>`;
    if (major) svg += `<text x="${L-8}" y="${y(r)+4}" text-anchor="end" font-size="12" fill="#8b8985">${r}위</text>`;
  });
  const step = Math.ceil(n / 7);
  idxs.forEach((k, j) => {
    if (j % step) return;
    svg += `<text x="${x(j)}" y="${H-8}" text-anchor="middle" font-size="12" fill="#8b8985">${D.dates[k].slice(5).replace("-","/")}</text>`;
  });

  chartAges.forEach(a => {
    const ranks = {};
    D.hot[a].forEach((row, k) => row.forEach((it, i) => { (ranks[it] ||= {})[k] = i + 1; }));
    picked.forEach((p, ci) => {
      if (!p.on) return;
      const color = COLORS[ci % COLORS.length];
      let seg = [], segs = [];
      idxs.forEach((k, j) => {
        const r = ranks[p.id]?.[k];
        if (r) seg.push([x(j), y(r)]);
        else { if (seg.length) segs.push(seg); seg = []; }
      });
      if (seg.length) segs.push(seg);
      segs.forEach(s => {
        if (s.length > 1)
          svg += `<polyline points="${s.map(q=>q.join(",")).join(" ")}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="${DASH[a]}" stroke-linejoin="round" stroke-linecap="round"/>`;
        s.forEach(q => svg += marker(q[0], q[1], SHAPES[ci % SHAPES.length], color, 3));
      });
    });
  });
  svg += `<line id="guide" x1="0" y1="${T}" x2="0" y2="${H-B}" stroke="#b8b6b0" stroke-width="1" visibility="hidden"/>`;
  svg += `</svg>`;
  $("chart").innerHTML = svg;

  $("dashkey").innerHTML = chartAges.length > 1
    ? chartAges.map(a => `<span><svg width="24" height="9" aria-hidden="true"><line x1="0" y1="4.5" x2="24" y2="4.5" stroke="#6d7175" stroke-width="2" stroke-dasharray="${DASH[a]}"/></svg> ${a}</span>`).join("")
    : "";

  $("legend").innerHTML = picked.map((p, ci) => `
    <span class="leg ${p.on ? "" : "off"}">
      <svg width="13" height="13" aria-hidden="true">${marker(6.5, 6.5, SHAPES[ci % SHAPES.length], COLORS[ci % COLORS.length], 4.2)}</svg>
      <span class="legname">${esc(meta(p.id)[1])}</span>
      <button class="legbtn" data-eye="${p.id}" title="${p.on ? "숨기기" : "표시"}">${p.on ? "👁" : "🚫"}</button>
      <button class="legbtn" data-x="${p.id}" title="빼기">✕</button>
    </span>`).join("");
  $("legend").querySelectorAll("[data-eye]").forEach(b => b.onclick = () => {
    const t = picked.find(p => p.id === +b.dataset.eye); t.on = !t.on; onChange();
  });
  $("legend").querySelectorAll("[data-x]").forEach(b => b.onclick = () => {
    picked = picked.filter(p => p.id !== +b.dataset.x); onChange();
  });

  /* 커서 올리면 순위 말풍선
     연령대나 아이템 중 한쪽이 하나면 숫자를 보여줍니다. */
  const svgEl = $("chart").querySelector("svg");
  const tip = $("tip"), guide = svgEl.querySelector("#guide");
  const shown = picked.filter(p => p.on);
  const oneAge = chartAges.length === 1;
  const oneItem = shown.length === 1;

  const ranksBy = {};
  chartAges.forEach(a => {
    const m = {};
    D.hot[a].forEach((row, k) => row.forEach((it, i) => { (m[it] ||= {})[k] = i + 1; }));
    ranksBy[a] = m;
  });
  const rankText = r => r ? r + "위" : "200위 밖";

  svgEl.onmousemove = e => {
    const box = svgEl.getBoundingClientRect();
    const px = (e.clientX - box.left) * W / box.width;
    let j = Math.round((px - L) / ((W - L - R) || 1) * (n - 1));
    j = Math.max(0, Math.min(n - 1, j));
    const k = idxs[j];

    guide.setAttribute("x1", x(j));
    guide.setAttribute("x2", x(j));
    guide.setAttribute("visibility", "visible");

    let body;
    if (!shown.length){
      body = `<div class="tiprow" style="color:var(--muted)">표시 중인 항목이 없습니다</div>`;
    } else if (oneAge){
      // 연령대 하나 → 아이템별로 표시
      body = shown.map(p => {
        const ci = picked.findIndex(q => q.id === p.id);
        return `<div class="tiprow">
          <svg width="12" height="12" aria-hidden="true">${marker(6, 6, SHAPES[ci % SHAPES.length], COLORS[ci % COLORS.length], 4)}</svg>
          <span class="v">${rankText(ranksBy[chartAges[0]][p.id]?.[k])}</span></div>`;
      }).join("");
    } else if (oneItem){
      // 아이템 하나 → 연령대별로 표시
      const p = shown[0];
      const ci = picked.findIndex(q => q.id === p.id);
      const color = COLORS[ci % COLORS.length];
      body = chartAges.map(a => `<div class="tiprow">
          <svg width="24" height="10" aria-hidden="true"><line x1="0" y1="5" x2="24" y2="5"
            stroke="${color}" stroke-width="2" stroke-dasharray="${DASH[a]}"/></svg>
          <span style="color:var(--muted)">${a}</span>
          <span class="v">${rankText(ranksBy[a][p.id]?.[k])}</span></div>`).join("");
    } else {
      body = `<div class="tiprow" style="color:var(--muted)">연령대나 이모티콘 중<br>한쪽을 하나만 고르면<br>순위가 표시됩니다</div>`;
    }
    tip.innerHTML = `<b>${D.dates[k].slice(5).replace("-", "/")}</b>${body}`;
    tip.hidden = false;

    const anchorX = x(j) / W * box.width;
    const cursorY = e.clientY - box.top;
    const tw = tip.offsetWidth, th = tip.offsetHeight;

    // 오른쪽에 자리가 없으면 커서 왼쪽으로 넘깁니다
    let left = anchorX + 14;
    if (left + tw > box.width - 4) left = anchorX - tw - 14;
    tip.style.left = Math.max(0, Math.min(left, box.width - tw - 2)) + "px";

    // 말풍선 아래쪽 끝이 커서에 붙습니다 (커서가 내용을 가리지 않도록)
    let top = cursorY - th - 12;
    if (top < 0) top = cursorY + 16;
    tip.style.top = Math.max(0, Math.min(top, box.height - th)) + "px";
  };
  svgEl.onmouseleave = () => { tip.hidden = true; guide.setAttribute("visibility", "hidden"); };
  layoutSheet();
}



function wire(){
  $("panelx").onclick = () => { picked = []; onChange(); };
  $("toTop").onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  $("toBottom").onclick = () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  $("sheettoggle").onclick = () => {
    const p = $("panel");
    p.classList.toggle("collapsed");
    $("sheettoggle").textContent = p.classList.contains("collapsed") ? "▴ 펼치기" : "▾ 접기";
    layoutSheet();
  };

  D.ages.forEach(a => {
    const l = document.createElement("label");
    l.innerHTML = `<input type="checkbox" value="${a}" ${chartAges.includes(a) ? "checked" : ""}>${a}`;
    l.querySelector("input").onchange = e => {
      if (e.target.checked){
        chartAges.push(a);
        chartAges.sort((x, y) => D.ages.indexOf(x) - D.ages.indexOf(y));
      } else chartAges = chartAges.filter(v => v !== a);
      if (!chartAges.length){ chartAges = [a]; e.target.checked = true; }
      onChange();
    };
    $("agebox").appendChild(l);
  });

  ["s","e"].forEach(p => ["y","m","d"].forEach(k => {
    $(p+k).onchange = () => {
      const want = `${$(p+"y").value}-${$(p+"m").value}-${$(p+"d").value}`;
      let j = D.dates.indexOf(want);
      if (j < 0){ j = D.dates.findIndex(x => x >= want); if (j < 0) j = D.dates.length - 1; }
      if (p === "s") from = j; else to = j;
      if (from > to){ const t = from; from = to; to = t; }
      clampRange(); onChange();
    };
  }));

  document.querySelectorAll(".preset").forEach(b => b.onclick = () => {
    to = D.dates.length - 1;
    from = Math.max(0, to - (+b.dataset.days) + 1);
    onChange();
  });
}

window.RankPanel = {
  init(opt){
    D = opt.data;
    onChange = opt.onChange || (() => {});
    chartAges = [D.ages[0]];
    from = 0; to = D.dates.length - 1;

    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    $(opt.host).outerHTML = MARKUP +
      `<div class="scrollbtns" id="scrollbtns">
         <button id="toTop" aria-label="맨 위로">↑</button>
         <button id="toBottom" aria-label="맨 아래로">↓</button>
       </div>`;
    wire();
  },
  has(i){ return picked.some(p => p.id === i); },
  toggle(i){
    const at = picked.findIndex(p => p.id === i);
    if (at >= 0) picked.splice(at, 1);
    else if (picked.length < MAX_PICK) picked.push({ id: i, on: true });
    onChange();
  },
  draw,
};

})();
