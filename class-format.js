/* 강의 소개 문장 만들기
   ------------------------------------------------
   회차 목록만 있으면 기간·요일·횟수·시간·휴강일을 계산합니다.
   class.html 과 class-edit.html 이 함께 씁니다.                */

window.ClassText = (function(){
  const DOW = "일월화수목금토";
  const pad = n => String(n).padStart(2, "0");

  const parse = s => {
    const [date, time] = String(s).split(" ");
    const [a, b] = String(time || "").split("-");
    return { date, start: a || "", end: b || "" };
  };

  const dowOf = date => {
    const [y, m, d] = date.split("-").map(Number);
    return new Date(y, m-1, d).getDay();
  };

  const ymd = date => {
    const [y, m, d] = date.split("-").map(Number);
    return `${y}년 ${m}월 ${d}일(${DOW[dowOf(date)]})`;
  };

  /* 10:00 → 오전 10:00 */
  function ampm(t){
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const ap = h >= 12 ? "오후" : "오전";
    let hh = h % 12; if (hh === 0) hh = 12;
    return `${ap} ${hh}:${pad(m)}`;
  }

  const minutes = t => { const [h, m] = t.split(":").map(Number); return h*60 + m; };

  function hours(min){
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h}시간 ${m}분` : `${h}시간`;
  }

  /* 휴강일: 같은 달은 날짜만 이어 붙입니다 (10월 12, 19일) */
  function offText(dates){
    const byMonth = [];
    dates.forEach(date => {
      const [, m, d] = date.split("-").map(Number);
      const last = byMonth[byMonth.length - 1];
      if (last && last.m === m) last.days.push(d);
      else byMonth.push({ m, days: [d] });
    });
    return byMonth.map(x => `${x.m}월 ${x.days.join(", ")}일`).join(", ");
  }

  function summary(c){
    const list = (c.sessions || []).map(parse).filter(s => s.date).sort((a, b) => a.date.localeCompare(b.date));
    const lines = [];
    if (!list.length) return { lines, list };

    const first = list[0], last = list[list.length - 1];

    if (c.kind) lines.push({ text: c.kind });

    lines.push({ text: list.length === 1 ? ymd(first.date) : `${ymd(first.date)} ~ ${ymd(last.date)}` });

    // 요일과 횟수
    const days = [...new Set(list.map(s => dowOf(s.date)))].sort();
    const dayText = days.map(d => DOW[d]).join("·") + "요일";
    const per = first.end ? minutes(first.end) - minutes(first.start) - (c.lunch || 0) : 0;
    const total = per * list.length;
    lines.push({
      text: (list.length > 1 ? `매주 ${dayText}, ` : `${dayText}, `) +
            `${list.length}회` + (total > 0 ? ` (총 ${hours(total)})` : ""),
    });

    // 휴강: 그 요일이면 있어야 하는데 빠진 날
    const has = new Set(list.map(s => s.date));
    const off = [];
    const [fy, fm, fd] = first.date.split("-").map(Number);
    const [ly, lm, ld] = last.date.split("-").map(Number);
    const end = new Date(ly, lm-1, ld);
    for (let d = new Date(fy, fm-1, fd); d <= end; d.setDate(d.getDate() + 1)){
      if (!days.includes(d.getDay())) continue;
      const date = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
      if (!has.has(date)) off.push(date);
    }
    if (off.length) lines.push({ text: `휴강: ${offText(off)}`, off: true });

    // 시각
    if (first.start){
      const time = first.end ? `${ampm(first.start)} ~ ${ampm(first.end)}` : ampm(first.start);
      const tail = [];
      if (per > 0) tail.push(hours(per));
      if (c.lunch) tail.push(`점심시간 ${hours(c.lunch)}`);
      lines.push({ text: time + (tail.length ? ` (${tail.join(", ")})` : "") });
    }

    return { lines, list };
  }

  /* 달력·목록에 쓰는 한 줄 이름 */
  function title(c){
    const list = (c.sessions || []).map(parse).filter(s => s.date).sort((a, b) => a.date.localeCompare(b.date));
    const days = [...new Set(list.map(s => dowOf(s.date)))].sort();
    const bits = [c.place, c.kind];
    if (days.length) bits.push(days.map(d => DOW[d]).join("·") + "요일");
    if (list[0] && list[0].start){
      const [h, m] = list[0].start.split(":").map(Number);
      const ap = h >= 12 ? "오후" : "오전";
      let hh = h % 12; if (hh === 0) hh = 12;
      bits.push(`${ap} ${hh}시${m ? " " + m + "분" : ""}`);
    }
    return bits.filter(Boolean).join(" ");
  }

  return { summary, title, ampm, ymd, hours };
})();
