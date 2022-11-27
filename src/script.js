const trans = s => (transIndex[lang] && transIndex[lang][s]) || s;

const getDateInOffset = offset => {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * offset));
};

const initEvents = () => {
  for (let i = 2; i <= 12; i++) {
    if (i !== 10) annualEvents.push(
      { date: i + "/26", event: "Monthly Service", time: "9:00"}
    )
  }
  annualEvents.sort((a, b) => {
    const [monthA, dayA] = a.date.split("/");
    const [monthB, dayB] = b.date.split("/");
    if (monthA === monthB) return dayA - dayB;
    return monthA - monthB;
  });
};

const formatTime = time => new Date(`1/1/1970 ${time}`).toLocaleTimeString([lang], {timeStyle: "short"});

const formatDate = (dateStr) => {
  return new Date(`${dateStr}/1970`).toLocaleDateString([lang], {month: "short", day: "numeric"});
};

const changeLang = l => { lang = l; render(); };

const cellClass = highlight => `class="border text-center align-middle${highlight ? " highlight" : ""}"`;

const JAPAN_OFFSET = +9;
const d = getDateInOffset(JAPAN_OFFSET); //Japan Time
const half = d.getDate() <= 15 ? 1 : 2;
const month = d.getMonth();
const time = serviceTimes[month];

const { languages, language } = navigator;
let lang = ((languages && languages[0]) || language).split("-")[0];

const langMap = {
  en: "🇺🇸",
  ja: "🇯🇵",
}

const renderLangSelect = () => (
  langSelect.innerHTML = Object.keys(langMap).map(lg => (
    `<button class="btn btn-${lang === lg ? "primary" : "secondary"}" onclick="changeLang('${lg}')">${langMap[lg]}</button>`
  )).join("")
);

const renderEventsTable = () => {
  renderEventsTableSide(true);
  renderEventsTableSide();
};

const renderEventsTableSide = isLeft => {
  const className = isLeft ? "left" : "right";
  const parentDiv = document.getElementById("events");
  const div = parentDiv.getElementsByClassName(className)[0];
  div.innerHTML = `<table class="table"><thead>
    <tr>${["Date", "Time", "Event"].map(s =>`<th class="text-center">${trans(s)}</th>`).join("")}</tr>
  </thead>
  <tbody></tbody></table>`;
  const tbody = div.getElementsByTagName("tbody")[0];
  const half = Math.ceil(annualEvents.length / 2) - 1
  tbody.innerHTML = annualEvents.map((event, i) => (
    ((isLeft && i <= half) || (!isLeft && i > half)) ? `<tr>
    <td class="border text-center align-middle text-nowrap">${formatDate(event.date)}</td>
    <td class="border text-center align-middle text-nowrap">${formatTime(event.time)}</td>
    <td class="border align-middle">${trans(event.event)}</td>
    </tr>` : "")).join("");
};

const renderTimeTable = () => {
  renderTimeTableSide(true);
  renderTimeTableSide(false);
};

const renderTimeTableSide = isLeft => {
  const className = isLeft ? "left" : "right";
  const parentDiv = document.getElementById("serviceTimes");
  const div = parentDiv.getElementsByClassName(className)[0];
  div.innerHTML = `<table class="table"><thead>
    <tr>
      ${["Month", "Morning", "Evening"].map(s =>(
        `<th class="text-center">${trans(s)}</th>`
      )).join("")}
    </tr>
  </thead>
  <tbody></tbody></table>`;
  const tbody = div.getElementsByTagName("tbody")[0];
  tbody.innerHTML = getHalfYear(isLeft);
};

const getHalfYear = showFirstHalf => serviceTimes.map((time, i) => {
  if ((!showFirstHalf && i < 6) || (showFirstHalf && i >= 6)) return;
  const { asa1, yuz1, asa2, yuz2 } = time;
  const asaIsSame = asa1 === asa2;
  const yuzIsSame = yuz1 === yuz2;
  const bothIsSame = asaIsSame && yuzIsSame;
  const isMonth = month === i;
  const isFirstHalf = isMonth && half === 1;
  const isSecondHalf = isMonth && half === 2;
  return (`
    <tr>
      <td rowspan="${bothIsSame ? 1 : 2}" ${cellClass(isMonth)}>${i + 1}</td>
      <td rowspan="${!bothIsSame && asaIsSame ? 2 : 1}" ${cellClass(isFirstHalf)}>${formatTime(asa1)}</td>
      <td rowspan="${!bothIsSame && yuzIsSame ? 2 : 1}" ${cellClass(isSecondHalf)}>${formatTime(yuz1)}</td>
    </tr>
    ${bothIsSame ? '' : `<tr>
      ${asaIsSame ? '' : `<td ${cellClass(isFirstHalf)}>${formatTime(asa2)}</td>`}
      ${yuzIsSame ? '' : `<td ${cellClass(isSecondHalf)}>${formatTime(yuz2)}</td>`}
    </tr>
  `}`);
}).join("");

const renderTimes = (label, time, half) => (`<div class="col" style="width: 300px">
  <strong class="text-primary">${trans(label)} </strong>
  <div class="text-nowrap"><strong>${trans("Morning")} ${trans("Service")}:</strong> ${formatTime(time["asa" + half])}</div>
  <div class="text-nowrap"><strong>${trans("Evening")} ${trans("Service")}:</strong> ${formatTime(time["yuz" + half])}</div>
</div>`);

const renderServiceTimes = () => currentTime.innerHTML = (
  `<div class="row">
    ${renderTimes("Current", time, half)}
    ${renderTimes("Next", half === 2 ? serviceTimes[month + 1 % 12] : time, half === 2 ? 1 : 2)}
  </div>
  <div><strong>${trans("Japan Time")}:</strong> <span id="japanClock">${d.toLocaleString(lang)}</span></div>`
);
const renderUpcomingEvent = () => {
  const nextEvent = findUpcomingEvent();
  const { event, date, time } = nextEvent;
  upcomingEvent.innerHTML = nextEvent ? (
    `<b class="d-block">${trans("Next")} ${trans("Event")}:</b> ${trans(event)}<br/>${formatDate(date)} ${formatTime(time)}`
  ) : "No last event";
};

const findUpcomingEvent = () => {
  const month = d.getMonth();
  const day = d.getDate();
  const size = annualEvents.length;
  let lastEvent = false;
  for (let i = 0; i < size; i++) {
    if (lastEvent) continue;
    const [lastMonth, lastDay] = annualEvents[i].date.split("/");
    if (parseInt(lastMonth) > month && parseInt(lastDay) > day) lastEvent = annualEvents[i];
  }
  return lastEvent;
};

const render = () => {
  title.innerHTML = `⏲ ${trans("Tenrikyo Service Times")}`;
  document.title = trans("Tenrikyo Service Times");
  renderServiceTimes();
  renderUpcomingEvent();
  renderTimeTable();
  renderEventsTable();
  renderLangSelect();
  Array.from(document.getElementsByClassName("trans")).map(elem => elem.innerHTML = trans(elem.title));
};
initEvents();
render();