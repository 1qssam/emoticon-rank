/* 세 페이지가 함께 쓰는 조각들 */

/* ── 날짜 선택기 ──────────────────────────────
   날짜 글씨를 누르면 입력칸과 달력이 함께 열립니다. */
function initDatePicker(opt){
  const dates = opt.dates;
  const set = new Set(dates);
  const box = document.getElementById(opt.picker);
  const input = box.querySelector("input[type=date]");
  const cal = box.querySelector(".cal");
  const monthLabel = box.querySelector(".calmonth");
  const btnPrev = box.querySelector(".calprev");
  const btnNext = box.querySelector(".calnext");
  let ym = dates.at(-1).slice(0, 7);

  function shift(v, d){
    let [y, m] = v.split("-").map(Number);
    m += d;
    if (m < 1){ m = 12; y--; } else if (m > 12){ m = 1; y++; }
    return `${y}-${String(m).padStart(2, "0")}`;
  }

  function draw(){
    const [y, m] = ym.split("-").map(Number);
    monthLabel.textContent = `${y}년 ${m}월`;
    const first = new Date(y, m - 1, 1).getDay();
    const last = new Date(y, m, 0).getDate();
    let html = "일월화수목금토".split("").map(d => `<span class="h">${d}</span>`).join("");
    for (let i = 0; i < first; i++) html += "<span></span>";
    for (let d = 1; d <= last; d++){
      const key = `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      html += `<button ${set.has(key) ? "" : "disabled"} class="${key === dates[opt.get()] ? "sel" : ""}" data-d="${key}">${d}</button>`;
    }
    cal.innerHTML = html;
    cal.querySelectorAll("button[data-d]").forEach(b => b.onclick = () => choose(b.dataset.d));
    btnPrev.disabled = ym <= dates[0].slice(0, 7);
    btnNext.disabled = ym >= dates.at(-1).slice(0, 7);
  }

  function choose(v){
    const k = dates.indexOf(v);
    if (k >= 0){ box.hidden = true; opt.set(k); }
  }

  document.getElementById(opt.button).onclick = e => {
    e.stopPropagation();
    box.hidden = !box.hidden;
    if (box.hidden) return;
    ym = dates[opt.get()].slice(0, 7);
    input.min = dates[0]; input.max = dates.at(-1); input.value = dates[opt.get()];
    draw();
  };
  box.onclick = e => e.stopPropagation();
  document.addEventListener("click", () => { box.hidden = true; });
  input.onchange = e => choose(e.target.value);
  btnPrev.onclick = () => { ym = shift(ym, -1); draw(); };
  btnNext.onclick = () => { ym = shift(ym, 1); draw(); };
}

/* ── 이모티콘 종류 표시 ──────────────────────
   flags: 1 미니 / 2 큰 / 4 소리 / 8 움직임 */
const SOUND_ICON =
  '<svg class="sound" viewBox="0 0 16 16" aria-hidden="true">' +
  '<path d="M3 6.2h2.4L8.4 3.6v8.8L5.4 9.8H3z" fill="currentColor"/>' +
  '<path d="M10.6 6.1a2.7 2.7 0 0 1 0 3.8M12.6 4.3a5.3 5.3 0 0 1 0 7.4" ' +
  'fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

function kindTags(flags){
  const mini = flags & 1, big = flags & 2, sound = flags & 4, moving = flags & 8;
  let kind;
  if (big) kind = "큰티";                      // 큰 이모티콘은 모두 움직입니다
  else if (mini) kind = moving ? "미니움티" : "미니멈티";
  else kind = moving ? "움티" : "멈티";
  return `<span class="tag">${kind}</span>` +
         (sound ? `<span class="tag tag-sound" title="소리나는 이모티콘">${SOUND_ICON}소리</span>` : "");
}
